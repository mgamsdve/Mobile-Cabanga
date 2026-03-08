# Cabanga Mobile — Frontend Plan

> **Audience:** This document is the authoritative UI/UX specification for Cabanga Mobile.
> It is written for an AI implementer (Codex) and must be followed precisely when building every screen, component, and interaction.
> Backend integration details live in `structure_plan.md`. This document covers **only** the frontend.

---

## Table of Contents

1. [Global UX Philosophy](#1-global-ux-philosophy)
2. [Navigation Architecture](#2-navigation-architecture)
3. [Screen List & Layouts](#3-screen-list--layouts)
4. [Diary UX — Core Feature](#4-diary-ux--core-feature)
5. [Component System](#5-component-system)
6. [Visual Hierarchy & Design Tokens](#6-visual-hierarchy--design-tokens)
7. [Interaction Design](#7-interaction-design)
8. [Data → UI Mapping](#8-data--ui-mapping)

---

## 1. Global UX Philosophy

### 1.1 Core Principle: Glanceability

Every screen must be designed so that a student picking up their phone can understand **what they need to do today in under 2 seconds**. Information density is controlled strictly — nothing unimportant is shown above the fold.

### 1.2 Design Pillars

| Pillar | Description |
|---|---|
| **Clarity first** | Typography, spacing, and hierarchy do the heavy lifting. No decoration for decoration's sake. |
| **Speed** | Navigation must feel instant. Skeleton loaders replace blank screens. Data is cached aggressively. |
| **Calm** | The palette is soft and neutral. Alerts are reserved for things that truly need attention. |
| **Depth through detail** | The surface is minimal, but tapping reveals rich context. Progressive disclosure everywhere. |
| **Consistency** | Same components, same spacing, same behaviors across every screen. |

### 1.3 Design References

The UI language is inspired by:

- **Linear** — tight spacing, monochrome base, surgical use of color for status
- **Notion Calendar** — clear day/week navigation, readable time blocks
- **Apple Reminders** — clean list hierarchy, satisfying completion interactions
- **Craft** — beautiful typography, breathing room, elegant cards

### 1.4 Target Users

Students aged 12–18. They use their phones quickly, often standing, often between classes. The app must reward fast interactions. Long scrolls and hidden menus are enemies.

### 1.5 Platform Targets

- iOS (iPhone SE and larger)
- Android (phones 360 dp wide and larger)
- Minimum iOS: 15 / Android: 10
- All layouts must handle safe area insets (notch, home bar, gesture nav)

---

## 2. Navigation Architecture

### 2.1 Overview

The app uses a **two-layer navigation system**:

1. **Bottom Tab Bar** — persistent, for top-level sections
2. **Stack Navigator** — per tab, for drilling into detail screens

There is also a **Root Stack** at the very top that handles the authentication gate (Login screen sits outside the tab bar entirely).

### 2.2 Root Navigator (Stack)

```
RootStack
├── LoginScreen          ← shown when unauthenticated
└── MainTabs             ← shown when authenticated
```

On app start, the app checks `expo-secure-store` for a valid token. If present, it navigates directly to `MainTabs`. If absent or expired and unrefreshable, it navigates to `LoginScreen`.

### 2.3 Main Tab Bar

```
MainTabs (Bottom Tab Navigator)
├── Tab 1: Home          (icon: house.fill)
├── Tab 2: Diary         (icon: book.fill)        ← ACTIVE / PRIMARY
├── Tab 3: Schedule      (icon: calendar)
├── Tab 4: Holidays      (icon: sun.max.fill)
└── Tab 5: Profile       (icon: person.fill)
```

**Tab bar rules:**
- The **Diary tab is the default active tab** on first launch after login.
- Tab bar uses SF Symbols on iOS, MaterialCommunityIcons on Android.
- Active tab color: `Accent Blue` (see Section 6).
- Inactive tab color: `Text Tertiary`.
- No labels — icons only, with a small active dot indicator beneath the active icon.
- Tab bar background: `Surface` color with a subtle top border.

### 2.4 Per-Tab Stack Navigators

```
HomeStack
└── HomeScreen

DiaryStack
├── DiaryScreen          ← default
└── LessonDetailScreen   ← pushed on lesson tap

ScheduleStack
└── ScheduleScreen

HolidaysStack
└── HolidaysScreen

ProfileStack
├── ProfileScreen
└── SettingsScreen
```

### 2.5 Navigation Transitions

- Default push: standard horizontal slide (React Navigation default).
- Modal push (e.g., LessonDetail on small screens): slide-up sheet.
- Tab switch: no animation (instant), preserving each tab's scroll position.

---

## 3. Screen List & Layouts

---

### 3.1 LoginScreen

**Purpose:** Authenticate the student with their Cabanga credentials.

**Layout:**

```
┌─────────────────────────────────┐
│                                 │
│         [Safe Area Top]         │
│                                 │
│                                 │
│         ┌───────────┐           │
│         │  Logo /   │           │
│         │  Wordmark │           │
│         └───────────┘           │
│                                 │
│    "Cabanga"   ← H1 title       │
│    "Connecte-toi à ton école"   │
│         ← Subtitle              │
│                                 │
│  ┌──────────────────────────┐   │
│  │  Email                   │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │  Mot de passe        👁  │   │
│  └──────────────────────────┘   │
│                                 │
│  ┌──────────────────────────┐   │
│  │    SE CONNECTER          │   │  ← Primary CTA button
│  └──────────────────────────┘   │
│                                 │
│  [Error message if failed]      │
│                                 │
│         [Safe Area Bottom]      │
└─────────────────────────────────┘
```

**Details:**
- Single-column centered layout, max width 380 dp on tablets.
- Logo is a simple text-based wordmark or SVG, no image dependency.
- Email field: `keyboardType="email-address"`, `autoCapitalize="none"`, `autoComplete="email"`.
- Password field: `secureTextEntry` toggled by eye icon.
- CTA button is full-width, rounded (radius 14), `Accent Blue` fill.
- Error message appears below the button as a small red inline notice — no modal.
- While loading: button shows a spinner, inputs are disabled.
- Keyboard behavior: `KeyboardAvoidingView` wrapping the form.
- No "forgot password" link in v1 (Cabanga handles this via web).

**User Flow:**
1. User enters email + password.
2. Tap SE CONNECTER.
3. App calls auth endpoint → stores tokens → fetches profile → extracts studentId + schoolId.
4. Navigate to `MainTabs` (default: DiaryScreen).
5. On error: show inline error, re-enable inputs.

---

### 3.2 HomeScreen

**Purpose:** A quick "Today at a glance" dashboard. Shows today's lessons and any urgent homework due tomorrow.

**Layout:**

```
┌─────────────────────────────────┐
│  [Safe Area Top]                │
│                                 │
│  Bonjour, [Prénom]    🔔        │
│  Lundi 3 mars                   │  ← Date subtitle
│                                 │
│  ─────────────────────────────  │
│                                 │
│  AUJOURD'HUI                    │  ← Section header
│                                 │
│  ┌─────────────────────────┐    │
│  │ 08:15  SCIENCES         │    │  ← LessonCard (compact)
│  │ Remise des évaluations  │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ 10:00  MATHÉMATIQUES    │    │
│  │ Exercices p. 42–44      │    │
│  └─────────────────────────┘    │
│  ...                            │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  À RENDRE DEMAIN                │  ← Section header (if any)
│                                 │
│  ┌─────────────────────────┐    │
│  │ FRANÇAIS                │    │  ← HomeworkItem (urgent)
│  │ Rédaction chapitre 3    │    │
│  └─────────────────────────┘    │
│                                 │
│  [Safe Area Bottom + Tab Bar]   │
└─────────────────────────────────┘
```

**Details:**
- Header uses the student's first name extracted from the profile.
- Bell icon in header is a placeholder for future notifications.
- "AUJOURD'HUI" section shows today's diary entries as compact `LessonCard` components.
- "À RENDRE DEMAIN" section shows diary entries from the next school day where `homeworkDone === false`.
- If no entries for today: show `EmptyState` component ("Pas de cours aujourd'hui 🎉").
- Scrollable with `ScrollView`. No pagination — all today's entries fit vertically.
- Pull-to-refresh refreshes today's diary data.

**User Flow:**
1. Screen mounts → fetch today's diary entries.
2. Render compact lesson list.
3. Tap a lesson → navigate to `LessonDetailScreen`.
4. Pull-to-refresh → re-fetch.

---

### 3.3 DiaryScreen *(Core Feature — see Section 4 for full detail)*

**Purpose:** The primary screen for browsing the class diary week by week, day by day.

This screen is the heart of the app. Section 4 is dedicated entirely to its design.

---

### 3.4 LessonDetailScreen

**Purpose:** Show the full detail of a single diary entry — subject, homework text, time, and completion status.

**Layout:**

```
┌─────────────────────────────────┐
│  [Safe Area Top]                │
│  ← Back        [Subject Name]  │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Subject pill badge     │    │  ← colored subject chip
│  │                         │    │
│  │  08:15                  │    │  ← large time
│  │  Lundi 3 mars 2026      │    │  ← date
│  └─────────────────────────┘    │
│                                 │
│  CONTENU DU COURS               │  ← section label
│                                 │
│  "Remise des évaluations et     │  ← homework/lesson text
│   corrections."                 │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  ┌─────────────────────────┐    │
│  │  ☐  Marquer comme fait  │    │  ← toggle (homeworkDone)
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Details:**
- Presented as a **bottom sheet modal** on phones (60% screen height, draggable to dismiss).
- On larger screens (tablets): pushed as a standard stack screen.
- Subject pill background color is derived from the subject name hash (see Section 6.4).
- `homeworkDone` toggle is local optimistic state for now (v1 note: the API does not expose a PATCH endpoint yet — toggle is visual only and stored locally).
- Text is fully selectable (allows copy).

---

### 3.5 ScheduleScreen

**Purpose:** Display the student's fixed weekly timetable.

**Layout:**

```
┌─────────────────────────────────┐
│  [Safe Area Top]                │
│  Emploi du temps                │  ← Screen title
│                                 │
│  [Lun] [Mar] [Mer] [Jeu] [Ven]  │  ← Day pill selector
│                                 │
│  ─────────────────────────────  │
│                                 │
│  08:00 ─── MATHÉMATIQUES ────   │
│  09:00 ─── FRANÇAIS      ────   │
│  10:00 ─── (récréation)  ────   │  ← visual break
│  10:15 ─── SCIENCES      ────   │
│  ...                            │
│                                 │
│  [Safe Area Bottom + Tab Bar]   │
└─────────────────────────────────┘
```

**Details:**
- Day selector is a horizontal pill strip. Selected day is highlighted with `Accent Blue` background, white text.
- Time column is fixed on the left (48 dp wide), schedule blocks flow to the right.
- Each block is a `ScheduleBlock` component.
- If the schedule API returns more data than a simple list (e.g., periods with rooms), display them using the same block system.
- Non-school time slots (lunch, recess) are shown as a slim neutral divider, not a full block.
- Pull-to-refresh reloads the schedule.
- Default selected day: today's weekday (or Monday if weekend).

---

### 3.6 HolidaysScreen

**Purpose:** Show upcoming school holiday periods.

**Layout:**

```
┌─────────────────────────────────┐
│  [Safe Area Top]                │
│  Congés scolaires               │  ← title
│                                 │
│  PROCHAINS CONGÉS               │  ← section header
│                                 │
│  ┌─────────────────────────┐    │
│  │  🌴  Vacances de Pâques │    │
│  │  14 avr — 28 avr 2026   │    │
│  │  Dans 23 jours          │    │  ← countdown
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  ☀️  Grandes vacances   │    │
│  │  1 juil — 31 août 2026  │    │
│  │  Dans 89 jours          │    │
│  └─────────────────────────┘    │
│                                 │
│  PASSÉS                         │  ← collapsed by default
│  [Show past holidays ›]         │
│                                 │
│  [Safe Area Bottom + Tab Bar]   │
└─────────────────────────────────┘
```

**Details:**
- Holidays are grouped: upcoming (sorted ascending) and past (collapsed).
- Each holiday card shows: name, date range, countdown in days (if upcoming).
- Emoji icon is assigned deterministically by the holiday name (summer → ☀️, Easter → 🐣, etc.) with a fallback 📅.
- Past holidays section is collapsed behind a "Show past" tap toggle.
- No pull-to-refresh needed (data changes rarely) — refresh on screen focus instead.

---

### 3.7 ProfileScreen

**Purpose:** Show the student's identity and access settings.

**Layout:**

```
┌─────────────────────────────────┐
│  [Safe Area Top]                │
│  Profil                         │
│                                 │
│         ┌───────────┐           │
│         │  Avatar   │           │  ← initials-based avatar circle
│         │  (circle) │           │
│         └───────────┘           │
│                                 │
│         Prénom Nom              │  ← from profile API
│         email@student.be        │  ← from profile API
│                                 │
│  ─────────────────────────────  │
│                                 │
│  COMPTE                         │
│  ┌─────────────────────────┐    │
│  │  École            ›     │    │
│  │  ASTYMOULIN             │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  ID Élève               │    │
│  │  51394301               │    │
│  └─────────────────────────┘    │
│                                 │
│  PRÉFÉRENCES                    │
│  ┌─────────────────────────┐    │
│  │  Paramètres         ›   │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Se déconnecter         │    │  ← destructive, red text
│  └─────────────────────────┘    │
│                                 │
│  [Safe Area Bottom + Tab Bar]   │
└─────────────────────────────────┘
```

**Details:**
- Avatar is a circle with the student's initials (first letter of first + last name), using `Accent Blue` background.
- School ID and student ID are read-only display rows.
- "Se déconnecter" clears all tokens from `expo-secure-store`, resets Zustand state, and navigates back to `LoginScreen`.
- Tap on "Paramètres" row navigates to `SettingsScreen`.

---

### 3.8 SettingsScreen

**Purpose:** App preferences.

**Layout:**

```
┌─────────────────────────────────┐
│  ← Profil                       │
│  Paramètres                     │
│                                 │
│  AFFICHAGE                      │
│  ┌─────────────────────────┐    │
│  │  Thème        Clair  ›  │    │  ← future: dark mode toggle
│  └─────────────────────────┘    │
│                                 │
│  DONNÉES                        │
│  ┌─────────────────────────┐    │
│  │  Vider le cache         │    │
│  └─────────────────────────┘    │
│                                 │
│  À PROPOS                       │
│  ┌─────────────────────────┐    │
│  │  Version       1.0.0    │    │
│  └─────────────────────────┘    │
│                                 │
└─────────────────────────────────┘
```

**Details:**
- Settings rows use a grouped list style (iOS-style visual grouping).
- Dark mode toggle is a placeholder in v1 (always shows "Clair").
- "Vider le cache" clears AsyncStorage diary cache.
- Version is read from `expo-constants`.

---

## 4. Diary UX — Core Feature

This section defines the Diary screen in exhaustive detail. Every decision here must be implemented exactly as described.

---

### 4.1 Screen Anatomy

The DiaryScreen is split into **three zones**:

```
┌─────────────────────────────────┐
│  Zone A: Header + Week Nav      │  ← sticky, always visible
│─────────────────────────────────│
│  Zone B: Day Tab Strip          │  ← sticky, always visible
│─────────────────────────────────│
│                                 │
│  Zone C: Lesson Feed            │  ← scrollable
│                                 │
│  [Safe Area Bottom + Tab Bar]   │
└─────────────────────────────────┘
```

---

### 4.2 Zone A — Header & Week Navigator

**Height:** ~56 dp

```
┌─────────────────────────────────┐
│  ‹  Semaine du 2–6 mars 2026  › │
└─────────────────────────────────┘
```

- Left chevron `‹` → navigate to previous week.
- Right chevron `›` → navigate to next week.
- Center label: "Semaine du [startDate] – [endDate]".
  - Format: "2–6 mars 2026" (same month), or "31 mars – 4 avr 2026" (cross-month).
- Week navigation is animated: content slides horizontally (left or right) when switching weeks.
- Tapping the center label navigates back to the **current week** ("today") — a useful shortcut.
- The current week label is shown in `Accent Blue` text; past weeks are `Text Secondary`; future weeks are `Text Primary`.

---

### 4.3 Zone B — Day Tab Strip

**Height:** ~44 dp

```
┌────┬────┬────┬────┬────┐
│ L  │ M  │ M  │ J  │ V  │
│  3 │  4 │  5 │  6 │  7 │
└────┴────┴────┴────┴────┘
```

- Five tabs: Lun, Mar, Mer, Jeu, Ven (Mon–Fri).
- Each tab shows: abbreviated day name + date number.
- Selected tab: `Accent Blue` underline (2 dp, pill shape), label in `Accent Blue`.
- Unselected: `Text Tertiary`.
- **Today's tab** (if in current week): shows a small `Accent Blue` dot above the number.
- If a day has **no entries** (holiday, no school): its tab label is dimmed to 40% opacity.
- Tapping a tab changes the active day instantly (no animation on the strip itself — the feed below slides/fades).
- On week change, the active day defaults to Monday (or today if the current week is selected).

---

### 4.4 Zone C — Lesson Feed

This is the scrollable list of diary entries for the selected day.

#### 4.4.1 Empty Day

If no diary entries exist for the selected day:

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│          📚                     │
│   Pas d'entrées pour ce jour    │
│                                 │
│                                 │
└─────────────────────────────────┘
```

Use `EmptyState` component (centered, icon + label, muted color).

#### 4.4.2 Lesson Entry Layout

Each entry is a `LessonCard`. Below is the full anatomy of a card:

```
┌──────────────────────────────────────┐
│  08:15   ●  SCIENCES                 │
│              ─────────────────────   │
│              Remise des évaluations  │
│              et corrections.         │
│                                      │
│              [ ✓ Fait ]              │  ← only if homeworkDone = true
└──────────────────────────────────────┘
```

**Card structure (left to right, top aligned):**

| Element | Description |
|---|---|
| Time column (left) | Shows `hour` value, 48 dp wide, right-aligned, small monospace font |
| Subject dot | A 8×8 dp filled circle, colored by subject (see Section 6.4) |
| Subject title | `lessonName` in uppercase, medium weight, `Text Primary` |
| Divider line | 1 dp line, `Border` color, below subject title |
| Homework text | `lessonSubject` in regular weight, `Text Secondary`, max 3 lines with expand |
| Done badge | Small pill badge "✓ Fait" in soft green, shown only when `homeworkDone === true` |

#### 4.4.3 Card States

| State | Visual |
|---|---|
| Default | White/Surface card, light shadow |
| Pressed | Scale 0.98, shadow reduces |
| Done | Card background shifts to `Surface Done` (very faint green tint), homework text has strikethrough |
| Loading | Skeleton shimmer replaces the card |

#### 4.4.4 Feed Grouping

Entries for a day are shown in **chronological order** by `hour`.

If two entries share the same hour (e.g., two courses at 08:15), they are stacked without a time separator between them — only the first entry in that time group shows the time label.

Example:
```
08:15   MATHÉMATIQUES
        Exercices p. 42

        PHYSIQUE                 ← same time, no time label repeated
        Lire chapitre 4
```

#### 4.4.5 Scrolling Behavior

- Feed uses a `FlatList` or `ScrollView` with `contentContainerStyle` padding.
- Scroll is **per-day** — switching days resets scroll position to top.
- Pull-to-refresh on the feed refreshes the full week data.
- No infinite scroll — all entries for a day fit in one pass.

#### 4.4.6 Week Data Loading

When a new week is loaded:
1. Show skeleton cards for all 5 days immediately.
2. Fetch `/diary?from=MONDAY&to=FRIDAY`.
3. Replace skeletons with real data.
4. Cache the result in-memory (and optionally AsyncStorage) for that week.
5. If network fails: show the last cached data with a subtle "Données hors ligne" banner at top.

---

### 4.5 Week Navigation Interaction

**Swipe gesture:**
- The user can **swipe horizontally** on the Lesson Feed (Zone C) to navigate between days (left swipe → next day, right swipe → previous day).
- At the last day of the week (Friday), swiping left advances to the next week.
- At the first day (Monday), swiping right retreats to the previous week.

**Visual feedback:**
- Day change: content fades out (80ms) and fades in on new day (120ms). Subtle, not distracting.
- Week change: the entire zone B + C cross-fades and the week label animates.

---

### 4.6 Today Navigation

In the header (Zone A), a "Aujourd'hui" button (text link, right-aligned) appears when the user is NOT on the current week:

```
‹  Semaine du 16–20 fév 2026  ›    [Aujourd'hui]
```

Tapping it jumps back to the current week and selects today's day tab.

---

### 4.7 Diary Data Refresh Policy

| Trigger | Action |
|---|---|
| Screen first mount | Fetch current week |
| Tab focus (returning to Diary tab) | Refresh if data is older than 5 minutes |
| Week navigation | Fetch new week if not cached |
| Pull-to-refresh | Force re-fetch current week |

---

### 4.8 Summary of Diary Screen Hierarchy

```
DiaryScreen
├── DiaryHeader          (Zone A: week label + navigation arrows)
├── DayTabStrip          (Zone B: day selector)
└── LessonFeed           (Zone C: scrollable list)
    ├── DayHeader        (optional top label "Lundi 3 mars")
    ├── LessonCard[]     (one per diary entry)
    │   ├── TimeLabel
    │   ├── SubjectDot
    │   ├── SubjectTitle
    │   ├── HomeworkText
    │   └── DoneBadge (conditional)
    └── EmptyState (if no entries)
```

---

## 5. Component System

All components live in `src/components/`. Every component must be typed with TypeScript props interfaces.

---

### 5.1 LessonCard

**File:** `src/components/LessonCard.tsx`

**Props:**
```typescript
interface LessonCardProps {
  hour: string;           // "08:15"
  lessonName: string;     // "SCIENCES"
  lessonSubject: string;  // "Remise des évaluations..."
  homeworkDone: boolean;
  showTime: boolean;      // false if same hour as previous card
  onPress: () => void;
}
```

**Behavior:**
- Renders the time column only if `showTime === true`.
- Card background changes when `homeworkDone === true`.
- `onPress` triggers navigation to `LessonDetailScreen`.
- Uses `TouchableOpacity` with `activeOpacity={0.8}` and a press scale animation.

**Dimensions:**
- Minimum height: 72 dp.
- Horizontal margin: 16 dp.
- Vertical gap between cards: 8 dp.
- Corner radius: 12 dp.
- Shadow: `shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2`.

---

### 5.2 DayHeader

**File:** `src/components/DayHeader.tsx`

**Props:**
```typescript
interface DayHeaderProps {
  date: string;       // ISO date "2026-03-02"
  isToday: boolean;
}
```

**Behavior:**
- Renders the full formatted date: "Lundi 3 mars".
- If `isToday === true`, appends "— Aujourd'hui" with `Accent Blue` color.
- Used at the top of the lesson feed for context.

**Dimensions:**
- Height: 40 dp.
- Horizontal padding: 16 dp.
- Font: `Label` style (see Section 6.1).

---

### 5.3 HomeworkItem

**File:** `src/components/HomeworkItem.tsx`

**Props:**
```typescript
interface HomeworkItemProps {
  subject: string;       // "FRANÇAIS"
  text: string;          // "Rédaction chapitre 3"
  isDone: boolean;
  isUrgent?: boolean;    // true if due tomorrow
  onToggleDone: () => void;
}
```

**Behavior:**
- Used in `HomeScreen` for the "À rendre demain" section.
- Tapping the checkbox area calls `onToggleDone`.
- `isUrgent === true` adds a small amber dot to the left edge.
- Text has strikethrough when `isDone === true`.

---

### 5.4 ScheduleBlock

**File:** `src/components/ScheduleBlock.tsx`

**Props:**
```typescript
interface ScheduleBlockProps {
  startTime: string;    // "08:00"
  endTime: string;      // "09:00"
  subject: string;      // "MATHÉMATIQUES"
  room?: string;        // "B204"
}
```

**Behavior:**
- Renders a horizontal block with time on left and subject on right.
- Height proportional to duration (1 hour = 56 dp).
- Subject background uses a faint tint of the subject color (10% opacity).
- Room label (if available) shown below subject name in small `Text Tertiary`.

---

### 5.5 WeekNavigator

**File:** `src/components/WeekNavigator.tsx`

**Props:**
```typescript
interface WeekNavigatorProps {
  weekLabel: string;        // "Semaine du 2–6 mars 2026"
  isCurrentWeek: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToToday: () => void;
}
```

**Behavior:**
- Renders Zone A of the DiaryScreen.
- Shows "Aujourd'hui" text button on the right only when `isCurrentWeek === false`.
- Tapping the center week label also calls `onGoToToday`.

---

### 5.6 DayTabStrip

**File:** `src/components/DayTabStrip.tsx`

**Props:**
```typescript
interface DayTabStripProps {
  days: DayTab[];           // array of 5 days (Mon–Fri)
  selectedIndex: number;    // 0–4
  onSelectDay: (index: number) => void;
}

interface DayTab {
  label: string;    // "Lun"
  date: number;     // day number, e.g. 3
  isToday: boolean;
  hasEntries: boolean;
}
```

**Behavior:**
- Renders 5 equal-width tappable cells.
- Active cell: `Accent Blue` underline, text in `Accent Blue`.
- Today marker: 4 dp dot above the date number, `Accent Blue`.
- Empty day: opacity 0.4.

---

### 5.7 EmptyState

**File:** `src/components/EmptyState.tsx`

**Props:**
```typescript
interface EmptyStateProps {
  icon: string;      // emoji, e.g. "📚"
  message: string;   // "Pas d'entrées pour ce jour"
  subtext?: string;  // optional secondary message
}
```

**Behavior:**
- Centered vertically in its parent container.
- Icon rendered in 40 dp font size.
- Message in `Body` style, `Text Secondary`.
- Subtext in `Caption` style, `Text Tertiary`.

---

### 5.8 SkeletonCard

**File:** `src/components/SkeletonCard.tsx`

**Props:**
```typescript
interface SkeletonCardProps {
  lines?: number;   // default 2
}
```

**Behavior:**
- Renders a shimmer animation placeholder matching `LessonCard` dimensions.
- Uses `Animated.loop` with opacity cycling between 0.4 and 1.0 (1200ms period).
- Background: `Surface` with `Border` color rectangles.

---

### 5.9 SubjectPill

**File:** `src/components/SubjectPill.tsx`

**Props:**
```typescript
interface SubjectPillProps {
  name: string;    // "SCIENCES"
  size?: 'sm' | 'md';
}
```

**Behavior:**
- Pill-shaped badge with subject name.
- Background color derived from `getSubjectColor(name)` utility (see Section 6.4).
- Foreground is always white.
- Used in `LessonDetailScreen`.

---

### 5.10 SectionHeader

**File:** `src/components/SectionHeader.tsx`

**Props:**
```typescript
interface SectionHeaderProps {
  title: string;
}
```

**Behavior:**
- Uppercase label with `Label` typography style.
- Horizontal padding: 16 dp.
- Vertical padding: 4 dp top, 8 dp bottom.
- Used before grouped list sections (e.g., "AUJOURD'HUI", "À RENDRE DEMAIN").

---

## 6. Visual Hierarchy & Design Tokens

### 6.1 Typography System

All fonts use the system font stack: **SF Pro** on iOS, **Roboto** on Android (via React Native's default).

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `H1` | 28 sp | 700 (Bold) | 34 | Screen titles, login heading |
| `H2` | 22 sp | 700 (Bold) | 28 | Section headings, card titles |
| `H3` | 18 sp | 600 (SemiBold) | 24 | Sub-headings |
| `Body` | 16 sp | 400 (Regular) | 22 | General text, homework text |
| `BodyMedium` | 16 sp | 500 (Medium) | 22 | Subject names, emphasized body |
| `Label` | 12 sp | 600 (SemiBold) | 16 | Section headers, uppercase labels |
| `Caption` | 12 sp | 400 (Regular) | 16 | Secondary info, timestamps |
| `Mono` | 14 sp | 400 (Regular) | 18 | Time values (hour) — use `fontVariant: ['tabular-nums']` |

**Rules:**
- Subject names (`lessonName`) always uppercase, `BodyMedium`.
- Time values always use `Mono`.
- Section headers always uppercase, `Label`, letter-spacing 0.8.
- Homework body text (`lessonSubject`) uses `Body`, `Text Secondary`.

---

### 6.2 Spacing System

Based on an 8 dp base unit.

| Token | Value | Use |
|---|---|---|
| `space-1` | 4 dp | Icon-to-label gap |
| `space-2` | 8 dp | Card internal padding (vertical), between list items |
| `space-3` | 12 dp | Between grouped elements |
| `space-4` | 16 dp | Horizontal screen margin, card padding |
| `space-5` | 24 dp | Between major sections |
| `space-6` | 32 dp | Screen-level top/bottom padding |
| `space-8` | 48 dp | Time column width |

**Rules:**
- Screen horizontal margins: always `space-4` (16 dp).
- Vertical space between cards: `space-2` (8 dp).
- Vertical space between sections: `space-5` (24 dp).

---

### 6.3 Color System (Light Mode)

All colors are defined as design tokens in `src/theme/colors.ts`.

```typescript
export const Colors = {
  // Backgrounds
  Background:    '#F9F9FB',   // page background
  Surface:       '#FFFFFF',   // card / sheet background
  SurfaceDone:   '#F0FBF4',   // done card background (faint green)
  SurfaceRaised: '#FFFFFF',   // elevated surface

  // Borders
  Border:        '#E8E8ED',   // card borders, dividers
  BorderStrong:  '#D1D1D8',   // separators

  // Text
  TextPrimary:   '#0D0D12',   // main readable text
  TextSecondary: '#6B6B80',   // secondary info
  TextTertiary:  '#A0A0B4',   // placeholder, muted

  // Accent
  AccentBlue:    '#3B7BF8',   // primary action, active states, today
  AccentBlueSoft:'#EEF3FF',   // light tint of accent

  // Semantic
  Success:       '#22C55E',   // done badge
  SuccessSoft:   '#DCFCE7',
  Warning:       '#F59E0B',   // urgent homework
  WarningSoft:   '#FEF3C7',
  Danger:        '#EF4444',   // error, destructive
  DangerSoft:    '#FEE2E2',

  // Tab bar
  TabBarBg:      '#FFFFFF',
  TabBarBorder:  '#E8E8ED',
};
```

**Color usage rules:**
- Never use raw hex values in components — always reference `Colors.*`.
- Do not use color alone to convey meaning — pair with icon or text.
- Red is reserved for errors and "Se déconnecter" only.

---

### 6.4 Subject Color System

Subject colors are deterministically derived from the subject name string. This ensures the same subject always gets the same color, across sessions.

**Algorithm:** Hash the subject name (simple djb2 or sumCharCodes) → index into a palette of 10 muted accent colors.

```typescript
const SUBJECT_PALETTE = [
  '#3B7BF8',  // blue
  '#8B5CF6',  // violet
  '#EC4899',  // pink
  '#F59E0B',  // amber
  '#10B981',  // emerald
  '#06B6D4',  // cyan
  '#EF4444',  // red
  '#84CC16',  // lime
  '#F97316',  // orange
  '#6366F1',  // indigo
];

export function getSubjectColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % SUBJECT_PALETTE.length;
  }
  return SUBJECT_PALETTE[Math.abs(hash)];
}
```

The subject dot in `LessonCard` and the pill in `LessonDetailScreen` use this color.

---

### 6.5 Elevation & Shadows

| Level | Use | Shadow |
|---|---|---|
| `elevation-0` | Backgrounds | none |
| `elevation-1` | Cards, list items | `shadowOpacity: 0.05, shadowRadius: 6, elevation: 1` |
| `elevation-2` | Bottom sheets, modals | `shadowOpacity: 0.12, shadowRadius: 16, elevation: 4` |
| `elevation-3` | Tab bar | `shadowOpacity: 0.08, shadowRadius: 8, elevation: 3` |

Shadow color is always `#000000`.

---

### 6.6 Border Radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 6 dp | Badges, pills |
| `radius-md` | 12 dp | Cards, list items |
| `radius-lg` | 16 dp | Bottom sheets, modals |
| `radius-xl` | 24 dp | Buttons |
| `radius-full` | 9999 dp | Avatar, dot indicators |

---

## 7. Interaction Design

### 7.1 Tapping a Lesson Card

1. User taps a `LessonCard`.
2. Card scales down to 0.97 immediately (spring animation, stiffness 300, damping 20).
3. After 100ms, navigate to `LessonDetailScreen`.
4. On Android: ripple effect is disabled in favor of the scale animation (for visual consistency).
5. On iOS: `TouchableOpacity` with `activeOpacity={0.85}`.

Implementation:
```typescript
// Use Animated.spring for the scale
const scale = useRef(new Animated.Value(1)).current;
const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
```

---

### 7.2 Marking Homework Done

1. User taps the checkbox / "Marquer comme fait" row in `LessonDetailScreen`.
2. Optimistic update: `homeworkDone` toggles immediately in local state.
3. Card background transitions from `Surface` to `SurfaceDone` (300ms fade).
4. Homework text gets strikethrough (300ms transition).
5. A "✓ Fait" badge fades in.
6. A subtle haptic feedback fires (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` via `expo-haptics`).

Note: In v1, this state is stored locally (Zustand + AsyncStorage persistence). No API PATCH call is made as the endpoint is not yet available.

---

### 7.3 Switching Days (Day Tab Strip)

1. User taps a day tab.
2. The active underline slides horizontally to the new tab (spring animation).
3. The Lesson Feed fades out (80ms, opacity → 0) and scrolls to top.
4. New day's entries fade in (120ms, opacity → 1).
5. If the new day's data is not cached, skeleton cards appear during the brief flash.

---

### 7.4 Switching Weeks

1. User taps `‹` or `›` arrow in `WeekNavigator`.
2. Arrow briefly highlights (opacity 0.5 → 1).
3. Week label animates with a quick fade + slight horizontal offset (translateX ±8 dp).
4. Day tab strip resets to Monday (or today if current week).
5. Lesson feed shows skeleton while data loads.

---

### 7.5 Swipe Navigation (Diary Feed)

1. User swipes left → advances to next day.
2. At end of week (Friday), swipes left → advances to next week, selects Monday.
3. Swipe threshold: 50 dp horizontal delta with velocity > 0.3.
4. Content slides horizontally as finger moves (parallax feel, max 30 dp resistance).
5. On release past threshold: snap to new day with spring.
6. On release below threshold: spring back to current day.

Implementation approach: Use `PanResponder` or `react-native-gesture-handler`'s `PanGestureHandler`.

---

### 7.6 Pull-to-Refresh

1. User pulls down on the Lesson Feed.
2. Standard `RefreshControl` component with `tintColor={Colors.AccentBlue}`.
3. Triggers re-fetch of the current week's diary data.
4. On complete: spinner disappears, data updates.

---

### 7.7 Loading States

| Screen | Loading approach |
|---|---|
| DiaryScreen (initial) | 3 skeleton `LessonCard` components |
| HomeScreen (initial) | 2 skeleton cards per section |
| ScheduleScreen | Full screen skeleton blocks |
| HolidaysScreen | 2 skeleton holiday cards |
| LoginScreen (submitting) | Button spinner + disabled inputs |

Skeleton animation: pulse (opacity 0.4 → 0.9, loop, 1200ms, `Animated.loop`).

---

### 7.8 Error States

| Error type | UI response |
|---|---|
| Network error on load | `EmptyState` with "⚠️ Impossible de charger les données. Tire pour réessayer." |
| Auth error (401) | Transparent — Axios interceptor refreshes token silently |
| Refresh token expired | Redirect to `LoginScreen` with a brief toast "Session expirée" |
| Login failure (wrong password) | Inline error below button: "Email ou mot de passe incorrect." in `Danger` color |

Toast implementation: use `react-native-toast-message` or a simple custom `Animated.View` banner at top.

---

### 7.9 Tab Bar Feedback

- Tapping an already-active tab scrolls the current screen back to top.
- Tab icons scale to 1.15 briefly on tap (spring, 200ms).
- No badge counts in v1.

---

## 8. Data → UI Mapping

This section precisely maps every API response field to its UI representation.

---

### 8.1 Diary Entry → LessonCard

API response shape (from `GET /diary`):

```json
{
  "date": "2026-03-02",
  "hour": "08:15",
  "lessonName": "SCIENCES",
  "lessonSubject": "Remise des évaluations et corrections.",
  "homeworkDone": false
}
```

| API Field | Component | Visual Element | Notes |
|---|---|---|---|
| `date` | `DayHeader` | "Lundi 3 mars" | Parsed with `dateUtils.formatDayLabel(date)` |
| `hour` | `LessonCard > TimeLabel` | "08:15" | Monospaced, right-aligned in 48 dp column |
| `lessonName` | `LessonCard > SubjectTitle` | "SCIENCES" | Uppercase, BodyMedium, TextPrimary |
| `lessonName` | `LessonCard > SubjectDot` | Colored dot | `getSubjectColor(lessonName)` |
| `lessonSubject` | `LessonCard > HomeworkText` | Lesson/homework text | Body, TextSecondary |
| `homeworkDone` | `LessonCard > DoneBadge` | "✓ Fait" badge | Shown only when `true`; card tint changes |
| `date` | `DayTabStrip` | Day tab highlight | Tab for this date is highlighted |
| `lessonName` | `SubjectPill` | Colored pill in detail screen | Pill background from `getSubjectColor` |

---

### 8.2 Multiple Entries Same Hour

When two or more entries share the same `hour` value on the same `date`:

- The `hour` is displayed only on the **first** card in the group (`showTime = true`).
- Subsequent cards in the group receive `showTime = false` → time column is empty but still reserves 48 dp for alignment.

```typescript
// In DiaryScreen, before rendering:
const entriesWithShowTime = entries.map((entry, index) => ({
  ...entry,
  showTime: index === 0 || entry.hour !== entries[index - 1].hour,
}));
```

---

### 8.3 Profile Data → UI

API response shape (from `GET /profiles`):

```json
{
  "firstName": "Marie",
  "lastName": "Dupont",
  "email": "marie.dupont@school.be",
  "studentId": "51394301",
  "schoolId": "ASTYMOULIN"
}
```

| API Field | UI Location | Visual Element |
|---|---|---|
| `firstName` | `HomeScreen` header | "Bonjour, Marie" |
| `firstName` + `lastName` | `ProfileScreen` | Full name label |
| `email` | `ProfileScreen` | Email label below name |
| `firstName[0]` + `lastName[0]` | `ProfileScreen` | Avatar circle initials "MD" |
| `schoolId` | `ProfileScreen` | School row value "ASTYMOULIN" |
| `studentId` | `ProfileScreen` | Student ID row value "51394301" |

---

### 8.4 Schedule Data → ScheduleBlock

API response shape (from `GET /schedules/{year}` — inferred):

| API Field | Component | Visual Element |
|---|---|---|
| Start time | `ScheduleBlock > startTime` | Left time label |
| End time | `ScheduleBlock > endTime` | Duration height calculation |
| Subject name | `ScheduleBlock > subject` | Subject text, tinted background |
| Room (if present) | `ScheduleBlock > room` | Small label below subject |

---

### 8.5 Holiday Data → HolidaysScreen

API response shape (from `GET /holidays?year=2025` — inferred):

```json
[
  {
    "name": "Vacances de Pâques",
    "startDate": "2026-04-14",
    "endDate": "2026-04-28"
  }
]
```

| API Field | Visual Element | Notes |
|---|---|---|
| `name` | Holiday card title | Full name displayed |
| `startDate` | "14 avr" | Formatted via `dateUtils.formatShortDate(date)` |
| `endDate` | "28 avr 2026" | Full formatted date |
| computed | "Dans 23 jours" | `dateUtils.daysUntil(startDate)` if in future |
| `name` | Emoji icon | Deterministic emoji from name keywords |

---

### 8.6 Date Utility Functions

All date formatting is centralized in `src/utils/dateUtils.ts`.

```typescript
// Converts "2026-03-02" → "Lundi 3 mars"
formatDayLabel(isoDate: string): string

// Converts "2026-03-02" → "3 mars"
formatShortDate(isoDate: string): string

// Returns "2–6 mars 2026" or "31 mars – 4 avr 2026"
formatWeekLabel(mondayISO: string, fridayISO: string): string

// Returns ISO date of Monday of the week containing `date`
getMondayOfWeek(date: Date): string

// Returns ISO date of Friday of the week containing `date`
getFridayOfWeek(date: Date): string

// Returns number of calendar days from today to `isoDate`
daysUntil(isoDate: string): number

// Returns true if isoDate represents today
isToday(isoDate: string): boolean

// Returns abbreviated day label "Lun", "Mar", etc.
getShortDayLabel(isoDate: string): string

// Format: "08:15" remains "08:15" (pass-through for safety)
formatHour(hour: string): string
```

All functions must use the locale `fr-BE` for date formatting (Belgian French).

---

## Appendix A — File Structure Reference

```
src/
├── api/
│   ├── auth.ts
│   └── cabangaApi.ts
│
├── components/
│   ├── DayHeader.tsx
│   ├── DayTabStrip.tsx
│   ├── EmptyState.tsx
│   ├── HomeworkItem.tsx
│   ├── LessonCard.tsx
│   ├── ScheduleBlock.tsx
│   ├── SectionHeader.tsx
│   ├── SkeletonCard.tsx
│   ├── SubjectPill.tsx
│   └── WeekNavigator.tsx
│
├── screens/
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── DiaryScreen.tsx
│   ├── LessonDetailScreen.tsx
│   ├── ScheduleScreen.tsx
│   ├── HolidaysScreen.tsx
│   ├── ProfileScreen.tsx
│   └── SettingsScreen.tsx
│
├── navigation/
│   ├── RootNavigator.tsx
│   ├── MainTabs.tsx
│   └── types.ts              ← NavigationProp types
│
├── store/
│   ├── authStore.ts           ← tokens, studentId, schoolId
│   ├── diaryStore.ts          ← diary entries cache, selected week/day
│   └── uiStore.ts             ← local UI state (homeworkDone overrides)
│
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts               ← re-exports all tokens
│
└── utils/
    ├── dateUtils.ts
    └── subjectColors.ts
```

---

## Appendix B — Third-Party Libraries Required

| Library | Purpose |
|---|---|
| `react-navigation/native` | Navigation container |
| `react-navigation/bottom-tabs` | Tab bar |
| `react-navigation/stack` | Stack screens |
| `react-native-safe-area-context` | Safe area insets |
| `react-native-screens` | Native screen optimization |
| `react-native-gesture-handler` | Swipe gestures on diary |
| `react-native-reanimated` | Smooth animations |
| `expo-haptics` | Haptic feedback |
| `expo-secure-store` | Secure token storage |
| `axios` | HTTP client |
| `zustand` | State management |

---

## Appendix C — Screen Navigation Map

```
[Not authenticated]
  └── LoginScreen
        └── (success) → MainTabs

[MainTabs]
  ├── HomeTab
  │     └── HomeScreen
  │           └── (tap lesson) → LessonDetailScreen (modal)
  │
  ├── DiaryTab  ← DEFAULT
  │     └── DiaryScreen
  │           └── (tap lesson) → LessonDetailScreen (modal)
  │
  ├── ScheduleTab
  │     └── ScheduleScreen
  │
  ├── HolidaysTab
  │     └── HolidaysScreen
  │
  └── ProfileTab
        ├── ProfileScreen
        │     └── (tap settings) → SettingsScreen
        └── SettingsScreen
              └── (logout) → LoginScreen (reset stack)
```

---

*End of frontend-plan.md*