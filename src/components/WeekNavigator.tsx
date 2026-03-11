import { Pressable, StyleSheet, Text, View } from "react-native";

import { Spacing, Typography, useAppTheme } from "@/theme";

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
  const theme = useAppTheme();
  const labelColor =
    tone === "current" ? theme.AccentBlue : tone === "past" ? theme.TextSecondary : theme.TextPrimary;

  return (
    <View style={[styles.container, { backgroundColor: theme.Background, borderBottomColor: theme.Border }]}>
      <Pressable hitSlop={12} onPress={onPrevWeek}>
        <Text style={[styles.chevron, { color: theme.TextPrimary }]}>‹</Text>
      </Pressable>
      <Pressable style={styles.center} onPress={onGoToToday}>
        <Text style={[styles.label, { color: labelColor }]}>Semaine du {weekLabel}</Text>
      </Pressable>
      {isCurrentWeek ? (
        <Pressable hitSlop={12} onPress={onNextWeek}>
          <Text style={[styles.chevron, { color: theme.TextPrimary }]}>›</Text>
        </Pressable>
      ) : (
        <View style={styles.rightArea}>
          <Pressable hitSlop={12} onPress={onGoToToday}>
            <Text style={[styles.todayLink, { color: theme.AccentBlue }]}>Aujourd'hui</Text>
          </Pressable>
          <Pressable hitSlop={12} onPress={onNextWeek}>
            <Text style={[styles.chevron, { color: theme.TextPrimary }]}>›</Text>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    lineHeight: 28,
  },
  rightArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space3,
  },
  todayLink: {
    ...Typography.Caption,
    fontWeight: "600",
  },
});
