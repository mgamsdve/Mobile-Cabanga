import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ThemeMode } from "@/theme/themes";

const APP_THEME_STORAGE_KEY = "app_theme";

interface UiStoreState {
  localHomeworkOverrides: Record<string, boolean>;
  activeTab: string;
  isOffline: boolean;
  themeMode: ThemeMode;
  themeReady: boolean;
  setHomeworkDone: (entryId: string | number, value: boolean) => void;
  toggleHomeworkDone: (entryId: string | number, fallback?: boolean) => boolean;
  setActiveTab: (tab: string) => void;
  setOffline: (offline: boolean) => void;
  loadThemePreference: () => Promise<void>;
  setThemeMode: (themeMode: ThemeMode) => Promise<void>;
  clearHomeworkOverrides: () => void;
  resetUi: () => void;
}

export const useUiStore = create<UiStoreState>()(
  persist(
    (set, get) => ({
      localHomeworkOverrides: {},
      activeTab: "Diary",
      isOffline: false,
      themeMode: "light",
      themeReady: false,
      setHomeworkDone: (entryId, value) =>
        set((state) => ({
          localHomeworkOverrides: {
            ...state.localHomeworkOverrides,
            [String(entryId)]: value,
          },
        })),
      toggleHomeworkDone: (entryId, fallback = false) => {
        const key = String(entryId);
        const nextValue = !(get().localHomeworkOverrides[key] ?? fallback);
        get().setHomeworkDone(key, nextValue);
        return nextValue;
      },
      setActiveTab: (tab) => set({ activeTab: tab }),
      setOffline: (offline) => set({ isOffline: offline }),
      loadThemePreference: async () => {
        const savedTheme = await AsyncStorage.getItem(APP_THEME_STORAGE_KEY);
        set({
          themeMode: savedTheme === "dark" ? "dark" : "light",
          themeReady: true,
        });
      },
      setThemeMode: async (themeMode) => {
        set({ themeMode });
        await AsyncStorage.setItem(APP_THEME_STORAGE_KEY, themeMode);
      },
      clearHomeworkOverrides: () => set({ localHomeworkOverrides: {} }),
      resetUi: () =>
        set({
          localHomeworkOverrides: {},
          activeTab: "Diary",
          isOffline: false,
          themeReady: true,
        }),
    }),
    {
      name: "cabanga-ui-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        localHomeworkOverrides: state.localHomeworkOverrides,
        activeTab: state.activeTab,
      }),
    },
  ),
);
