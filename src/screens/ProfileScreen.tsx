import { useScrollToTop } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";
import { Radius, Spacing, Typography, useAppTheme } from "@/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "Profile">;

function InfoRow({ label, value, onPress, danger = false }: { label: string; value?: string | number; onPress?: () => void; danger?: boolean }) {
  const theme = useAppTheme();

  return (
    <Pressable disabled={!onPress} onPress={onPress} style={[styles.infoRow, { backgroundColor: theme.Surface }]}>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: danger ? theme.Danger : theme.TextPrimary }]}>{label}</Text>
        {value !== undefined ? <Text style={[styles.infoValue, { color: theme.TextSecondary }]}>{value}</Text> : null}
      </View>
      {onPress ? <Text style={[styles.chevron, { color: theme.TextTertiary }]}>›</Text> : null}
    </Pressable>
  );
}

export function ProfileScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const profile = useAuthStore((state) => state.userProfile);
  const studentId = useAuthStore((state) => state.studentId);
  const schoolId = useAuthStore((state) => state.schoolId);
  const logout = useAuthStore((state) => state.logout);

  const initials = `${profile?.firstName?.charAt(0) ?? ""}${profile?.lastName?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.Background }]} edges={["top"]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.TextPrimary }]}>Profil</Text>

        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.AccentBlue }]}>
            <Text style={styles.avatarText}>{initials || "?"}</Text>
          </View>
          <Text style={[styles.name, { color: theme.TextPrimary }]}>
            {profile?.firstName} {profile?.lastName}
          </Text>
          <Text style={[styles.email, { color: theme.TextSecondary }]}>{profile?.email ?? "Email indisponible"}</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.TextSecondary }]}>COMPTE</Text>
        <InfoRow label="École" value={schoolId ?? "-"} />
        <InfoRow label="ID Élève" value={studentId ?? "-"} />

        <Text style={[styles.sectionLabel, { color: theme.TextSecondary }]}>PRÉFÉRENCES</Text>
        <InfoRow label="Paramètres" onPress={() => navigation.navigate("Settings")} />

        <View style={styles.logoutWrapper}>
          <InfoRow label="Se déconnecter" danger onPress={() => logout()} />
        </View>
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
  title: {
    ...Typography.H2,
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: Spacing.space6,
    gap: Spacing.space2,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...Typography.H2,
    color: "#FFFFFF",
  },
  name: {
    ...Typography.H3,
  },
  email: {
    ...Typography.Body,
  },
  sectionLabel: {
    ...Typography.Label,
    marginBottom: Spacing.space2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space4,
    marginBottom: Spacing.space2,
  },
  infoContent: {
    gap: Spacing.space1,
  },
  infoLabel: {
    ...Typography.BodyMedium,
  },
  infoValue: {
    ...Typography.Body,
  },
  chevron: {
    fontSize: 24,
  },
  logoutWrapper: {
    marginTop: Spacing.space5,
  },
  infoDanger: {},
});
