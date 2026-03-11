import { Ionicons } from "@expo/vector-icons";
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

import { DayHeader } from "@/components/DayHeader";
import { EmptyState } from "@/components/EmptyState";
import { HomeworkItem } from "@/components/HomeworkItem";
import { LessonCard } from "@/components/LessonCard";
import { SectionHeader } from "@/components/SectionHeader";
import { SkeletonCard } from "@/components/SkeletonCard";
import { HomeStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";
import { useDiaryStore } from "@/store/diaryStore";
import { useUiStore } from "@/store/uiStore";
import { Colors, Spacing, Typography, useAppTheme } from "@/theme";
import { formatDayLabel, getMondayOfWeek, getNextSchoolDay, getTodayIso } from "@/utils/dateUtils";

type Props = NativeStackScreenProps<HomeStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const profile = useAuthStore((state) => state.userProfile);
  const fetchWeek = useDiaryStore((state) => state.fetchWeek);
  const weeksCache = useDiaryStore((state) => state.weeksCache);
  const loading = useDiaryStore((state) => state.loading);
  const refreshing = useDiaryStore((state) => state.refreshing);
  const localHomeworkOverrides = useUiStore((state) => state.localHomeworkOverrides);
  const toggleHomeworkDone = useUiStore((state) => state.toggleHomeworkDone);

  const todayIso = useMemo(() => getTodayIso(), []);
  const todayWeek = getMondayOfWeek(new Date());
  const nextSchoolDay = getNextSchoolDay(todayIso);
  const nextSchoolWeek = getMondayOfWeek(new Date(`${nextSchoolDay}T12:00:00`));

  const loadData = useCallback(
    async (force = false) => {
      await fetchWeek(todayWeek, { force });

      if (nextSchoolWeek !== todayWeek) {
        await fetchWeek(nextSchoolWeek, { force, keepSelectedDay: true });
      }
    },
    [fetchWeek, nextSchoolWeek, todayWeek],
  );

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [loadData]),
  );

  const todayEntries = weeksCache[todayWeek]?.days[todayIso] ?? [];
  const tomorrowEntries = weeksCache[nextSchoolWeek]?.days[nextSchoolDay] ?? [];

  const resolvedTomorrowEntries = tomorrowEntries.filter((entry) => {
    const resolvedDone = localHomeworkOverrides[String(entry.id)] ?? entry.homeworkDone;
    return !resolvedDone;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.Background }]} edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={theme.AccentBlue}
            onRefresh={() => loadData(true)}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.TextPrimary }]}>Bonjour, {profile?.firstName ?? "toi"}</Text>
            <Text style={[styles.date, { color: theme.TextSecondary }]}>{formatDayLabel(todayIso)}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={[styles.bellButton, { backgroundColor: theme.Surface }]}>
            <Ionicons color={theme.TextSecondary} name="notifications-outline" size={20} />
          </TouchableOpacity>
        </View>

        <SectionHeader title="AUJOURD'HUI" />
        <DayHeader date={todayIso} isToday />

        {loading && !weeksCache[todayWeek] ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : todayEntries.length ? (
          todayEntries.map((entry, index) => {
            const resolvedDone = localHomeworkOverrides[String(entry.id)] ?? entry.homeworkDone;

            return (
              <LessonCard
                key={entry.id}
                hour={entry.hour}
                lessonName={entry.lessonName}
                lessonSubject={entry.lessonSubject}
                homework={entry.homework}
                homeworkDone={resolvedDone}
                showTime={index === 0 || entry.hour !== todayEntries[index - 1]?.hour}
                onPress={() => navigation.navigate("LessonDetail", { entry })}
              />
            );
          })
        ) : (
          <View style={styles.emptyBlock}>
            <EmptyState icon="🎉" message="Pas de cours aujourd'hui" />
          </View>
        )}

        {resolvedTomorrowEntries.length ? (
          <>
            <SectionHeader title="À RENDRE DEMAIN" />
            {resolvedTomorrowEntries.map((entry) => {
              const resolvedDone = localHomeworkOverrides[String(entry.id)] ?? entry.homeworkDone;

              return (
                <HomeworkItem
                  key={entry.id}
                  isDone={resolvedDone}
                  isUrgent
                  onPress={() => navigation.navigate("LessonDetail", { entry })}
                  subject={entry.lessonName}
                  text={entry.homework ?? entry.lessonSubject}
                />
              );
            })}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    paddingTop: Spacing.space2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.space4,
    paddingBottom: Spacing.space5,
  },
  greeting: {
    ...Typography.H2,
  },
  date: {
    ...Typography.Body,
    marginTop: 2,
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyBlock: {
    minHeight: 220,
  },
});
