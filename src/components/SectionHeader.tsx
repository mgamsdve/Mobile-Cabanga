import { StyleSheet, Text, View } from "react-native";

import { Spacing, Typography, useAppTheme } from "@/theme";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.TextSecondary }]}>{title}</Text>
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
    textTransform: "uppercase",
  },
});
