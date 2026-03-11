import { useUiStore } from "@/store/uiStore";
import { Colors } from "@/theme/colors";

export type ThemeMode = "light" | "dark";

export const lightTheme = {
  ...Colors,
  Overlay: "rgba(0,0,0,0.4)",
  StatusBar: "dark" as const,
};

export const darkTheme = {
  Background: "#121212",
  Surface: "#1E1E1E",
  SurfaceDone: "#193026",
  SurfaceRaised: "#1E1E1E",
  Border: "#2A2A2F",
  BorderStrong: "#3B3B42",
  TextPrimary: "#FFFFFF",
  TextSecondary: "#BBBBBB",
  TextTertiary: "#8A8A99",
  AccentBlue: "#6EA2FF",
  AccentBlueSoft: "#1D2E4D",
  Success: "#34D399",
  SuccessSoft: "#143026",
  Warning: "#FBBF24",
  WarningSoft: "#3B2B10",
  Danger: "#F87171",
  DangerSoft: "#3A1616",
  TabBarBg: "#1A1A1D",
  TabBarBorder: "#2A2A2F",
  Overlay: "rgba(0,0,0,0.6)",
  StatusBar: "light" as const,
};

export function useAppTheme() {
  const themeMode = useUiStore((state) => state.themeMode);
  return themeMode === "dark" ? darkTheme : lightTheme;
}
