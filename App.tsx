import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { RootNavigator } from "@/navigation/RootNavigator";
import { useUiStore } from "@/store/uiStore";
import { useAppTheme } from "@/theme";

export default function App() {
  const theme = useAppTheme();
  const loadThemePreference = useUiStore((state) => state.loadThemePreference);
  const themeReady = useUiStore((state) => state.themeReady);

  useEffect(() => {
    void loadThemePreference();
  }, [loadThemePreference]);

  if (!themeReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.Background }}>
        <SafeAreaProvider>
          <StatusBar style={theme.StatusBar} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.Background }}>
      <SafeAreaProvider>
        <StatusBar style={theme.StatusBar} />
        <RootNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
