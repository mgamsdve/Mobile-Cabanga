import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";

import { getProfiles } from "@/api/cabangaApi";
import {
  buildAuthorizationUrl,
  clearStoredSession,
  exchangeAuthorizationCode,
  saveStoredSession,
} from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateNonce,
  generateState,
} from "@/utils/pkce";

function parseRedirectFragment(url: string) {
  const [baseUrl, fragment = ""] = url.split("#");
  const params = new URLSearchParams(fragment);

  return {
    baseUrl,
    state: params.get("state"),
    sessionState: params.get("session_state"),
    code: params.get("code"),
    error: params.get("error"),
    errorDescription: params.get("error_description"),
  };
}

function pickPrimaryStudent(profiles: Awaited<ReturnType<typeof getProfiles>>) {
  return (
    profiles.find((profile) => profile.student || profile.type === "STUDENT") ??
    profiles[0] ??
    null
  );
}

export function LoginScreen() {
  const webViewRef = useRef<WebView>(null);
  const isHandlingRedirectRef = useRef(false);

  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
  const [expectedState, setExpectedState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [exchanging, setExchanging] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const setProfile = useAuthStore((state) => state.setProfile);

  const screenTitle = useMemo(() => "Connexion Cabanga", []);

  useEffect(() => {
    let isMounted = true;

    async function prepareLogin() {
      setInitializing(true);
      setError(null);
      isHandlingRedirectRef.current = false;

      try {
        const verifier = generateCodeVerifier();
        const challenge = await generateCodeChallenge(verifier);
        const state = generateState();
        const nonce = generateNonce();
        const nextUrl = buildAuthorizationUrl({
          state,
          nonce,
          codeChallenge: challenge,
        });

        if (!isMounted) {
          return;
        }

        setCodeVerifier(verifier);
        setExpectedState(state);
        setAuthUrl(nextUrl);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Impossible d'initialiser la connexion Cabanga.",
        );
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    }

    prepareLogin();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const finalizeLogin = async (authorizationCode: string) => {
    if (!codeVerifier) {
      throw new Error("Code verifier PKCE manquant.");
    }

    const tokens = await exchangeAuthorizationCode(authorizationCode, codeVerifier);

    await saveStoredSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      idToken: tokens.id_token,
    });

    useAuthStore.setState({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      isAuthenticated: false,
      isBootstrapping: false,
      loginLoading: false,
    });

    try {
      const profiles = await getProfiles();
      const profile = pickPrimaryStudent(profiles);

      if (!profile) {
        throw new Error("Aucun profil étudiant Cabanga trouvé.");
      }

      setProfile(profile);
      useAuthStore.setState({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        isAuthenticated: true,
        isBootstrapping: false,
        loginLoading: false,
      });
    } catch (caughtError) {
      await clearStoredSession();
      await useAuthStore.getState().logout();
      throw caughtError instanceof Error
        ? caughtError
        : new Error("Connexion réussie, mais récupération du profil impossible.");
    }
  };

  const handleNavigation = async (navigationState: WebViewNavigation) => {
    const url = navigationState.url;

    if (!url || isHandlingRedirectRef.current) {
      return;
    }

    const isCabangaRedirect =
      url.startsWith("https://app.cabanga.be/#") ||
      url.startsWith("https://app.cabanga.be/app#");

    if (!isCabangaRedirect) {
      return;
    }

    const redirect = parseRedirectFragment(url);

    if (!redirect.code && !redirect.error) {
      return;
    }

    isHandlingRedirectRef.current = true;
    webViewRef.current?.stopLoading();
    setExchanging(true);
    setError(null);

    try {
      if (redirect.error) {
        throw new Error(
          redirect.errorDescription
            ? `Cabanga a refusé la connexion: ${redirect.errorDescription}`
            : `Cabanga a refusé la connexion: ${redirect.error}`,
        );
      }

      if (!redirect.state || redirect.state !== expectedState) {
        throw new Error("État OAuth invalide retourné par Cabanga.");
      }

      if (!redirect.code) {
        throw new Error("Code d'autorisation introuvable dans la redirection Cabanga.");
      }

      await finalizeLogin(redirect.code);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Erreur inconnue pendant la connexion Cabanga.",
      );
      isHandlingRedirectRef.current = false;
    } finally {
      setExchanging(false);
    }
  };

  const handleRetry = () => {
    setReloadKey((current) => current + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.wordmark}>
          <Text style={styles.wordmarkText}>CABANGA</Text>
        </View>
        <Text style={styles.title}>{screenTitle}</Text>
        <Text style={styles.subtitle}>Connecte-toi via la page officielle Cabanga</Text>
      </View>

      <View style={styles.webviewShell}>
        {initializing ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={Colors.AccentBlue} size="small" />
            <Text style={styles.helperText}>Préparation de la connexion sécurisée…</Text>
          </View>
        ) : authUrl ? (
          <>
            <WebView
              key={reloadKey}
              ref={webViewRef}
              source={{ uri: authUrl }}
              onNavigationStateChange={(state) => {
                void handleNavigation(state);
              }}
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              startInLoadingState
              renderLoading={() => (
                <View style={styles.centeredState}>
                  <ActivityIndicator color={Colors.AccentBlue} size="small" />
                </View>
              )}
            />

            {exchanging ? (
              <View style={styles.exchangeOverlay}>
                <ActivityIndicator color={Colors.AccentBlue} size="small" />
                <Text style={styles.exchangeText}>Validation de la connexion Cabanga…</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.centeredState}>
            <Text style={styles.helperText}>Impossible d’ouvrir la page de connexion.</Text>
          </View>
        )}
      </View>

      {error ? (
        <View style={styles.footer}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Relancer la connexion</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  header: {
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space2,
    paddingBottom: Spacing.space3,
    gap: Spacing.space2,
  },
  wordmark: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.xl,
    backgroundColor: Colors.AccentBlueSoft,
  },
  wordmarkText: {
    ...Typography.Label,
    color: Colors.AccentBlue,
    fontSize: 14,
  },
  title: {
    ...Typography.H2,
    color: Colors.TextPrimary,
  },
  subtitle: {
    ...Typography.Body,
    color: Colors.TextSecondary,
  },
  webviewShell: {
    flex: 1,
    marginHorizontal: Spacing.space4,
    marginBottom: Spacing.space3,
    overflow: "hidden",
    borderRadius: Radius.lg,
    backgroundColor: Colors.Surface,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.space2,
    paddingHorizontal: Spacing.space5,
  },
  helperText: {
    ...Typography.Body,
    color: Colors.TextSecondary,
    textAlign: "center",
  },
  exchangeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.space2,
    paddingHorizontal: Spacing.space5,
  },
  exchangeText: {
    ...Typography.Body,
    color: Colors.TextPrimary,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: Spacing.space4,
    paddingBottom: Spacing.space4,
    gap: Spacing.space3,
  },
  error: {
    ...Typography.Caption,
    color: Colors.Danger,
    textAlign: "center",
  },
  retryButton: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.AccentBlueSoft,
  },
  retryText: {
    ...Typography.Label,
    color: Colors.AccentBlue,
  },
});
