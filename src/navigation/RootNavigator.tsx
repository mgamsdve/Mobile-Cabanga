import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useEffect } from "react";

import { MainTabs } from "@/navigation/MainTabs";
import { RootStackParamList } from "@/navigation/types";
import { LoginScreen } from "@/screens/LoginScreen";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.Background,
    card: Colors.Surface,
    border: Colors.Border,
    text: Colors.TextPrimary,
    primary: Colors.AccentBlue,
  },
};

export function RootNavigator() {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (isBootstrapping) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="small" color={Colors.AccentBlue} />
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
    backgroundColor: Colors.Background,
    alignItems: "center",
    justifyContent: "center",
  },
});
