import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Radius, Spacing, Typography, useAppTheme } from "@/theme";

export interface DayTab {
  label: string;
  date: number;
  isToday: boolean;
  hasEntries: boolean;
}

interface DayTabStripProps {
  days: DayTab[];
  selectedIndex: number;
  onSelectDay: (index: number) => void;
}

export function DayTabStrip({ days, selectedIndex, onSelectDay }: DayTabStripProps) {
  const theme = useAppTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const underlineX = useSharedValue(0);
  const itemWidth = containerWidth / 5;

  useEffect(() => {
    underlineX.value = withSpring(itemWidth * selectedIndex, {
      stiffness: 300,
      damping: 24,
    });
  }, [itemWidth, selectedIndex, underlineX]);

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: underlineX.value }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      style={[styles.wrapper, { backgroundColor: theme.Background, borderBottomColor: theme.Border }]}
      onLayout={handleLayout}
    >
      <View style={styles.row}>
        {days.map((day, index) => {
          const isActive = index === selectedIndex;

          return (
            <Pressable key={`${day.label}-${day.date}`} style={styles.cell} onPress={() => onSelectDay(index)}>
              <View style={styles.todayMarkerContainer}>
                {day.isToday ? <View style={styles.todayMarker} /> : <View style={styles.todayMarkerSpacer} />}
              </View>
              <Text
                style={[styles.dayLabel, { color: isActive ? theme.AccentBlue : theme.TextTertiary }, !day.hasEntries ? styles.dayLabelMuted : null]}
              >
                {day.label}
              </Text>
              <Text
                style={[styles.dayNumber, { color: isActive ? theme.AccentBlue : theme.TextTertiary }, !day.hasEntries ? styles.dayLabelMuted : null]}
              >
                {day.date}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {containerWidth ? (
        <Animated.View
          style={[styles.underline, { width: itemWidth - 28, backgroundColor: theme.AccentBlue }, underlineStyle]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: Spacing.space2,
  },
  row: {
    flexDirection: "row",
    height: 44,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  todayMarkerContainer: {
    height: 8,
    justifyContent: "center",
  },
  todayMarker: {
    width: 4,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: "#3B7BF8",
  },
  todayMarkerSpacer: {
    width: 4,
    height: 4,
  },
  dayLabel: {
    ...Typography.Caption,
  },
  dayNumber: {
    ...Typography.BodyMedium,
  },
  dayLabelActive: {},
  dayLabelMuted: {
    opacity: 0.4,
  },
  underline: {
    position: "absolute",
    bottom: 0,
    left: 14,
    height: 2,
    borderRadius: Radius.full,
  },
});
