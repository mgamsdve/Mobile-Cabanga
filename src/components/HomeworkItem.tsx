import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors, Radius, Spacing, Typography } from "@/theme";

interface HomeworkItemProps {
  subject: string;
  text: string;
  isDone: boolean;
  isUrgent?: boolean;
  onToggleDone: () => void;
}

export function HomeworkItem({
  subject,
  text,
  isDone,
  isUrgent = false,
  onToggleDone,
}: HomeworkItemProps) {
  return (
    <View style={styles.wrapper}>
      {isUrgent ? <View style={styles.urgentDot} /> : null}
      <Pressable style={styles.container} onPress={onToggleDone}>
        <View style={[styles.checkbox, isDone ? styles.checkboxDone : null]}>
          {isDone ? <Text style={styles.checkboxMark}>✓</Text> : null}
        </View>
        <View style={styles.content}>
          <Text style={styles.subject}>{subject.toUpperCase()}</Text>
          <Text style={[styles.text, isDone ? styles.textDone : null]}>{text}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.space4,
    marginBottom: Spacing.space2,
    position: "relative",
  },
  urgentDot: {
    position: "absolute",
    left: -2,
    top: 22,
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.Warning,
    zIndex: 1,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space3,
    backgroundColor: Colors.Surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space3,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.BorderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.Surface,
  },
  checkboxDone: {
    backgroundColor: Colors.Success,
    borderColor: Colors.Success,
  },
  checkboxMark: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  subject: {
    ...Typography.Label,
    color: Colors.TextPrimary,
    textTransform: "uppercase",
  },
  text: {
    ...Typography.Body,
    color: Colors.TextSecondary,
  },
  textDone: {
    textDecorationLine: "line-through",
    color: Colors.TextTertiary,
  },
});
