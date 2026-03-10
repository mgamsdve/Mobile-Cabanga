import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors, Spacing, Typography } from "@/theme";

interface WeekNavigatorProps {
  weekLabel: string;
  isCurrentWeek: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToToday: () => void;
  tone?: "past" | "current" | "future";
}

export function WeekNavigator({
  weekLabel,
  isCurrentWeek,
  onPrevWeek,
  onNextWeek,
  onGoToToday,
  tone = "future",
}: WeekNavigatorProps) {
  const labelColor =
    tone === "current"
      ? Colors.AccentBlue
      : tone === "past"
        ? Colors.TextSecondary
        : Colors.TextPrimary;

  return (
    <View style={styles.container}>
      <Pressable hitSlop={12} onPress={onPrevWeek}>
        <Text style={styles.chevron}>‹</Text>
      </Pressable>
      <Pressable style={styles.center} onPress={onGoToToday}>
        <Text style={[styles.label, { color: labelColor }]}>Semaine du {weekLabel}</Text>
      </Pressable>
      {isCurrentWeek ? (
        <Pressable hitSlop={12} onPress={onNextWeek}>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ) : (
        <View style={styles.rightArea}>
          <Pressable hitSlop={12} onPress={onGoToToday}>
            <Text style={styles.todayLink}>Aujourd'hui</Text>
          </Pressable>
          <Pressable hitSlop={12} onPress={onNextWeek}>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.space4,
    backgroundColor: Colors.Background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.Border,
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    ...Typography.BodyMedium,
  },
  chevron: {
    fontSize: 28,
    color: Colors.TextPrimary,
    lineHeight: 28,
  },
  rightArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space3,
  },
  todayLink: {
    ...Typography.Caption,
    color: Colors.AccentBlue,
    fontWeight: "600",
  },
});
