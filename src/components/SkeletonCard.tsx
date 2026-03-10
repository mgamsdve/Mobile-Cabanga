import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { Colors, Radius, Spacing } from "@/theme";

interface SkeletonCardProps {
  lines?: number;
}

export function SkeletonCard({ lines = 2 }: SkeletonCardProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.timeColumn} />
      <View style={styles.content}>
        <View style={[styles.line, styles.shortLine]} />
        {Array.from({ length: lines }).map((_, index) => (
          <View
            key={index}
            style={[styles.line, index === lines - 1 ? styles.mediumLine : styles.longLine]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: Spacing.space4,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space3,
    backgroundColor: Colors.Surface,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.space4,
    marginBottom: Spacing.space2,
  },
  timeColumn: {
    width: Spacing.space8,
    height: 16,
    borderRadius: Radius.sm,
    backgroundColor: Colors.Border,
  },
  content: {
    flex: 1,
    gap: Spacing.space2,
  },
  line: {
    borderRadius: Radius.sm,
    backgroundColor: Colors.Border,
    height: 14,
  },
  shortLine: {
    width: "40%",
  },
  mediumLine: {
    width: "55%",
  },
  longLine: {
    width: "100%",
  },
});
