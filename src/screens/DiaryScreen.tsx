import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  FlatList,
  PanResponder,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DiaryEntry } from "@/api/cabangaApi";
import { DayHeader } from "@/components/DayHeader";
import { DayTabStrip } from "@/components/DayTabStrip";
import { EmptyState } from "@/components/EmptyState";
import { LessonCard } from "@/components/LessonCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { WeekNavigator } from "@/components/WeekNavigator";
import { DiaryStackParamList } from "@/navigation/types";
import { useDiaryStore } from "@/store/diaryStore";
import { useUiStore } from "@/store/uiStore";
import { Colors, Spacing, useAppTheme } from "@/theme";
import {
  addDays,
  compareIsoDates,
  formatWeekLabel,
  getCurrentWeekRange,
  getInitialSelectedWeekday,
  getMondayOfWeek,
  getShortDayLabel,
  getWeekDates,
  isToday,
} from "@/utils/dateUtils";

type Props = NativeStackScreenProps<DiaryStackParamList, "Diary">;

interface DisplayEntry extends DiaryEntry {
  resolvedDone: boolean;
  showTime: boolean;
}

export function DiaryScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const listRef = useRef<FlatList<DisplayEntry>>(null);
  useScrollToTop(listRef);

  const fetchWeek = useDiaryStore((state) => state.fetchWeek);
  const setSelectedDay = useDiaryStore((state) => state.setSelectedDay);
  const refreshWeek = useDiaryStore((state) => state.refreshWeek);
  const currentWeek = useDiaryStore((state) => state.currentWeek);
  const selectedDay = useDiaryStore((state) => state.selectedDay);
  const weeksCache = useDiaryStore((state) => state.weeksCache);
  const loading = useDiaryStore((state) => state.loading);
  const refreshing = useDiaryStore((state) => state.refreshing);
  const error = useDiaryStore((state) => state.error);
  const localHomeworkOverrides = useUiStore((state) => state.localHomeworkOverrides);
  const isOffline = useUiStore((state) => state.isOffline);

  const currentWeekIso = getCurrentWeekRange().monday;
  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);
  const selectedDayIndex = Math.max(0, weekDates.indexOf(selectedDay));
  const weekData = weeksCache[currentWeek];
  const entries = weekData?.days[selectedDay] ?? [];
  const displayEntries = entries.map((entry, index) => ({
    ...entry,
    resolvedDone: localHomeworkOverrides[String(entry.id)] ?? entry.homeworkDone,
    showTime: index === 0 || entry.hour !== entries[index - 1]?.hour,
  }));

  const weekLabel = formatWeekLabel(currentWeek, addDays(currentWeek, 4));
  const isCurrentWeek = currentWeek === currentWeekIso;
  const weekTone = compareIsoDates(currentWeek, currentWeekIso) < 0 ? "past" : isCurrentWeek ? "current" : "future";

  const feedOpacity = useRef(new Animated.Value(1)).current;
  const feedTranslateX = useRef(new Animated.Value(0)).current;

  const loadWeek = useCallback(
    async (weekStart: string, force = false) => {
      await fetchWeek(weekStart, { force });
    },
    [fetchWeek],
  );

  useEffect(() => {
    loadWeek(currentWeek, false);
  }, [currentWeek, loadWeek]);

  useFocusEffect(
    useCallback(() => {
      const fetchedAt = weeksCache[currentWeek]?.fetchedAt ?? 0;

      if (!fetchedAt || Date.now() - fetchedAt > 5 * 60 * 1000) {
        loadWeek(currentWeek, true);
      }
    }, [currentWeek, loadWeek, weeksCache]),
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedDay]);

  const animateFeedChange = useCallback(
    async (callback: () => Promise<void> | void) => {
      await new Promise<void>((resolve) => {
        Animated.timing(feedOpacity, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }).start(async () => {
          await callback();
          listRef.current?.scrollToOffset({ offset: 0, animated: false });
          Animated.timing(feedOpacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }).start(() => resolve());
        });
      });
    },
    [feedOpacity],
  );

  const selectDayByIndex = useCallback(
    async (index: number) => {
      await animateFeedChange(() => {
        setSelectedDay(weekDates[index]);
      });
    },
    [animateFeedChange, setSelectedDay, weekDates],
  );

  const goToWeek = useCallback(
    async (weekStart: string, selectedDate?: string) => {
      await animateFeedChange(async () => {
        await loadWeek(weekStart, false);
        setSelectedDay(selectedDate ?? weekDates[0]);
      });
    },
    [animateFeedChange, loadWeek, setSelectedDay, weekDates],
  );

  const handlePrevWeek = async () => {
    const previousWeek = addDays(currentWeek, -7);
    await loadWeek(previousWeek, false);
    setSelectedDay(getWeekDates(previousWeek)[getInitialSelectedWeekday(previousWeek)]);
  };

  const handleNextWeek = async () => {
    const nextWeek = addDays(currentWeek, 7);
    await loadWeek(nextWeek, false);
    setSelectedDay(getWeekDates(nextWeek)[getInitialSelectedWeekday(nextWeek)]);
  };

  const handleGoToToday = async () => {
    const todayWeek = getMondayOfWeek(new Date());
    await loadWeek(todayWeek, false);
    setSelectedDay(getWeekDates(todayWeek)[getInitialSelectedWeekday(todayWeek)]);
  };

  const moveBySwipe = useCallback(
    async (direction: 1 | -1) => {
      const nextIndex = selectedDayIndex + direction;

      if (nextIndex >= 0 && nextIndex < weekDates.length) {
        await selectDayByIndex(nextIndex);
        return;
      }

      if (direction === 1) {
        const nextWeek = addDays(currentWeek, 7);
        await loadWeek(nextWeek, false);
        setSelectedDay(nextWeek);
        return;
      }

      const previousWeek = addDays(currentWeek, -7);
      await loadWeek(previousWeek, false);
      setSelectedDay(addDays(previousWeek, 4));
    },
    [currentWeek, loadWeek, selectDayByIndex, selectedDayIndex, setSelectedDay, weekDates.length],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 12,
        onPanResponderMove: (_, gestureState) => {
          const translated = Math.max(-30, Math.min(30, gestureState.dx * 0.25));
          feedTranslateX.setValue(translated);
        },
        onPanResponderRelease: async (_, gestureState) => {
          const shouldMove = Math.abs(gestureState.dx) > 50 && Math.abs(gestureState.vx) > 0.3;

          Animated.spring(feedTranslateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();

          if (!shouldMove) {
            return;
          }

          await moveBySwipe(gestureState.dx < 0 ? 1 : -1);
        },
      }),
    [feedTranslateX, moveBySwipe],
  );

  const dayTabs = weekDates.map((date) => ({
    label: getShortDayLabel(date),
    date: Number(date.slice(-2)),
    isToday: isToday(date),
    hasEntries: Boolean(weekData?.days[date]?.length),
  }));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.Background }]} edges={["top"]}>
      <WeekNavigator
        isCurrentWeek={isCurrentWeek}
        onGoToToday={handleGoToToday}
        onNextWeek={handleNextWeek}
        onPrevWeek={handlePrevWeek}
        tone={weekTone}
        weekLabel={weekLabel}
      />
      <DayTabStrip days={dayTabs} selectedIndex={selectedDayIndex} onSelectDay={(index) => void selectDayByIndex(index)} />

      {isOffline && weekData ? (
        <Text style={[styles.offlineBanner, { color: theme.TextSecondary, backgroundColor: theme.AccentBlueSoft }]}>
          Données hors ligne
        </Text>
      ) : null}

      <Animated.View
        style={[
          styles.feedContainer,
          {
            opacity: feedOpacity,
            transform: [{ translateX: feedTranslateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {loading && !weekData ? (
          <View style={styles.skeletonWrapper}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : error && !weekData ? (
          <EmptyState icon="⚠️" message="Impossible de charger les données." subtext="Tire pour réessayer." />
        ) : (
          <FlatList
            ref={listRef}
            contentContainerStyle={styles.listContent}
            data={displayEntries}
            keyExtractor={(item) => String(item.id)}
            initialNumToRender={8}
            removeClippedSubviews
            renderItem={({ item }) => (
              <LessonCard
                hour={item.hour}
                lessonName={item.lessonName}
                lessonSubject={item.lessonSubject}
                homework={item.homework}
                homeworkDone={item.resolvedDone}
                showTime={item.showTime}
                onPress={() => navigation.navigate("LessonDetail", { entry: item })}
              />
            )}
            windowSize={7}
            ListHeaderComponent={<DayHeader date={selectedDay} isToday={isToday(selectedDay)} />}
            ListEmptyComponent={<EmptyState icon="📚" message="Pas d'entrées pour ce jour" />}
            refreshControl={
              <RefreshControl refreshing={refreshing} tintColor={theme.AccentBlue} onRefresh={refreshWeek} />
            }
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  offlineBanner: {
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space2,
    marginHorizontal: Spacing.space4,
    marginTop: Spacing.space2,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  feedContainer: {
    flex: 1,
  },
  skeletonWrapper: {
    paddingTop: Spacing.space3,
  },
  listContent: {
    paddingTop: Spacing.space2,
    paddingBottom: 120,
    flexGrow: 1,
  },
});
