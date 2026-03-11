import { Pressable, StyleSheet, Text, View } from "react-native";

import { Radius, Spacing, Typography, useAppTheme } from "@/theme";

interface HomeworkItemProps {
  subject: string;
  text: string;
  isDone: boolean;
  isUrgent?: boolean;
  onPress: () => void;
}

export function HomeworkItem({
  subject,
  text,
  isDone,
  isUrgent = false,
  onPress,
}: HomeworkItemProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {isUrgent ? <View style={styles.urgentDot} /> : null}
      <Pressable style={[styles.container, { backgroundColor: theme.Surface }]} onPress={onPress}>
        <View style={styles.content}>
          <Text style={[styles.subject, { color: theme.TextPrimary }]}>{subject.toUpperCase()}</Text>
          <Text
            style={[
              styles.text,
              { color: theme.TextSecondary },
              isDone ? [styles.textDone, { color: theme.TextTertiary }] : null,
            ]}
          >
            {text}
          </Text>
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
    backgroundColor: "#F59E0B",
    zIndex: 1,
  },
  container: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space3,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  subject: {
    ...Typography.Label,
    textTransform: "uppercase",
  },
  text: {
    ...Typography.Body,
  },
  textDone: {
    textDecorationLine: "line-through",
  },
});
