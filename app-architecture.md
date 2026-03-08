# Cabanga Mobile — Application Architecture Plan

> This document defines the **technical architecture** of the Cabanga Mobile application.
>
> It sits between:
>
> * `structure_plan.md` → backend / API reference
> * `frontend-plan.md` → UX/UI design specification
>
> This document explains **how the application should be implemented internally**.

---

# 1. Architecture Overview

The application follows a **layered architecture**:

```
UI Layer
↓
State Layer
↓
API Layer
↓
External API (Cabanga)
```

Each layer has a clear responsibility.

| Layer    | Responsibility                |
| -------- | ----------------------------- |
| UI       | Screens and components        |
| State    | Application state and caching |
| API      | HTTP communication            |
| External | Cabanga API                   |

---

# 2. Technology Stack

The application must use the following stack:

Mobile Framework

```
React Native (Expo)
```

Language

```
TypeScript
```

Navigation

```
React Navigation
```

Networking

```
Axios
```

State management

```
Zustand
```

Secure storage

```
expo-secure-store
```

Local persistence

```
AsyncStorage
```

Animations

```
react-native-reanimated
```

---

# 3. Folder Architecture

The project must follow this folder structure.

```
src/

api/
auth.ts
cabangaApi.ts

components/
(shared UI components)

screens/
LoginScreen.tsx
HomeScreen.tsx
DiaryScreen.tsx
LessonDetailScreen.tsx
ScheduleScreen.tsx
HolidaysScreen.tsx
ProfileScreen.tsx
SettingsScreen.tsx

navigation/
RootNavigator.tsx
MainTabs.tsx

store/
authStore.ts
diaryStore.ts
scheduleStore.ts
uiStore.ts

theme/
colors.ts
spacing.ts
typography.ts

utils/
dateUtils.ts
subjectColors.ts
```

---

# 4. State Management Architecture

State is handled using **Zustand stores**.

The application contains four main stores.

---

# 4.1 authStore

Responsible for authentication state.

State:

```
accessToken
refreshToken
studentId
schoolId
userProfile
isAuthenticated
```

Actions:

```
login()
logout()
refreshToken()
setProfile()
```

Responsibilities:

* storing tokens
* managing login/logout
* refreshing expired tokens
* exposing `isAuthenticated`

---

# 4.2 diaryStore

Responsible for diary data.

State:

```
weeksCache
currentWeek
selectedDay
loading
error
```

Structure example:

```
weeksCache = {
  "2026-03-02": WeekData
}
```

Actions:

```
fetchWeek()
setSelectedDay()
refreshWeek()
```

Responsibilities:

* caching weeks
* storing diary entries
* grouping entries by day
* controlling loading states

---

# 4.3 scheduleStore

Responsible for schedule data.

State:

```
schedule
selectedDay
loading
```

Actions:

```
fetchSchedule()
setSelectedDay()
```

Responsibilities:

* fetching schedule
* storing weekly timetable

---

# 4.4 uiStore

Responsible for UI-only state.

State:

```
localHomeworkOverrides
activeTab
isOffline
```

Example:

```
localHomeworkOverrides = {
  entryId: true
}
```

Used for marking homework as done locally.

---

# 5. API Layer

All API communication must go through:

```
src/api/cabangaApi.ts
```

No screen should directly call `fetch()`.

---

# 5.1 Axios Client

Create a shared Axios instance.

Example:

```
axios.create({
  baseURL: "https://api.scolares.be/cabanga/api",
  timeout: 10000
})
```

---

# 5.2 Request Interceptor

Attach the token automatically.

```
Authorization: Bearer ACCESS_TOKEN
```

---

# 5.3 Response Interceptor

Handle authentication errors.

Flow:

```
If response = 401
→ call refreshToken()
→ retry request
```

If refresh fails:

```
logout()
navigate(LoginScreen)
```

---

# 6. API Functions

All endpoints are wrapped in API functions.

Example functions:

```
getProfiles()

getDiary(
  studentId,
  from,
  to
)

getSchedule(year)

getHolidays(year)
```

These functions are called by stores.

Screens **never call API functions directly**.

---

# 7. Application Startup Flow

Application boot process:

```
App Launch
↓
Load tokens from SecureStore
↓
If tokens exist
↓
Attempt refresh token
↓
If success
↓
Fetch profile
↓
Extract studentId + schoolId
↓
Open MainTabs
```

If refresh fails:

```
Show LoginScreen
```

---

# 8. Diary Data Flow

Diary screen uses the following logic.

```
DiaryScreen mounts
↓
Compute week range
↓
diaryStore.fetchWeek()
↓
Call API /diary
↓
Store entries in weeksCache
↓
Render LessonCards
```

---

# 9. Caching Strategy

Diary data should be cached.

Cache key:

```
weekStartDate
```

Example:

```
2026-03-02
```

Rules:

| Event           | Action                   |
| --------------- | ------------------------ |
| first load      | fetch API                |
| week cached     | use cache                |
| pull-to-refresh | refetch                  |
| app restart     | reload from AsyncStorage |

---

# 10. Offline Handling

When network fails:

```
Use cached data
```

Display banner:

```
"Données hors ligne"
```

State variable:

```
uiStore.isOffline
```

---

# 11. Navigation System

Navigation uses **React Navigation**.

Structure:

```
RootNavigator
 ├ LoginScreen
 └ MainTabs
```

MainTabs:

```
Home
Diary
Schedule
Holidays
Profile
```

Each tab uses a **stack navigator**.

---

# 12. Error Handling

| Error         | Behavior           |
| ------------- | ------------------ |
| 401           | refresh token      |
| 403           | logout             |
| network error | show offline state |
| login failure | show inline error  |

---

# 13. Performance Guidelines

To ensure smooth UI:

Use:

```
FlatList
```

for diary entries.

Important properties:

```
keyExtractor
initialNumToRender
windowSize
removeClippedSubviews
```

---

# 14. Security Rules

Tokens must **never** be stored in AsyncStorage.

Use only:

```
expo-secure-store
```

Sensitive data:

```
access_token
refresh_token
```

---

# 15. Implementation Order

The project should be built in this order.

Step 1

```
Initialize Expo project
```

Step 2

```
Implement authStore
```

Step 3

```
Implement API client
```

Step 4

```
Implement navigation
```

Step 5

```
Implement DiaryScreen
```

Step 6

```
Implement remaining screens
```

Step 7

```
Add caching
```

Step 8

```
Add animations and polish
```

---

# 16. Final Development Model

Codex must use the following documents together:

Backend reference:

```
structure_plan.md
```

UI design:

```
frontend-plan.md
```

Application architecture:

```
app-architecture.md
```

All code generated must respect **all three documents simultaneously**.

---

End of document.
