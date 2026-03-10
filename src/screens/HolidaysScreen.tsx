import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { HolidaysStackParamList } from "@/navigation/types";
import { useScheduleStore } from "@/store/scheduleStore";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { daysUntil, formatShortDate, getTodayIso } from "@/utils/dateUtils";

type Props = NativeStackScreenProps<HolidaysStackParamList, "Holidays">;

function getHolidayEmoji(name: string) {
  const value = name.toLowerCase();
  if (value.includes("pâques")) return "🐣";
  if (value.includes("été") || value.includes("grandes")) return "☀️";
  if (value.includes("noël")) return "🎄";
  if (value.includes("printemps")) return "🌸";
  if (value.includes("carnaval")) return "🎭";
  return "📅";
}

export function HolidaysScreen({}: Props) {
  const fetchHolidays = useScheduleStore((state) => state.fetchHolidays);
  const holidays = useScheduleStore((state) => state.holidays);
  const loading = useScheduleStore((state) => state.holidaysLoading);
  const [showPast, setShowPast] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchHolidays();
    }, [fetchHolidays]),
  );

  const [upcoming, past] = useMemo(() => {
    const now = getTodayIso();
    return [
      holidays.filter((holiday) => holiday.endDate >= now),
      holidays.filter((holiday) => holiday.endDate < now),
    ];
  }, [holidays]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Congés scolaires</Text>

        {loading && !holidays.length ? (
          <View style={styles.cards}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
        ) : upcoming.length ? (
          <>
            <SectionHeader title="PROCHAINS CONGÉS" />
            <View style={styles.cards}>
              {upcoming.map((holiday) => {
                const countdown = daysUntil(holiday.startDate);

                return (
                  <View key={`${holiday.name}-${holiday.startDate}`} style={styles.card}>
                    <Text style={styles.cardTitle}>
                      {getHolidayEmoji(holiday.name)} {holiday.name}
                    </Text>
                    <Text style={styles.cardDates}>
                      {formatShortDate(holiday.startDate)} - {formatShortDate(holiday.endDate)}
                    </Text>
                    {countdown >= 0 ? <Text style={styles.cardCountdown}>Dans {countdown} jours</Text> : null}
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <EmptyState icon="🏖️" message="Aucun congé à venir" />
        )}

        {past.length ? (
          <>
            <SectionHeader title="PASSÉS" />
            <Pressable onPress={() => setShowPast((current) => !current)} style={styles.showPastRow}>
              <Text style={styles.showPastText}>{showPast ? "Masquer les congés passés" : "Show past holidays ›"}</Text>
            </Pressable>
            {showPast ? (
              <View style={styles.cards}>
                {past.map((holiday) => (
                  <View key={`${holiday.name}-${holiday.startDate}`} style={styles.card}>
                    <Text style={styles.cardTitle}>
                      {getHolidayEmoji(holiday.name)} {holiday.name}
                    </Text>
                    <Text style={styles.cardDates}>
                      {formatShortDate(holiday.startDate)} - {formatShortDate(holiday.endDate)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
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
  cards: {
    gap: Spacing.space2,
    paddingHorizontal: Spacing.space4,
  },
  card: {
    backgroundColor: Colors.Surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: {
    ...Typography.BodyMedium,
    color: Colors.TextPrimary,
  },
  cardDates: {
    ...Typography.Body,
    color: Colors.TextSecondary,
    marginTop: Spacing.space1,
  },
  cardCountdown: {
    ...Typography.Caption,
    color: Colors.TextTertiary,
    marginTop: Spacing.space2,
  },
  showPastRow: {
    paddingHorizontal: Spacing.space4,
    paddingBottom: Spacing.space2,
  },
  showPastText: {
    ...Typography.Body,
    color: Colors.TextSecondary,
  },
  skeletonCard: {
    height: 98,
    borderRadius: Radius.md,
    backgroundColor: Colors.Surface,
    opacity: 0.65,
  },
});
