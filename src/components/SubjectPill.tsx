import { StyleSheet, Text, View } from "react-native";

import { Radius, Typography } from "@/theme";
import { getSubjectColor } from "@/utils/subjectColors";

interface SubjectPillProps {
  name: string;
  size?: "sm" | "md";
}

export function SubjectPill({ name, size = "md" }: SubjectPillProps) {
  return (
    <View
      style={[
        styles.base,
        size === "sm" ? styles.small : styles.medium,
        { backgroundColor: getSubjectColor(name) },
      ]}
    >
      <Text style={[styles.label, size === "sm" ? styles.labelSmall : null]}>{name.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    borderRadius: Radius.full,
  },
  small: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    ...Typography.Label,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 14,
  },
});
