import { StyleSheet, Text, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";
import { getTintedSubjectColor } from "@/utils/subjectColors";

interface ScheduleBlockProps {
  startTime: string;
  endTime: string;
  subject: string;
  room?: string;
}

function getMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function ScheduleBlock({ startTime, endTime, subject, room }: ScheduleBlockProps) {
  const durationMinutes = Math.max(50, getMinutes(endTime) - getMinutes(startTime));
  const height = Math.max(44, (durationMinutes / 60) * 56);

  return (
    <View style={styles.row}>
      <Text style={styles.time}>{startTime}</Text>
      <View style={[styles.block, { height, backgroundColor: getTintedSubjectColor(subject, 0.1) }]}>
        <Text style={styles.subject}>{subject.toUpperCase()}</Text>
        {room ? <Text style={styles.room}>{room}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.space3,
    paddingHorizontal: Spacing.space4,
    marginBottom: Spacing.space2,
  },
  time: {
    ...Typography.Mono,
    width: Spacing.space8,
    color: Colors.TextSecondary,
  },
  block: {
    flex: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space3,
    justifyContent: "center",
  },
  subject: {
    ...Typography.BodyMedium,
    color: Colors.TextPrimary,
    textTransform: "uppercase",
  },
  room: {
    ...Typography.Caption,
    color: Colors.TextTertiary,
    marginTop: 2,
  },
});
