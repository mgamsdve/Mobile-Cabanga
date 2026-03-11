import { StyleSheet, Text, View } from "react-native";

import { Spacing, Typography, useAppTheme } from "@/theme";

interface EmptyStateProps {
  icon: string;
  message: string;
  subtext?: string;
}

export function EmptyState({ icon, message, subtext }: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.message, { color: theme.TextSecondary }]}>{message}</Text>
      {subtext ? <Text style={[styles.subtext, { color: theme.TextTertiary }]}>{subtext}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.space6,
    paddingVertical: Spacing.space6,
    gap: Spacing.space2,
  },
  icon: {
    fontSize: 40,
  },
  message: {
    ...Typography.Body,
    textAlign: "center",
  },
  subtext: {
    ...Typography.Caption,
    textAlign: "center",
  },
});
