import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DiaryEntry, getDiary } from "@/api/cabangaApi";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { addDays, getCurrentWeekRange, getInitialSelectedWeekday, getWeekDates } from "@/utils/dateUtils";

export interface WeekData {
  mondayISO: string;
  fridayISO: string;
  days: Record<string, DiaryEntry[]>;
  fetchedAt: number;
}

interface DiaryStoreState {
  weeksCache: Record<string, WeekData>;
  currentWeek: string;
  selectedDay: string;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchWeek: (weekStart: string, options?: { force?: boolean; keepSelectedDay?: boolean }) => Promise<WeekData | null>;
  setSelectedDay: (date: string) => void;
  refreshWeek: () => Promise<WeekData | null>;
  clearCache: () => Promise<void>;
  reset: () => void;
}

function createEmptyWeek(weekStart: string): WeekData {
  const weekDates = getWeekDates(weekStart);
  const days = Object.fromEntries(weekDates.map((date) => [date, []])) as Record<string, DiaryEntry[]>;

  return {
    mondayISO: weekStart,
    fridayISO: addDays(weekStart, 4),
    days,
    fetchedAt: 0,
  };
}

function buildWeekData(weekStart: string, entries: DiaryEntry[]) {
  const weekData = createEmptyWeek(weekStart);

  entries.forEach((entry) => {
    if (!weekData.days[entry.date]) {
      weekData.days[entry.date] = [];
    }

    weekData.days[entry.date].push(entry);
  });

  Object.values(weekData.days).forEach((dayEntries) =>
    dayEntries.sort((left, right) => left.hour.localeCompare(right.hour)),
  );

  return {
    ...weekData,
    fetchedAt: Date.now(),
  };
}

const currentWeekRange = getCurrentWeekRange();

export const useDiaryStore = create<DiaryStoreState>()(
  persist(
    (set, get) => ({
      weeksCache: {},
      currentWeek: currentWeekRange.monday,
      selectedDay: getWeekDates(currentWeekRange.monday)[getInitialSelectedWeekday(currentWeekRange.monday)],
      loading: false,
      refreshing: false,
      error: null,
      fetchWeek: async (weekStart, options) => {
        const cachedWeek = get().weeksCache[weekStart];
        const nextSelectedDay =
          options?.keepSelectedDay && get().selectedDay.startsWith(weekStart.slice(0, 7))
            ? get().selectedDay
            : getWeekDates(weekStart)[getInitialSelectedWeekday(weekStart)];

        set({
          currentWeek: weekStart,
          selectedDay: nextSelectedDay,
          loading: !cachedWeek,
          refreshing: Boolean(options?.force && cachedWeek),
          error: null,
        });

        if (cachedWeek && !options?.force) {
          return cachedWeek;
        }

        const authState = useAuthStore.getState();

        if (!authState.schoolId || !authState.studentId) {
          set({
            loading: false,
            refreshing: false,
            error: "Profil introuvable.",
          });
          return null;
        }

        try {
          const entries = await getDiary({
            schoolId: authState.schoolId,
            studentId: authState.studentId,
            from: weekStart,
            to: addDays(weekStart, 4),
          });
          const weekData = buildWeekData(weekStart, entries);

          set((state) => ({
            weeksCache: {
              ...state.weeksCache,
              [weekStart]: weekData,
            },
            loading: false,
            refreshing: false,
            error: null,
          }));

          useUiStore.getState().setOffline(false);
          return weekData;
        } catch {
          useUiStore.getState().setOffline(true);

          if (cachedWeek) {
            set({
              loading: false,
              refreshing: false,
              error: null,
            });
            return cachedWeek;
          }

          set({
            loading: false,
            refreshing: false,
            error: "Impossible de charger les données.",
          });
          return null;
        }
      },
      setSelectedDay: (date) => set({ selectedDay: date }),
      refreshWeek: async () => get().fetchWeek(get().currentWeek, { force: true }),
      clearCache: async () => {
        set({ weeksCache: {} });
        await AsyncStorage.removeItem("cabanga-diary-store");
      },
      reset: () =>
        set({
          weeksCache: {},
          currentWeek: currentWeekRange.monday,
          selectedDay: getWeekDates(currentWeekRange.monday)[getInitialSelectedWeekday(currentWeekRange.monday)],
          loading: false,
          refreshing: false,
          error: null,
        }),
    }),
    {
      name: "cabanga-diary-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        weeksCache: state.weeksCache,
        currentWeek: state.currentWeek,
        selectedDay: state.selectedDay,
      }),
    },
  ),
);
