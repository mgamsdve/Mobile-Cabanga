import axios from "axios";
import * as SecureStore from "expo-secure-store";

const REALM_BASE_URL = "https://login.scolares.be/auth/realms/horizon/protocol/openid-connect";
const AUTHORIZATION_ENDPOINT = `${REALM_BASE_URL}/auth`;
const TOKEN_ENDPOINT = `${REALM_BASE_URL}/token`;
const OAUTH_CLIENT_ID = "cabanga-frontend";
const AUTH_REDIRECT_URI = "https://app.cabanga.be/";
const TOKEN_REDIRECT_URI = "https://app.cabanga.be/";

const STORAGE_KEYS = {
  accessToken: "cabanga.accessToken",
  refreshToken: "cabanga.refreshToken",
  userEmail: "cabanga.userEmail",
  idToken: "cabanga.idToken",
} as const;

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: "Bearer";
  id_token?: string;
  session_state?: string;
  scope?: string;
}

export interface StoredSession {
  accessToken: string | null;
  refreshToken: string | null;
  userEmail: string | null;
  idToken: string | null;
}

function extractErrorDetail(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const detail =
    record.error_description ??
    record.error ??
    record.message ??
    record.detail;

  return typeof detail === "string" ? detail : null;
}

function formatAxiosError(error: unknown, fallbackMessage: string): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error(fallbackMessage);
  }

  const status = error.response?.status;
  const detail = extractErrorDetail(error.response?.data);

  if (!error.response) {
    return new Error(`Erreur réseau pendant la connexion Cabanga: ${error.message}`);
  }

  if (status === 400 || status === 401) {
    return new Error(detail ? `Connexion refusée par Cabanga: ${detail}` : "Connexion refusée par Cabanga.");
  }

  return new Error(
    detail
      ? `${fallbackMessage} (HTTP ${status ?? "inconnu"}): ${detail}`
      : `${fallbackMessage} (HTTP ${status ?? "inconnu"}).`,
  );
}

async function postTokenRequest(params: Record<string, string>) {
  const body = new URLSearchParams(params);

  try {
    const response = await axios.post<AuthTokenResponse>(TOKEN_ENDPOINT, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    throw formatAxiosError(error, "Échec de l'appel au serveur de connexion Cabanga");
  }
}

export function buildAuthorizationUrl(params: {
  state: string;
  nonce: string;
  codeChallenge: string;
}) {
  const url = new URL(AUTHORIZATION_ENDPOINT);

  url.searchParams.set("client_id", OAUTH_CLIENT_ID);
  url.searchParams.set("redirect_uri", AUTH_REDIRECT_URI);
  url.searchParams.set("response_mode", "fragment");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid");
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return url.toString();
}

export async function exchangeAuthorizationCode(code: string, codeVerifier: string) {
  return postTokenRequest({
    grant_type: "authorization_code",
    client_id: OAUTH_CLIENT_ID,
    code,
    redirect_uri: TOKEN_REDIRECT_URI,
    code_verifier: codeVerifier,
  });
}

export async function loginWithPassword(_username: string, _password: string): Promise<AuthTokenResponse> {
  throw new Error("Le login par mot de passe direct est désactivé. Utilise le flux OAuth WebView.");
}

export async function refreshWithToken(refreshToken: string) {
  return postTokenRequest({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: OAUTH_CLIENT_ID,
  });
}

export async function saveStoredSession(session: {
  accessToken: string;
  refreshToken: string;
  userEmail?: string | null;
  idToken?: string | null;
}) {
  await SecureStore.setItemAsync(STORAGE_KEYS.accessToken, session.accessToken);
  await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, session.refreshToken);

  if (session.userEmail) {
    await SecureStore.setItemAsync(STORAGE_KEYS.userEmail, session.userEmail);
  }

  if (session.idToken) {
    await SecureStore.setItemAsync(STORAGE_KEYS.idToken, session.idToken);
  }
}

export async function loadStoredSession(): Promise<StoredSession> {
  const [accessToken, refreshToken, userEmail, idToken] = await Promise.all([
    SecureStore.getItemAsync(STORAGE_KEYS.accessToken),
    SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
    SecureStore.getItemAsync(STORAGE_KEYS.userEmail),
    SecureStore.getItemAsync(STORAGE_KEYS.idToken),
  ]);

  return {
    accessToken,
    refreshToken,
    userEmail,
    idToken,
  };
}

export async function clearStoredSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
    SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
    SecureStore.deleteItemAsync(STORAGE_KEYS.userEmail),
    SecureStore.deleteItemAsync(STORAGE_KEYS.idToken),
  ]);
}
