import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Radius, Spacing, Typography, useAppTheme } from "@/theme";
import { getSubjectColor } from "@/utils/subjectColors";

interface LessonCardProps {
  hour: string;
  lessonName: string;
  lessonSubject: string;
  homework?: string;
  homeworkDone: boolean;
  showTime: boolean;
  onPress: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function LessonCard({
  hour,
  lessonName,
  lessonSubject,
  homework,
  homeworkDone,
  showTime,
  onPress,
}: LessonCardProps) {
  const theme = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { stiffness: 300, damping: 20 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 300, damping: 20 });
      }}
      style={animatedStyle}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: homeworkDone ? theme.SurfaceDone : theme.Surface,
          },
        ]}
      >
        <View style={styles.timeColumn}>
          {showTime ? <Text style={[styles.time, { color: theme.TextSecondary }]}>{hour}</Text> : null}
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={[styles.subjectDot, { backgroundColor: getSubjectColor(lessonName) }]} />
            <Text style={[styles.subject, { color: theme.TextPrimary }]}>{lessonName.toUpperCase()}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.Border }]} />
          <Text
            style={[
              styles.description,
              { color: theme.TextSecondary },
              homeworkDone ? styles.descriptionDone : null,
            ]}
            numberOfLines={3}
          >
            {lessonSubject}
          </Text>
          {homework ? (
            <Text
              style={[
                styles.homework,
                { color: theme.TextTertiary },
                homeworkDone ? styles.descriptionDone : null,
              ]}
              numberOfLines={2}
            >
              {homework}
            </Text>
          ) : null}
          {homeworkDone ? (
            <View style={[styles.doneBadge, { backgroundColor: theme.SuccessSoft }]}>
              <Text style={[styles.doneLabel, { color: theme.Success }]}>✓ Fait</Text>
            </View>
          ) : null}
        </View>
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.space4,
    minHeight: 72,
    marginHorizontal: Spacing.space4,
    marginBottom: Spacing.space2,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space3,
    borderRadius: Radius.md,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  timeColumn: {
    width: Spacing.space8,
    alignItems: "flex-end",
  },
  time: {
    ...Typography.Mono,
  },
  content: {
    flex: 1,
    gap: Spacing.space2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space2,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  subject: {
    ...Typography.BodyMedium,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
  },
  description: {
    ...Typography.Body,
  },
  homework: {
    ...Typography.Caption,
  },
  descriptionDone: {
    textDecorationLine: "line-through",
  },
  doneBadge: {
    alignSelf: "flex-start",
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  doneLabel: {
    ...Typography.Caption,
    fontWeight: "600",
  },
});
