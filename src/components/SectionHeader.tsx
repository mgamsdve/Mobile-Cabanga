import { StyleSheet, Text, View } from "react-native";

import { Colors, Spacing, Typography } from "@/theme";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space1,
    paddingBottom: Spacing.space2,
  },
  title: {
    ...Typography.Label,
    color: Colors.TextSecondary,
    textTransform: "uppercase",
  },
});
