import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileStackParamList } from "@/navigation/types";
import { useDiaryStore } from "@/store/diaryStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useUiStore } from "@/store/uiStore";
import { Radius, Spacing, Typography, useAppTheme } from "@/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "Settings">;

function SettingsRow({
  label,
  value,
  onPress,
  right,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const theme = useAppTheme();

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={[styles.row, { backgroundColor: theme.Surface }]}
    >
      <Text style={[styles.rowLabel, { color: theme.TextPrimary }]}>{label}</Text>
      <View style={styles.rowRight}>
        {right ?? (value ? <Text style={[styles.rowValue, { color: theme.TextSecondary }]}>{value}</Text> : null)}
        {onPress ? <Text style={[styles.chevron, { color: theme.TextTertiary }]}>›</Text> : null}
      </View>
    </Pressable>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const clearDiaryCache = useDiaryStore((state) => state.clearCache);
  const clearScheduleCache = useScheduleStore((state) => state.clearCache);
  const clearHomeworkOverrides = useUiStore((state) => state.clearHomeworkOverrides);
  const themeMode = useUiStore((state) => state.themeMode);
  const setThemeMode = useUiStore((state) => state.setThemeMode);

  const handleClearCache = async () => {
    await clearDiaryCache();
    await clearScheduleCache();
    clearHomeworkOverrides();

    Toast.show({
      type: "success",
      text1: "Cache vidé",
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.Background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
          <Text style={[styles.backText, { color: theme.TextSecondary }]}>← Profil</Text>
        </Pressable>

        <Text style={[styles.title, { color: theme.TextPrimary }]}>Paramètres</Text>

        <Text style={[styles.sectionLabel, { color: theme.TextSecondary }]}>AFFICHAGE</Text>
        <SettingsRow
          label="Dark mode"
          right={
            <Switch
              value={themeMode === "dark"}
              onValueChange={(value) => {
                void setThemeMode(value ? "dark" : "light");
              }}
              trackColor={{ false: theme.BorderStrong, true: theme.AccentBlueSoft }}
              thumbColor={themeMode === "dark" ? theme.AccentBlue : theme.Surface}
            />
          }
        />
        <SettingsRow label="Thème" value={themeMode === "dark" ? "Dark mode" : "Light mode"} />

        <Text style={[styles.sectionLabel, { color: theme.TextSecondary }]}>DONNÉES</Text>
        <SettingsRow label="Vider le cache" onPress={handleClearCache} />

        <Text style={[styles.sectionLabel, { color: theme.TextSecondary }]}>À PROPOS</Text>
        <SettingsRow label="Version" value={Constants.expoConfig?.version ?? "1.0.0"} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.space4,
    paddingBottom: 120,
  },
  backRow: {
    marginBottom: Spacing.space2,
  },
  backText: {
    ...Typography.Body,
  },
  title: {
    ...Typography.H2,
    marginBottom: Spacing.space5,
  },
  sectionLabel: {
    ...Typography.Label,
    marginBottom: Spacing.space2,
  },
  row: {
    minHeight: 56,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
    marginBottom: Spacing.space2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    ...Typography.BodyMedium,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space2,
  },
  rowValue: {
    ...Typography.Body,
  },
  chevron: {
    fontSize: 24,
  },
});
