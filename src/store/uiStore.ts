import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UiStoreState {
  localHomeworkOverrides: Record<string, boolean>;
  activeTab: string;
  isOffline: boolean;
  setHomeworkDone: (entryId: string | number, value: boolean) => void;
  toggleHomeworkDone: (entryId: string | number, fallback?: boolean) => boolean;
  setActiveTab: (tab: string) => void;
  setOffline: (offline: boolean) => void;
  clearHomeworkOverrides: () => void;
  resetUi: () => void;
}

export const useUiStore = create<UiStoreState>()(
  persist(
    (set, get) => ({
      localHomeworkOverrides: {},
      activeTab: "Diary",
      isOffline: false,
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
      clearHomeworkOverrides: () => set({ localHomeworkOverrides: {} }),
      resetUi: () =>
        set({
          localHomeworkOverrides: {},
          activeTab: "Diary",
          isOffline: false,
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
