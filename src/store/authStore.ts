import Toast from "react-native-toast-message";
import { create } from "zustand";

import {
  CabangaProfile,
  configureApiClient,
  getProfiles,
} from "@/api/cabangaApi";
import {
  clearStoredSession,
  loadStoredSession,
  loginWithPassword,
  refreshWithToken,
  saveStoredSession,
} from "@/api/auth";
import { useDiaryStore } from "@/store/diaryStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useUiStore } from "@/store/uiStore";

export interface UserProfile extends CabangaProfile {
  email?: string;
}

interface LogoutOptions {
  showToast?: boolean;
}

interface AuthStoreState {
  accessToken: string | null;
  refreshToken: string | null;
  studentId: number | null;
  schoolId: string | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  loginLoading: boolean;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: (options?: LogoutOptions) => Promise<void>;
  refreshSession: () => Promise<string | null>;
  setProfile: (profile: UserProfile | null) => void;
}

function pickPrimaryStudent(profiles: CabangaProfile[]) {
  return (
    profiles.find((profile) => profile.student || profile.type === "STUDENT") ??
    profiles[0] ??
    null
  );
}

async function fetchResolvedProfile(userEmail: string | null) {
  const profiles = await getProfiles();
  const profile = pickPrimaryStudent(profiles);

  if (!profile) {
    throw new Error("Aucun profil étudiant trouvé.");
  }

  return {
    ...profile,
    email: profile.email ?? userEmail ?? undefined,
  };
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  studentId: null,
  schoolId: null,
  userProfile: null,
  isAuthenticated: false,
  isBootstrapping: true,
  loginLoading: false,
  bootstrap: async () => {
    set({ isBootstrapping: true });

    try {
      const storedSession = await loadStoredSession();

      set({
        accessToken: storedSession.accessToken,
        refreshToken: storedSession.refreshToken,
      });

      if (!storedSession.refreshToken) {
        set({ isAuthenticated: false, isBootstrapping: false });
        return;
      }

      const accessToken = await get().refreshSession();

      if (!accessToken) {
        set({ isAuthenticated: false, isBootstrapping: false });
        return;
      }

      const profile = await fetchResolvedProfile(storedSession.userEmail);

      set({
        studentId: profile.id,
        schoolId: profile.schoolId,
        userProfile: profile,
        isAuthenticated: true,
        isBootstrapping: false,
      });
    } catch {
      await get().logout();
      set({ isBootstrapping: false });
    }
  },
  login: async (email, password) => {
    set({ loginLoading: true });

    try {
      const tokens = await loginWithPassword(email, password);

      set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });

      await saveStoredSession({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        userEmail: email,
      });

      const profile = await fetchResolvedProfile(email);

      set({
        studentId: profile.id,
        schoolId: profile.schoolId,
        userProfile: profile,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error instanceof Error ? error : new Error("Erreur inconnue pendant la connexion.");
    } finally {
      set({ loginLoading: false, isBootstrapping: false });
    }
  },
  logout: async (options) => {
    await clearStoredSession();
    useUiStore.getState().resetUi();
    useDiaryStore.getState().reset();
    useScheduleStore.getState().reset();

    set({
      accessToken: null,
      refreshToken: null,
      studentId: null,
      schoolId: null,
      userProfile: null,
      isAuthenticated: false,
      loginLoading: false,
    });

    if (options?.showToast) {
      Toast.show({
        type: "info",
        text1: "Session expirée",
      });
    }
  },
  refreshSession: async () => {
    const currentRefreshToken = get().refreshToken;
    const currentEmail = get().userProfile?.email ?? (await loadStoredSession()).userEmail;

    if (!currentRefreshToken) {
      return null;
    }

    try {
      const tokens = await refreshWithToken(currentRefreshToken);

      set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });

      await saveStoredSession({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        userEmail: currentEmail,
      });

      return tokens.access_token;
    } catch {
      await get().logout({ showToast: true });
      return null;
    }
  },
  setProfile: (profile) =>
    set({
      userProfile: profile,
      studentId: profile?.id ?? null,
      schoolId: profile?.schoolId ?? null,
    }),
}));

configureApiClient({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken: () => useAuthStore.getState().refreshSession(),
  onUnauthorized: () => useAuthStore.getState().logout({ showToast: true }),
});
