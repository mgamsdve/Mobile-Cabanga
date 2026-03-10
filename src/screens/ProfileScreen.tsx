import { useScrollToTop } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/authStore";
import { Colors, Radius, Spacing, Typography } from "@/theme";

type Props = NativeStackScreenProps<ProfileStackParamList, "Profile">;

function InfoRow({ label, value, onPress, danger = false }: { label: string; value?: string | number; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.infoRow}>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, danger ? styles.infoDanger : null]}>{label}</Text>
        {value !== undefined ? <Text style={styles.infoValue}>{value}</Text> : null}
      </View>
      {onPress ? <Text style={styles.chevron}>›</Text> : null}
    </Pressable>
  );
}

export function ProfileScreen({ navigation }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  const profile = useAuthStore((state) => state.userProfile);
  const studentId = useAuthStore((state) => state.studentId);
  const schoolId = useAuthStore((state) => state.schoolId);
  const logout = useAuthStore((state) => state.logout);

  const initials = `${profile?.firstName?.charAt(0) ?? ""}${profile?.lastName?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profil</Text>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || "?"}</Text>
          </View>
          <Text style={styles.name}>
            {profile?.firstName} {profile?.lastName}
          </Text>
          <Text style={styles.email}>{profile?.email ?? "Email indisponible"}</Text>
        </View>

        <Text style={styles.sectionLabel}>COMPTE</Text>
        <InfoRow label="École" value={schoolId ?? "-"} />
        <InfoRow label="ID Élève" value={studentId ?? "-"} />

        <Text style={styles.sectionLabel}>PRÉFÉRENCES</Text>
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
    backgroundColor: Colors.Background,
  },
  content: {
    paddingHorizontal: Spacing.space4,
    paddingBottom: 120,
  },
  title: {
    ...Typography.H2,
    color: Colors.TextPrimary,
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
    backgroundColor: Colors.AccentBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...Typography.H2,
    color: "#FFFFFF",
  },
  name: {
    ...Typography.H3,
    color: Colors.TextPrimary,
  },
  email: {
    ...Typography.Body,
    color: Colors.TextSecondary,
  },
  sectionLabel: {
    ...Typography.Label,
    color: Colors.TextSecondary,
    marginBottom: Spacing.space2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.Surface,
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
    color: Colors.TextPrimary,
  },
  infoValue: {
    ...Typography.Body,
    color: Colors.TextSecondary,
  },
  chevron: {
    fontSize: 24,
    color: Colors.TextTertiary,
  },
  logoutWrapper: {
    marginTop: Spacing.space5,
  },
  infoDanger: {
    color: Colors.Danger,
  },
});
