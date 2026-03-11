import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useEffect } from "react";

import { MainTabs } from "@/navigation/MainTabs";
import { RootStackParamList } from "@/navigation/types";
import { LoginScreen } from "@/screens/LoginScreen";
import { useAuthStore } from "@/store/authStore";
import { useAppTheme } from "@/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useAppTheme();
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.Background,
      card: theme.Surface,
      border: theme.Border,
      text: theme.TextPrimary,
      primary: theme.AccentBlue,
    },
  };

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (isBootstrapping) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: theme.Background }]}>
        <ActivityIndicator size="small" color={theme.AccentBlue} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
