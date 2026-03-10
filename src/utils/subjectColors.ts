const SUBJECT_PALETTE = [
  "#3B7BF8",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#06B6D4",
  "#EF4444",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

export function getSubjectColor(name: string): string {
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % SUBJECT_PALETTE.length;
  }

  return SUBJECT_PALETTE[Math.abs(hash)];
}

export function getTintedSubjectColor(name: string, alpha = 0.12): string {
  const color = getSubjectColor(name).replace("#", "");
  const value = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");

  return `#${color}${value}`;
}
