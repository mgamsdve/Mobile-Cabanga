import Constants from "expo-constants";
import Toast from "react-native-toast-message";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileStackParamList } from "@/navigation/types";
import { useDiaryStore } from "@/store/diaryStore";
import { useScheduleStore } from "@/store/scheduleStore";
import { useUiStore } from "@/store/uiStore";
import { Colors, Radius, Spacing, Typography } from "@/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "Settings">;

function SettingsRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </Pressable>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const clearDiaryCache = useDiaryStore((state) => state.clearCache);
  const clearScheduleCache = useScheduleStore((state) => state.clearCache);
  const clearHomeworkOverrides = useUiStore((state) => state.clearHomeworkOverrides);

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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
          <Text style={styles.backText}>← Profil</Text>
        </Pressable>

        <Text style={styles.title}>Paramètres</Text>

        <Text style={styles.sectionLabel}>AFFICHAGE</Text>
        <SettingsRow label="Thème" value="Clair" />

        <Text style={styles.sectionLabel}>DONNÉES</Text>
        <SettingsRow label="Vider le cache" onPress={handleClearCache} />

        <Text style={styles.sectionLabel}>À PROPOS</Text>
        <SettingsRow label="Version" value={Constants.expoConfig?.version ?? "1.0.0"} />
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
    paddingHorizontal: Spacing.space4,
    paddingBottom: 120,
  },
  backRow: {
    marginBottom: Spacing.space2,
  },
  backText: {
    ...Typography.Body,
    color: Colors.TextSecondary,
  },
  title: {
    ...Typography.H2,
    color: Colors.TextPrimary,
    marginBottom: Spacing.space5,
  },
  sectionLabel: {
    ...Typography.Label,
    color: Colors.TextSecondary,
    marginBottom: Spacing.space2,
  },
  row: {
    minHeight: 56,
    backgroundColor: Colors.Surface,
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
    color: Colors.TextPrimary,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.space2,
  },
  rowValue: {
    ...Typography.Body,
    color: Colors.TextSecondary,
  },
  chevron: {
    fontSize: 24,
    color: Colors.TextTertiary,
  },
});
