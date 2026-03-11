import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, StyleSheet, Text, View } from "react-native";

import { MainTabParamList, DiaryStackParamList, HolidaysStackParamList, HomeStackParamList, ProfileStackParamList, ScheduleStackParamList } from "@/navigation/types";
import { DiaryScreen } from "@/screens/DiaryScreen";
import { HolidaysScreen } from "@/screens/HolidaysScreen";
import { HomeScreen } from "@/screens/HomeScreen";
import { LessonDetailScreen } from "@/screens/LessonDetailScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { ScheduleScreen } from "@/screens/ScheduleScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { useUiStore } from "@/store/uiStore";
import { useAppTheme } from "@/theme";

const Tabs = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DiaryStack = createNativeStackNavigator<DiaryStackParamList>();
const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();
const HolidaysStack = createNativeStackNavigator<HolidaysStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function TabIcon({
  iosName,
  androidName,
  focused,
  color,
}: {
  iosName: keyof typeof Ionicons.glyphMap;
  androidName: keyof typeof MaterialCommunityIcons.glyphMap;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={styles.tabIconWrapper}>
      {Platform.OS === "ios" ? (
        <Ionicons name={iosName} size={22} color={color} />
      ) : (
        <MaterialCommunityIcons name={androidName} size={22} color={color} />
      )}
      <View style={[styles.activeDot, { opacity: focused ? 1 : 0, backgroundColor: color }]} />
    </View>
  );
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={{
          presentation: "transparentModal",
          animation: "none",
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
    </HomeStack.Navigator>
  );
}

function DiaryStackNavigator() {
  return (
    <DiaryStack.Navigator screenOptions={{ headerShown: false }}>
      <DiaryStack.Screen name="Diary" component={DiaryScreen} />
      <DiaryStack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={{
          presentation: "transparentModal",
          animation: "none",
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
    </DiaryStack.Navigator>
  );
}

function ScheduleStackNavigator() {
  return (
    <ScheduleStack.Navigator screenOptions={{ headerShown: false }}>
      <ScheduleStack.Screen name="Schedule" component={ScheduleScreen} />
      <ScheduleStack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={{
          presentation: "transparentModal",
          animation: "none",
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      />
    </ScheduleStack.Navigator>
  );
}

function HolidaysStackNavigator() {
  return (
    <HolidaysStack.Navigator screenOptions={{ headerShown: false }}>
      <HolidaysStack.Screen name="Holidays" component={HolidaysScreen} />
    </HolidaysStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

export function MainTabs() {
  const theme = useAppTheme();

  return (
    <Tabs.Navigator
      initialRouteName="DiaryTab"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.AccentBlue,
        tabBarInactiveTintColor: theme.TextTertiary,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.TabBarBg,
            borderTopColor: theme.TabBarBorder,
          },
        ],
      }}
      screenListeners={({ route }) => ({
        state: () => {
          useUiStore.getState().setActiveTab(route.name);
        },
      })}
    >
      <Tabs.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iosName="home" androidName="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="DiaryTab"
        component={DiaryStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iosName="book" androidName="book" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ScheduleTab"
        component={ScheduleStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iosName="calendar-outline" androidName="calendar-month" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="HolidaysTab"
        component={HolidaysStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iosName="sunny" androidName="white-balance-sunny" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iosName="person" androidName="account" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingTop: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
  },
});
