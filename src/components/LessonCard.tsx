import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Colors, Radius, Spacing, Typography } from "@/theme";
import { getSubjectColor } from "@/utils/subjectColors";

interface LessonCardProps {
  hour: string;
  lessonName: string;
  lessonSubject: string;
  homeworkDone: boolean;
  showTime: boolean;
  onPress: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function LessonCard({
  hour,
  lessonName,
  lessonSubject,
  homeworkDone,
  showTime,
  onPress,
}: LessonCardProps) {
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
      <View style={[styles.container, homeworkDone ? styles.containerDone : null]}>
        <View style={styles.timeColumn}>
          {showTime ? <Text style={styles.time}>{hour}</Text> : null}
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={[styles.subjectDot, { backgroundColor: getSubjectColor(lessonName) }]} />
            <Text style={styles.subject}>{lessonName.toUpperCase()}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={[styles.description, homeworkDone ? styles.descriptionDone : null]} numberOfLines={3}>
            {lessonSubject}
          </Text>
          {homeworkDone ? (
            <View style={styles.doneBadge}>
              <Text style={styles.doneLabel}>✓ Fait</Text>
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
    backgroundColor: Colors.Surface,
    borderRadius: Radius.md,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  containerDone: {
    backgroundColor: Colors.SurfaceDone,
  },
  timeColumn: {
    width: Spacing.space8,
    alignItems: "flex-end",
  },
  time: {
    ...Typography.Mono,
    color: Colors.TextSecondary,
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
    color: Colors.TextPrimary,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.Border,
  },
  description: {
    ...Typography.Body,
    color: Colors.TextSecondary,
  },
  descriptionDone: {
    color: Colors.TextTertiary,
    textDecorationLine: "line-through",
  },
  doneBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.SuccessSoft,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  doneLabel: {
    ...Typography.Caption,
    color: Colors.Success,
    fontWeight: "600",
  },
});
