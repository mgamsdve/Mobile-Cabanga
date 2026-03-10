import { StyleSheet, Text, View } from "react-native";

import { Colors, Spacing, Typography } from "@/theme";

interface EmptyStateProps {
  icon: string;
  message: string;
  subtext?: string;
}

export function EmptyState({ icon, message, subtext }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
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
    color: Colors.TextSecondary,
    textAlign: "center",
  },
  subtext: {
    ...Typography.Caption,
    color: Colors.TextTertiary,
    textAlign: "center",
  },
});
