# Cabanga Mobile – Architecture & API Integration Plan

## 1. Project Goal
Create a **mobile application (React Native)** that acts as a modern client for the Cabanga school platform. The app will authenticate the user, retrieve their academic data using the existing Cabanga API, and present it in a mobile‑optimized interface.

The application **does not scrape HTML**. It communicates directly with the official API endpoints used by the web application.

---

# 2. Identified Cabanga Infrastructure

## 2.1 Authentication Server
Cabanga uses **OAuth2 / OpenID Connect with Keycloak**.

Token endpoint:

```
https://login.scolares.be/auth/realms/horizon/protocol/openid-connect/token
```

Returned JSON structure:

```
{
  "access_token": "JWT_TOKEN",
  "expires_in": 300,
  "refresh_expires_in": 1209600,
  "refresh_token": "REFRESH_TOKEN",
  "token_type": "Bearer",
  "id_token": "JWT",
  "session_state": "...",
  "scope": "openid email profile"
}
```

Meaning:

| Field | Description |
|-----|-----|
| access_token | JWT used to access Cabanga API |
| refresh_token | Used to refresh access token |
| expires_in | Access token lifetime (seconds) |
| refresh_expires_in | Refresh token lifetime |
| token_type | Always "Bearer" |

---

# 3. Cabanga API

All application data comes from:

```
https://api.scolares.be/cabanga/api/
```

## 3.1 Example School Identifier

Example school:

```
ASTYMOULIN
```

## 3.2 Example Student ID

Example:

```
51394301
```

The student ID must be retrieved dynamically via `/profiles` endpoint.

---

# 4. Known API Endpoints

## Profiles

```
GET /cabanga/api/profiles
```

Purpose:

Returns user profile and associated student IDs.

---

## School Schedule

```
GET /cabanga/api/schools/{school}/schedules/{year}
```

Example:

```
https://api.scolares.be/cabanga/api/schools/ASTYMOULIN/schedules/2025
```

Returns timetable structure.

---

## Holidays

```
GET /cabanga/api/schools/{school}/holidays?year=2025
```

Example:

```
https://api.scolares.be/cabanga/api/schools/ASTYMOULIN/holidays?year=2025
```

Returns school holiday periods.

---

## School Diary

```
GET /cabanga/api/schools/{school}/students/{studentId}/diary
```

Example:

```
https://api.scolares.be/cabanga/api/schools/ASTYMOULIN/students/51394301/diary?from=2026-03-02&to=2026-03-06
```

Example response:

```
{
  "date": "2026-03-02",
  "hour": "08:15",
  "lessonName": "SCIENCES",
  "lessonSubject": "Remise des évaluations et corrections.",
  "homeworkDone": false
}
```

---

# 5. Authentication Flow

## Step 1 — User Login

User inputs:

- email
- password

App sends:

```
POST /openid-connect/token
```

Body:

```
grant_type=password
client_id=cabanga
username=<email>
password=<password>
```

Server returns:

- access_token
- refresh_token

---

## Step 2 — Store Tokens

Tokens should be stored securely.

Recommended library:

```
expo-secure-store
```

Example:

```
SecureStore.setItemAsync("accessToken", token)
SecureStore.setItemAsync("refreshToken", refresh)
```

---

## Step 3 — API Requests

All API requests require the header:

```
Authorization: Bearer ACCESS_TOKEN
```

Example:

```
fetch(url, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

---

## Step 4 — Refresh Token

When the access token expires (after ~5 minutes):

```
POST /openid-connect/token
```

Body:

```
grant_type=refresh_token
refresh_token=<refresh_token>
client_id=cabanga
```

Server returns a new access token.

---

# 6. Application Architecture

## Technology Stack

Mobile framework:

```
React Native
```

Recommended tooling:

```
Expo
TypeScript
React Navigation
Axios
Zustand or Redux
```

---

# 7. Project Folder Structure

```
cabanga-mobile

src
 ├ api
 │   ├ auth.ts
 │   └ cabangaApi.ts
 │
 ├ screens
 │   ├ LoginScreen.tsx
 │   ├ HomeScreen.tsx
 │   ├ DiaryScreen.tsx
 │   ├ ScheduleScreen.tsx
 │   └ SettingsScreen.tsx
 │
 ├ components
 │   ├ LessonCard.tsx
 │   ├ DaySchedule.tsx
 │   └ HomeworkItem.tsx
 │
 ├ store
 │   └ authStore.ts
 │
 ├ utils
 │   └ dateUtils.ts
```

---

# 8. Core Logic of the App

## App Startup

```
Start app
 ↓
Check stored token
 ↓
If token valid → go to Home
If no token → show Login
```

---

## Login Process

```
User enters credentials
 ↓
POST token endpoint
 ↓
