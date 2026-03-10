import { StyleSheet, Text, View } from "react-native";

import { Colors, Spacing, Typography } from "@/theme";
import { formatDayLabel } from "@/utils/dateUtils";

interface DayHeaderProps {
  date: string;
  isToday: boolean;
}

export function DayHeader({ date, isToday }: DayHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {formatDayLabel(date)}
        {isToday ? <Text style={styles.today}> - Aujourd'hui</Text> : null}
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
    color: Colors.TextSecondary,
  },
  today: {
    color: Colors.AccentBlue,
  },
});
