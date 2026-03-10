import { NavigatorScreenParams } from "@react-navigation/native";

import { DiaryEntry } from "@/api/cabangaApi";

export type LessonDetailParams = {
  entry: DiaryEntry;
};

export type HomeStackParamList = {
  Home: undefined;
  LessonDetail: LessonDetailParams;
};

export type DiaryStackParamList = {
  Diary: undefined;
  LessonDetail: LessonDetailParams;
};

export type ScheduleStackParamList = {
  Schedule: undefined;
};

export type HolidaysStackParamList = {
  Holidays: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  DiaryTab: NavigatorScreenParams<DiaryStackParamList>;
  ScheduleTab: NavigatorScreenParams<ScheduleStackParamList>;
  HolidaysTab: NavigatorScreenParams<HolidaysStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
};
