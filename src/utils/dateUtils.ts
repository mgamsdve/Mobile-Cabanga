const LONG_DAY_FORMATTER = new Intl.DateTimeFormat("fr-BE", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const SHORT_MONTH_FORMATTER = new Intl.DateTimeFormat("fr-BE", {
  day: "numeric",
  month: "short",
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-BE", {
  month: "short",
});

const SHORT_DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayIso(): string {
  return toIsoDate(new Date());
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function cleanShortMonth(value: string): string {
  return value.replace(/\.$/, "");
}

export function addDays(isoDate: string, amount: number): string {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + amount);
  return toIsoDate(date);
}

export function formatDayLabel(isoDate: string): string {
  return capitalize(LONG_DAY_FORMATTER.format(parseIsoDate(isoDate)).replace(".", ""));
}

export function formatShortDate(isoDate: string): string {
  return cleanShortMonth(SHORT_MONTH_FORMATTER.format(parseIsoDate(isoDate)));
}

export function formatWeekLabel(mondayISO: string, fridayISO: string): string {
  const monday = parseIsoDate(mondayISO);
  const friday = parseIsoDate(fridayISO);
  const sameMonth = monday.getMonth() === friday.getMonth();
  const mondayMonth = cleanShortMonth(MONTH_FORMATTER.format(monday));
  const fridayMonth = cleanShortMonth(MONTH_FORMATTER.format(friday));
  const fridayYear = friday.getFullYear();

  if (sameMonth) {
    return `${monday.getDate()}-${friday.getDate()} ${fridayMonth} ${fridayYear}`;
  }

  return `${monday.getDate()} ${mondayMonth} - ${friday.getDate()} ${fridayMonth} ${fridayYear}`;
}

export function getMondayOfWeek(date: Date): string {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  const day = target.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  target.setDate(target.getDate() + diff);
  return toIsoDate(target);
}

export function getFridayOfWeek(date: Date): string {
  return addDays(getMondayOfWeek(date), 4);
}

export function daysUntil(isoDate: string): number {
  const today = parseIsoDate(getTodayIso());
  const target = parseIsoDate(isoDate);
  const diff = target.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function isToday(isoDate: string): boolean {
  return isoDate === getTodayIso();
}

export function getShortDayLabel(isoDate: string): string {
  return SHORT_DAY_LABELS[parseIsoDate(isoDate).getDay()];
}

export function formatHour(hour: string): string {
  return hour;
}

export function getWeekDates(mondayISO: string): string[] {
  return Array.from({ length: 5 }, (_, index) => addDays(mondayISO, index));
}

export function getAcademicYear(date = new Date()): number {
  const month = date.getMonth() + 1;
  return month >= 7 ? date.getFullYear() : date.getFullYear() - 1;
}

export function getCurrentWeekRange(date = new Date()) {
  const monday = getMondayOfWeek(date);
  return {
    monday,
    friday: addDays(monday, 4),
  };
}

export function getNextSchoolDay(isoDate: string): string {
  let next = addDays(isoDate, 1);

  while ([0, 6].includes(parseIsoDate(next).getDay())) {
    next = addDays(next, 1);
  }

  return next;
}

export function compareIsoDates(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
}

export function getInitialSelectedWeekday(mondayISO: string): number {
  const weekDates = getWeekDates(mondayISO);
  const todayIndex = weekDates.findIndex((date) => isToday(date));
  return todayIndex >= 0 ? todayIndex : 0;
}
