import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useRef } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { ScheduleStackParamList } from "@/navigation/types";
import { useDiaryStore } from "@/store/diaryStore";
import { useUiStore } from "@/store/uiStore";
import { Radius, Spacing, Typography, useAppTheme } from "@/theme";
import { formatDayLabel, getCurrentWeekRange, getTodayIso } from "@/utils/dateUtils";

type Props = NativeStackScreenProps<ScheduleStackParamList, "Schedule">;

export function ScheduleScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const fetchWeek = useDiaryStore((state) => state.fetchWeek);
  const weeksCache = useDiaryStore((state) => state.weeksCache);
  const refreshing = useDiaryStore((state) => state.refreshing);
  const loading = useDiaryStore((state) => state.loading);
  const localHomeworkOverrides = useUiStore((state) => state.localHomeworkOverrides);

  const todayIso = getTodayIso();
  const { monday, friday } = getCurrentWeekRange();
  const weekData = weeksCache[monday];

  useFocusEffect(
    useCallback(() => {
      fetchWeek(monday);
    }, [fetchWeek, monday]),
  );

  const homeworkEntries = useMemo(() => {
    const entries = Object.values(weekData?.days ?? {}).flat();

    return entries
      .filter((entry) => entry.homework && entry.date >= todayIso && entry.date <= friday)
      .sort((left, right) => {
        if (left.date === right.date) {
          return left.hour.localeCompare(right.hour);
        }

        return left.date.localeCompare(right.date);
      })
      .map((entry) => ({
        ...entry,
        resolvedDone: localHomeworkOverrides[String(entry.id)] ?? entry.homeworkDone,
      }));
  }, [friday, localHomeworkOverrides, todayIso, weekData]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.Background }]} edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.AccentBlue}
            onRefresh={() => fetchWeek(monday, { force: true })}
          />
        }
      >
        <Text style={[styles.title, { color: theme.TextPrimary }]}>Devoirs de la semaine</Text>

        {loading && !weekData ? (
          <View style={styles.placeholderGroup}>
            <View style={[styles.placeholder, { backgroundColor: theme.Surface }]} />
            <View style={[styles.placeholder, { backgroundColor: theme.Surface }]} />
            <View style={[styles.placeholder, { backgroundColor: theme.Surface }]} />
          </View>
        ) : homeworkEntries.length ? (
          <View style={styles.cards}>
            {homeworkEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                activeOpacity={0.88}
                onPress={() => navigation.navigate("LessonDetail", { entry })}
                style={[styles.card, { backgroundColor: theme.Surface }]}
              >
                <Text style={[styles.subject, { color: theme.TextPrimary }]}>{entry.lessonName.toUpperCase()}</Text>
                <Text style={[styles.date, { color: theme.TextSecondary }]}>{formatDayLabel(entry.date)}</Text>
                <Text
                  style={[
                    styles.homework,
                    { color: entry.resolvedDone ? theme.TextTertiary : theme.TextPrimary },
                    entry.resolvedDone ? styles.homeworkDone : null,
                  ]}
                >
                  {entry.homework}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState icon="📝" message="Aucun devoir restant cette semaine" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.space2,
    paddingBottom: 120,
  },
  title: {
    ...Typography.H2,
    paddingHorizontal: Spacing.space4,
  },
  cards: {
    gap: Spacing.space2,
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
  },
  card: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  subject: {
    ...Typography.BodyMedium,
    textTransform: "uppercase",
  },
  date: {
    ...Typography.Caption,
    marginTop: Spacing.space1,
    marginBottom: Spacing.space3,
  },
  homework: {
    ...Typography.Body,
  },
  homeworkDone: {
    textDecorationLine: "line-through",
  },
  placeholderGroup: {
    gap: Spacing.space2,
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
  },
  placeholder: {
    height: 92,
    borderRadius: Radius.md,
    opacity: 0.65,
  },
});
