import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef } from "react";
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
import { Radius, Spacing, Typography, useAppTheme } from "@/theme";

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
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const toggleHomeworkDone = useUiStore((state) => state.toggleHomeworkDone);
  const localHomeworkOverrides = useUiStore((state) => state.localHomeworkOverrides);
  const { entry } = route.params;

  const resolvedDone = localHomeworkOverrides[String(entry.id)] ?? entry.homeworkDone;
  const isCompact = Dimensions.get("window").width < 768;
  const translateY = useRef(new Animated.Value(isCompact ? 420 : 0)).current;

  useEffect(() => {
    if (!isCompact) {
      return;
    }

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 24,
      stiffness: 240,
    }).start();
  }, [isCompact, translateY]);

  const closeSheet = () => {
    if (!isCompact) {
      navigation.goBack();
      return;
    }

    Animated.timing(translateY, {
      toValue: 420,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  const sheetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10 && Math.abs(gestureState.dx) < 20,
        onPanResponderMove: (_, gestureState) => {
          translateY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 120) {
            closeSheet();
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [closeSheet, translateY],
  );

  const handleToggleDone = async () => {
    toggleHomeworkDone(entry.id, entry.homeworkDone);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const content = (
    <>
      <View style={[styles.heroCard, { backgroundColor: theme.Surface }]}>
        <SubjectPill name={entry.lessonName} />
        <Text style={[styles.time, { color: theme.TextPrimary }]}>{entry.hour}</Text>
        <Text style={[styles.date, { color: theme.TextSecondary }]}>{formatFullDate(entry.date)}</Text>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.TextSecondary }]}>CONTENU DU COURS</Text>
      <Text
        selectable
        style={[
          styles.lessonText,
          { color: theme.TextPrimary },
          resolvedDone ? styles.lessonTextDone : null,
        ]}
      >
        {entry.lessonSubject}
      </Text>

      {entry.homework ? (
        <>
          <Text style={[styles.sectionLabel, { color: theme.TextSecondary }]}>DEVOIRS</Text>
          <Text
            selectable
            style={[
              styles.homeworkText,
              { color: theme.TextSecondary },
              resolvedDone ? styles.lessonTextDone : null,
            ]}
          >
            {entry.homework}
          </Text>
        </>
      ) : null}

      <View style={[styles.separator, { backgroundColor: theme.Border }]} />

      <Pressable
        onPress={handleToggleDone}
        style={[
          styles.toggleRow,
          {
            backgroundColor: resolvedDone ? theme.SurfaceDone : theme.Surface,
            borderColor: theme.Border,
          },
        ]}
      >
        <View style={[styles.checkbox, { borderColor: theme.BorderStrong }, resolvedDone ? styles.checkboxDone : null]}>
          {resolvedDone ? <Text style={styles.checkboxMark}>✓</Text> : null}
        </View>
        <Text style={[styles.toggleText, { color: theme.TextPrimary }]}>Marquer comme fait</Text>
      </Pressable>
    </>
  );

  if (isCompact) {
    return (
      <View style={styles.modalRoot}>
        <Pressable onPress={closeSheet} style={[styles.backdrop, { backgroundColor: theme.Overlay }]} />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.SurfaceRaised,
              paddingBottom: insets.bottom + Spacing.space4,
              transform: [{ translateY }],
            },
          ]}
          {...sheetPanResponder.panHandlers}
        >
          <View style={[styles.sheetHandle, { backgroundColor: theme.BorderStrong }]} />
          <ScrollView contentContainerStyle={styles.sheetContent}>{content}</ScrollView>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.desktopSafeArea, { backgroundColor: theme.Background }]} edges={["top", "bottom"]}>
      <View style={styles.desktopHeader}>
        <Pressable onPress={closeSheet} style={styles.backButton}>
          <Ionicons color={theme.TextPrimary} name="chevron-back" size={20} />
          <Text style={[styles.backText, { color: theme.TextPrimary }]}>Retour</Text>
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    maxHeight: "60%",
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
  },
  desktopContent: {
    paddingHorizontal: Spacing.space5,
    paddingVertical: Spacing.space5,
  },
  heroCard: {
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
  },
  date: {
    ...Typography.Body,
  },
  sectionLabel: {
    ...Typography.Label,
    marginTop: Spacing.space5,
    marginBottom: Spacing.space2,
  },
  lessonText: {
    ...Typography.Body,
  },
  homeworkText: {
    ...Typography.Body,
  },
  lessonTextDone: {
    textDecorationLine: "line-through",
  },
  separator: {
    height: 1,
    marginVertical: Spacing.space5,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space3,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  checkboxMark: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  toggleText: {
    ...Typography.BodyMedium,
  },
});
