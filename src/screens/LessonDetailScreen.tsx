import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { SubjectPill } from "@/components/SubjectPill";
import { DiaryStackParamList, HomeStackParamList } from "@/navigation/types";
import { useUiStore } from "@/store/uiStore";
import { Colors, Radius, Spacing, Typography } from "@/theme";

type DiaryProps = NativeStackScreenProps<DiaryStackParamList, "LessonDetail">;
type HomeProps = NativeStackScreenProps<HomeStackParamList, "LessonDetail">;
type Props = DiaryProps | HomeProps;

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("fr-BE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatFullDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(year, month - 1, day, 12, 0, 0, 0);
  const label = FULL_DATE_FORMATTER.format(value).replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function LessonDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const toggleHomeworkDone = useUiStore((state) => state.toggleHomeworkDone);
  const localHomeworkOverrides = useUiStore((state) => state.localHomeworkOverrides);
  const { entry } = route.params;

  const resolvedDone = localHomeworkOverrides[String(entry.id)] ?? entry.homeworkDone;
  const isCompact = Dimensions.get("window").width < 768;
  const translateY = useRef(new Animated.Value(0)).current;

  const sheetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10 && Math.abs(gestureState.dx) < 20,
        onPanResponderMove: (_, gestureState) => {
          translateY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 120) {
            navigation.goBack();
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [navigation, translateY],
  );

  const handleToggleDone = async () => {
    toggleHomeworkDone(entry.id, entry.homeworkDone);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const content = (
    <>
      <View style={styles.heroCard}>
        <SubjectPill name={entry.lessonName} />
        <Text style={styles.time}>{entry.hour}</Text>
        <Text style={styles.date}>{formatFullDate(entry.date)}</Text>
      </View>

      <Text style={styles.sectionLabel}>CONTENU DU COURS</Text>
      <Text selectable style={[styles.lessonText, resolvedDone ? styles.lessonTextDone : null]}>
        {entry.lessonSubject}
      </Text>

      <View style={styles.separator} />

      <Pressable onPress={handleToggleDone} style={[styles.toggleRow, resolvedDone ? styles.toggleRowDone : null]}>
        <View style={[styles.checkbox, resolvedDone ? styles.checkboxDone : null]}>
          {resolvedDone ? <Text style={styles.checkboxMark}>✓</Text> : null}
        </View>
        <Text style={styles.toggleText}>Marquer comme fait</Text>
      </Pressable>
    </>
  );

  if (isCompact) {
    return (
      <View style={styles.modalRoot}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backdrop} />
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + Spacing.space4,
              transform: [{ translateY }],
            },
          ]}
          {...sheetPanResponder.panHandlers}
        >
          <View style={styles.sheetHandle} />
          <ScrollView contentContainerStyle={styles.sheetContent}>{content}</ScrollView>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.desktopSafeArea} edges={["top", "bottom"]}>
      <View style={styles.desktopHeader}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons color={Colors.TextPrimary} name="chevron-back" size={20} />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.desktopContent}>{content}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(13,13,18,0.24)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: "60%",
    backgroundColor: Colors.SurfaceRaised,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.BorderStrong,
    alignSelf: "center",
    marginTop: Spacing.space2,
  },
  sheetContent: {
    paddingHorizontal: Spacing.space5,
    paddingTop: Spacing.space4,
    paddingBottom: Spacing.space5,
  },
  desktopSafeArea: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  desktopHeader: {
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space2,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.space1,
  },
  backText: {
    ...Typography.BodyMedium,
    color: Colors.TextPrimary,
  },
  desktopContent: {
    paddingHorizontal: Spacing.space5,
    paddingVertical: Spacing.space5,
  },
  heroCard: {
    backgroundColor: Colors.Surface,
    borderRadius: Radius.lg,
    padding: Spacing.space5,
    gap: Spacing.space3,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  time: {
    ...Typography.H1,
    color: Colors.TextPrimary,
  },
  date: {
    ...Typography.Body,
    color: Colors.TextSecondary,
  },
  sectionLabel: {
    ...Typography.Label,
    color: Colors.TextSecondary,
    marginTop: Spacing.space5,
    marginBottom: Spacing.space2,
  },
  lessonText: {
    ...Typography.Body,
    color: Colors.TextPrimary,
  },
  lessonTextDone: {
    textDecorationLine: "line-through",
    color: Colors.TextSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.Border,
    marginVertical: Spacing.space5,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space3,
    backgroundColor: Colors.Surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.Border,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
  },
  toggleRowDone: {
    backgroundColor: Colors.SurfaceDone,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.BorderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: Colors.Success,
    borderColor: Colors.Success,
  },
  checkboxMark: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  toggleText: {
    ...Typography.BodyMedium,
    color: Colors.TextPrimary,
  },
});