Receive access_token
 ↓
Store token
 ↓
Fetch profile
 ↓
Extract studentId
 ↓
Navigate to Home
```

---

## Load Diary Data

```
User opens diary screen
 ↓
Calculate week range
 ↓
Call /diary endpoint
 ↓
Transform JSON
 ↓
Display lessons
```

---

## Load Schedule

```
Open schedule screen
 ↓
Call /schedules endpoint
 ↓
Parse timetable
 ↓
Render weekly grid
```

---

# 9. Data Layer

API requests handled via a centralized service:

```
api/cabangaApi.ts
```

Example:

```
getDiary(studentId, from, to)
getSchedule(year)
getHolidays(year)
getProfile()
```

All functions automatically attach the Authorization header.

---

# 10. Token Management

Axios interceptor:

```
Attach token
If 401 → refresh token
Retry request
```

---

# 11. Possible Features

Future improvements:

- push notifications for homework
- offline cache
- widgets
- better calendar view
- dark mode

---

# 12. Development Steps

1. Initialize Expo project

2. Implement authentication

3. Fetch user profile

4. Fetch diary entries

5. Implement schedule screen

6. Implement token refresh

7. Add UI improvements

---

# 13. Concrete API Response Examples (Observed)

## Token Endpoint Response

Endpoint:

```
POST https://login.scolares.be/auth/realms/horizon/protocol/openid-connect/token
```

Example response:

```
{
  "access_token": "JWT_TOKEN",
  "expires_in": 300,
  "refresh_expires_in": 1209600,
  "refresh_token": "REFRESH_TOKEN",
  "token_type": "Bearer",
  "id_token": "JWT",
  "not-before-policy": 1721736085,
  "session_state": "SESSION_ID",
  "scope": "openid email profile"
}
```

Important fields used by the mobile app:

- access_token → used for all API requests
- refresh_token → used to obtain new access tokens
- expires_in → token lifetime (300s)

---

## Profiles Endpoint

Request:

```
GET https://api.scolares.be/cabanga/api/profiles
```

Headers:

```
Authorization: Bearer ACCESS_TOKEN
```

Example response:

```
[
 {
  "id": 51394301,
  "firstName": "Maël",
  "lastName": "Dayani Poty",
  "schoolId": "ASTYMOULIN",
  "schoolName": "Centre d'Enseignement Asty-Moulin",
  "type": "STUDENT",
  "parent": false,
  "student": true,
  "staffMember": false
 }
]
```

Important extracted values:

```
studentId = id
schoolId = schoolId
```

These values are required for almost all other endpoints.

---

## School Schedule (Time Slots)

Request:

```
GET /cabanga/api/schools/{school}/schedules/{year}
```

Example:

```
GET https://api.scolares.be/cabanga/api/schools/ASTYMOULIN/schedules/2025
```

Example response (partial):

```
{
 "times": [
  { "hour": "08:15", "label": "1" },
  { "hour": "09:05", "label": "2" },
  { "hour": "10:10", "label": "3" },
  { "hour": "11:00", "label": "4" },
  { "hour": "11:50", "label": "5" },
  { "hour": "12:40", "label": "6" },
  { "hour": "13:30", "label": "7" },
  { "hour": "14:30", "label": "8" },
  { "hour": "15:20", "label": "9" }
 ]
}
```

This defines the **daily lesson time slots**.

---

## Diary Endpoint (Most Important)

Request:

```
GET /cabanga/api/schools/{school}/students/{studentId}/diary
```

Example:

```
GET https://api.scolares.be/cabanga/api/schools/ASTYMOULIN/students/51394301/diary?from=2026-03-02&to=2026-03-06
```

Parameters:

```
from = start date
 to = end date
```

Example response element:

```
{
 "attributionId": 79149501,
 "date": "2026-03-02",
 "hour": "08:15",
 "lessonName": "SCIENCES",
 "lessonSubject": "Remise des évaluations et corrections.",
 "homeworkDone": false,
 "id": 96308068
}
```

Meaning:

| Field | Meaning |
|------|------|
| attributionId | internal lesson identifier |
| date | lesson date |
| hour | time slot |
| lessonName | subject name |
| lessonSubject | homework or lesson description |
| homeworkDone | boolean completion state |
| id | entry identifier |

The mobile app mainly displays:

```
lessonName
lessonSubject
hour
```

---

# 14. Final Data Flow Used by the Mobile App

Complete runtime logic:

```
App launch
 ↓
Check stored tokens
 ↓
If missing → Login screen
 ↓
Login request → token endpoint
 ↓
Store access_token + refresh_token
 ↓
Fetch /profiles
 ↓
Extract studentId and schoolId
 ↓
Fetch diary data
 ↓
Render UI
```

---

# End of document


