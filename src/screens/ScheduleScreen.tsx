import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useRef } from "react";
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
import { ScheduleBlock } from "@/components/ScheduleBlock";
import { ScheduleStackParamList } from "@/navigation/types";
import { useScheduleStore } from "@/store/scheduleStore";
import { Colors, Radius, Spacing, Typography } from "@/theme";

type Props = NativeStackScreenProps<ScheduleStackParamList, "Schedule">;

const DAY_OPTIONS = [
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mer", value: 3 },
  { label: "Jeu", value: 4 },
  { label: "Ven", value: 5 },
];

export function ScheduleScreen({}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const fetchSchedule = useScheduleStore((state) => state.fetchSchedule);
  const schedule = useScheduleStore((state) => state.schedule);
  const selectedDay = useScheduleStore((state) => state.selectedDay);
  const setSelectedDay = useScheduleStore((state) => state.setSelectedDay);
  const loading = useScheduleStore((state) => state.loading);

  useFocusEffect(
    useCallback(() => {
      fetchSchedule();
    }, [fetchSchedule]),
  );

  const selectedEntries = schedule[selectedDay] ?? [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            tintColor={Colors.AccentBlue}
            onRefresh={() => fetchSchedule({ force: true })}
          />
        }
      >
        <Text style={styles.title}>Emploi du temps</Text>

        <View style={styles.daySelector}>
          {DAY_OPTIONS.map((option) => {
            const active = option.value === selectedDay;

            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.85}
                onPress={() => setSelectedDay(option.value)}
                style={[styles.dayPill, active ? styles.dayPillActive : null]}
              >
                <Text style={[styles.dayPillText, active ? styles.dayPillTextActive : null]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.separator} />

        {loading && !Object.keys(schedule).length ? (
          <View style={styles.placeholderGroup}>
            <View style={styles.placeholder} />
            <View style={styles.placeholder} />
            <View style={styles.placeholder} />
          </View>
        ) : selectedEntries.length ? (
          selectedEntries.map((entry) =>
            entry.isBreak ? (
              <View key={entry.id} style={styles.breakRow}>
                <Text style={styles.breakTime}>{entry.startTime}</Text>
                <View style={styles.breakDivider}>
                  <Text style={styles.breakText}>{entry.subject}</Text>
                </View>
              </View>
            ) : (
              <ScheduleBlock
                key={entry.id}
                endTime={entry.endTime}
                room={entry.room}
                startTime={entry.startTime}
                subject={entry.subject}
              />
            ),
          )
        ) : (
          <EmptyState icon="🗓️" message="Aucun cours fixe disponible" subtext="Tire pour réessayer." />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.Background,
  },
  content: {
    paddingTop: Spacing.space2,
    paddingBottom: 120,
  },
  title: {
    ...Typography.H2,
    color: Colors.TextPrimary,
    paddingHorizontal: Spacing.space4,
  },
  daySelector: {
    flexDirection: "row",
    gap: Spacing.space2,
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space4,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.Surface,
  },
  dayPillActive: {
    backgroundColor: Colors.AccentBlue,
  },
  dayPillText: {
    ...Typography.BodyMedium,
    color: Colors.TextSecondary,
  },
  dayPillTextActive: {
    color: "#FFFFFF",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.Border,
    marginHorizontal: Spacing.space4,
    marginVertical: Spacing.space4,
  },
  placeholderGroup: {
    gap: Spacing.space2,
  },
  placeholder: {
    height: 72,
    marginHorizontal: Spacing.space4,
    borderRadius: Radius.md,
    backgroundColor: Colors.Surface,
    opacity: 0.65,
  },
  breakRow: {
    flexDirection: "row",
    gap: Spacing.space3,
    paddingHorizontal: Spacing.space4,
    marginBottom: Spacing.space2,
  },
  breakTime: {
    ...Typography.Mono,
    width: Spacing.space8,
    color: Colors.TextSecondary,
  },
  breakDivider: {
    flex: 1,
    borderRadius: Radius.full,
    backgroundColor: Colors.Border,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space2,
  },
  breakText: {
    ...Typography.Caption,
    color: Colors.TextSecondary,
  },
});
