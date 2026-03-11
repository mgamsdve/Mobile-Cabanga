import { StyleSheet, Text, View } from "react-native";

import { Spacing, Typography, useAppTheme } from "@/theme";
import { formatDayLabel } from "@/utils/dateUtils";

interface DayHeaderProps {
  date: string;
  isToday: boolean;
}

export function DayHeader({ date, isToday }: DayHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: theme.TextSecondary }]}>
        {formatDayLabel(date)}
        {isToday ? <Text style={[styles.today, { color: theme.AccentBlue }]}> - Aujourd'hui</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: Spacing.space4,
  },
  text: {
    ...Typography.Label,
  },
  today: {},
});
