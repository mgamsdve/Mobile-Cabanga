import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export interface CabangaProfile {
  id: number;
  firstName: string;
  lastName: string;
  schoolId: string;
  schoolName?: string;
  email?: string;
  type?: string;
  parent?: boolean;
  student?: boolean;
  staffMember?: boolean;
}

export interface DiaryEntry {
  attributionId?: number;
  date: string;
  hour: string;
  lessonName: string;
  lessonSubject: string;
  homework?: string;
  homeworkDone: boolean;
  id: number;
}

export interface HolidayPeriod {
  id?: string | number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface ScheduleBlockData {
  id: string;
  day: number;
  startTime: string;
  endTime: string;
  subject: string;
  room?: string;
  isBreak?: boolean;
}

interface ApiConfig {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  onUnauthorized: () => Promise<void> | void;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const apiClient = axios.create({
  baseURL: "https://api.scolares.be/cabanga/api",
  timeout: 10000,
});

let apiConfig: ApiConfig = {
  getAccessToken: () => null,
  refreshAccessToken: async () => null,
  onUnauthorized: async () => undefined,
};

let refreshPromise: Promise<string | null> | null = null;

function extractErrorDetail(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const detail =
    record.message ??
    record.error_description ??
    record.error ??
    record.detail;

  return typeof detail === "string" ? detail : null;
}

function formatApiError(error: unknown, fallbackMessage: string): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error(fallbackMessage);
  }

  const status = error.response?.status;
  const detail = extractErrorDetail(error.response?.data);

  if (!error.response) {
    return new Error(`Erreur réseau Cabanga: ${error.message}`);
  }

  return new Error(
    detail
      ? `${fallbackMessage} (HTTP ${status ?? "inconnu"}): ${detail}`
      : `${fallbackMessage} (HTTP ${status ?? "inconnu"}).`,
  );
}

export function configureApiClient(config: ApiConfig) {
  apiConfig = config;
}

apiClient.interceptors.request.use((config) => {
  const token = apiConfig.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableConfig | undefined;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      refreshPromise ??= apiConfig.refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const nextAccessToken = await refreshPromise;

      if (nextAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return apiClient(originalRequest);
      }
    }

    if (status === 401 || status === 403) {
      await apiConfig.onUnauthorized();
    }

    return Promise.reject(error);
  },
);

export async function getProfiles() {
  try {
    const response = await apiClient.get<CabangaProfile[]>("/profiles");
    return response.data;
  } catch (error) {
    throw formatApiError(error, "Impossible de récupérer le profil Cabanga");
  }
}

export async function getDiary(params: {
  schoolId: string;
  studentId: number | string;
  from: string;
  to: string;
}) {
  const response = await apiClient.get<DiaryEntry[]>(
    `/schools/${params.schoolId}/students/${params.studentId}/diary`,
    {
      params: {
        from: params.from,
        to: params.to,
      },
    },
  );

  return [...response.data].sort((left, right) => {
    if (left.date === right.date) {
      return left.hour.localeCompare(right.hour);
    }

    return left.date.localeCompare(right.date);
  });
}

export async function getSchedule(params: { schoolId: string; year: number }) {
  const response = await apiClient.get<unknown>(`/schools/${params.schoolId}/schedules/${params.year}`);
  return response.data;
}

export async function getHolidays(params: { schoolId: string; year: number }) {
  const response = await apiClient.get<HolidayPeriod[] | { holidays?: HolidayPeriod[] }>(
    `/schools/${params.schoolId}/holidays`,
    {
      params: {
        year: params.year,
      },
    },
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.holidays ?? [];
}

function parseDayValue(value: unknown): number | null {
  if (typeof value === "number" && value >= 1 && value <= 5) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    const mapping: Record<string, number> = {
      monday: 1,
      lundi: 1,
      lun: 1,
      tuesday: 2,
      mardi: 2,
      mar: 2,
      wednesday: 3,
      mercredi: 3,
      mer: 3,
      thursday: 4,
      jeudi: 4,
      jeu: 4,
      friday: 5,
      vendredi: 5,
      ven: 5,
    };

    return mapping[normalized] ?? null;
  }

  return null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function buildEndTime(startTime: string) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + 50;
  const endHours = Math.floor(endMinutes / 60);
  const remainingMinutes = endMinutes % 60;
  return `${`${endHours}`.padStart(2, "0")}:${`${remainingMinutes}`.padStart(2, "0")}`;
}

export function normalizeScheduleResponse(data: unknown): ScheduleBlockData[] {
  const results: ScheduleBlockData[] = [];

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!value || typeof value !== "object") {
      return;
    }

    const record = value as Record<string, unknown>;
    const directDay =
      parseDayValue(record.day) ??
      parseDayValue(record.weekday) ??
      parseDayValue(record.dayOfWeek) ??
      parseDayValue(record.name);

    if (directDay && (record.subject || record.lessonName || record.course || record.name)) {
      const startTime =
        getString(record.startTime) ||
        getString(record.hour) ||
        getString(record.start) ||
        getString(record.from);
      const endTime =
        getString(record.endTime) ||
        getString(record.end) ||
        getString(record.to) ||
        (startTime ? buildEndTime(startTime) : "");
      const subject =
        getString(record.subject) ||
        getString(record.lessonName) ||
        getString(record.course) ||
        getString(record.name);

      if (startTime && subject) {
        results.push({
          id:
            `${directDay}-${startTime}-${subject}-${getString(record.room) || ""}` ||
            `${directDay}-${startTime}`,
          day: directDay,
          startTime,
          endTime: endTime || buildEndTime(startTime),
          subject,
          room: getString(record.room) || getString(record.classroom) || undefined,
          isBreak: Boolean(record.break),
        });
      }
    }

    Object.values(record).forEach(visit);
  };

  visit(data);

  return results.sort((left, right) => {
    if (left.day === right.day) {
      return left.startTime.localeCompare(right.startTime);
    }

    return left.day - right.day;
  });
}
