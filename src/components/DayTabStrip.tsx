import { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Colors, Radius, Spacing, Typography } from "@/theme";

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
    <View style={styles.wrapper} onLayout={handleLayout}>
      <View style={styles.row}>
        {days.map((day, index) => {
          const isActive = index === selectedIndex;

          return (
            <Pressable key={`${day.label}-${day.date}`} style={styles.cell} onPress={() => onSelectDay(index)}>
              <View style={styles.todayMarkerContainer}>
                {day.isToday ? <View style={styles.todayMarker} /> : <View style={styles.todayMarkerSpacer} />}
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  isActive ? styles.dayLabelActive : null,
                  !day.hasEntries ? styles.dayLabelMuted : null,
                ]}
              >
                {day.label}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isActive ? styles.dayLabelActive : null,
                  !day.hasEntries ? styles.dayLabelMuted : null,
                ]}
              >
                {day.date}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {containerWidth ? (
        <Animated.View style={[styles.underline, { width: itemWidth - 28 }, underlineStyle]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.Background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.Border,
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
    backgroundColor: Colors.AccentBlue,
  },
  todayMarkerSpacer: {
    width: 4,
    height: 4,
  },
  dayLabel: {
    ...Typography.Caption,
    color: Colors.TextTertiary,
  },
  dayNumber: {
    ...Typography.BodyMedium,
    color: Colors.TextTertiary,
  },
  dayLabelActive: {
    color: Colors.AccentBlue,
  },
  dayLabelMuted: {
    opacity: 0.4,
  },
  underline: {
    position: "absolute",
    bottom: 0,
    left: 14,
    height: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.AccentBlue,
  },
});
