import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  getHolidays,
  getSchedule,
  HolidayPeriod,
  normalizeScheduleResponse,
  ScheduleBlockData,
} from "@/api/cabangaApi";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { getAcademicYear } from "@/utils/dateUtils";

interface ScheduleStoreState {
  schedule: Record<number, ScheduleBlockData[]>;
  holidays: HolidayPeriod[];
  selectedDay: number;
  loading: boolean;
  holidaysLoading: boolean;
  error: string | null;
  scheduleFetchedAt: number | null;
  holidaysFetchedAt: number | null;
  fetchSchedule: (options?: { force?: boolean }) => Promise<void>;
  fetchHolidays: (options?: { force?: boolean }) => Promise<void>;
  setSelectedDay: (day: number) => void;
  clearCache: () => Promise<void>;
  reset: () => void;
}

function getDefaultSelectedDay() {
  const today = new Date().getDay();
  if (today >= 1 && today <= 5) {
    return today;
  }

  return 1;
}

function normalizeHolidays(value: HolidayPeriod[]) {
  return [...value].sort((left, right) => left.startDate.localeCompare(right.startDate));
}

export const useScheduleStore = create<ScheduleStoreState>()(
  persist(
    (set, get) => ({
      schedule: {},
      holidays: [],
      selectedDay: getDefaultSelectedDay(),
      loading: false,
      holidaysLoading: false,
      error: null,
      scheduleFetchedAt: null,
      holidaysFetchedAt: null,
      fetchSchedule: async (options) => {
        if (get().scheduleFetchedAt && !options?.force) {
          return;
        }

        const authState = useAuthStore.getState();

        if (!authState.schoolId) {
          set({ error: "École introuvable." });
          return;
        }

        set({ loading: true, error: null });

        try {
          const data = await getSchedule({
            schoolId: authState.schoolId,
            year: getAcademicYear(),
          });
          const normalized = normalizeScheduleResponse(data);
          const grouped = normalized.reduce<Record<number, ScheduleBlockData[]>>((accumulator, entry) => {
            accumulator[entry.day] ??= [];
            accumulator[entry.day].push(entry);
            return accumulator;
          }, {});

          set({
            schedule: grouped,
            loading: false,
            scheduleFetchedAt: Date.now(),
          });
          useUiStore.getState().setOffline(false);
        } catch {
          set({
            loading: false,
            error: "Impossible de charger l'emploi du temps.",
          });
          useUiStore.getState().setOffline(true);
        }
      },
      fetchHolidays: async (options) => {
        if (get().holidaysFetchedAt && !options?.force) {
          return;
        }

        const authState = useAuthStore.getState();

        if (!authState.schoolId) {
          set({ error: "École introuvable." });
          return;
        }

        set({ holidaysLoading: true, error: null });

        try {
          const data = await getHolidays({
            schoolId: authState.schoolId,
            year: getAcademicYear(),
          });

          set({
            holidays: normalizeHolidays(data),
            holidaysLoading: false,
            holidaysFetchedAt: Date.now(),
          });
          useUiStore.getState().setOffline(false);
        } catch {
          set({
            holidaysLoading: false,
            error: "Impossible de charger les congés.",
          });
          useUiStore.getState().setOffline(true);
        }
      },
      setSelectedDay: (day) => set({ selectedDay: day }),
      clearCache: async () => {
        set({
          schedule: {},
          holidays: [],
          scheduleFetchedAt: null,
          holidaysFetchedAt: null,
        });
        await AsyncStorage.removeItem("cabanga-schedule-store");
      },
      reset: () =>
        set({
          schedule: {},
          holidays: [],
          selectedDay: getDefaultSelectedDay(),
          loading: false,
          holidaysLoading: false,
          error: null,
          scheduleFetchedAt: null,
          holidaysFetchedAt: null,
        }),
    }),
    {
      name: "cabanga-schedule-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        schedule: state.schedule,
        holidays: state.holidays,
        selectedDay: state.selectedDay,
        scheduleFetchedAt: state.scheduleFetchedAt,
        holidaysFetchedAt: state.holidaysFetchedAt,
      }),
    },
  ),
);
