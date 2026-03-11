# Cabanga+ Mobile

Application mobile pour la plateforme **Cabanga** — agenda scolaire et horaires pour les élèves.

Développée avec **React Native (Expo)** et **TypeScript**.

---

## Table des matières

- [Description](#description)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Installation](#installation)
- [Lancement](#lancement)
- [Structure du projet](#structure-du-projet)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts disponibles](#scripts-disponibles)

---

## Description

**Cabanga+** est une application mobile qui permet aux élèves de consulter :

- leur **agenda scolaire** (devoirs, leçons)
- leur **horaire hebdomadaire**
- les **congés scolaires**
- leur **profil**

L'application communique avec l'API Cabanga via un client Axios sécurisé avec gestion automatique des tokens d'accès.

---

## Fonctionnalités

- 🔐 Authentification sécurisée avec gestion des tokens (access + refresh)
- 📔 Agenda scolaire avec navigation par semaine
- 🗓️ Horaire hebdomadaire
- 🏖️ Affichage des congés scolaires
- 👤 Profil utilisateur
- 📶 Mode hors-ligne avec cache local
- 🌙 Support du mode sombre / clair

---

## Stack technique

| Outil                   | Rôle                          |
| ----------------------- | ----------------------------- |
| React Native (Expo)     | Framework mobile              |
| TypeScript              | Langage principal             |
| React Navigation        | Navigation entre les écrans   |
| Axios                   | Requêtes HTTP                 |
| Zustand                 | Gestion de l'état global      |
| expo-secure-store       | Stockage sécurisé des tokens  |
| AsyncStorage            | Cache local des données       |
| react-native-reanimated | Animations fluides            |

---

## Architecture

L'application suit une architecture en couches :

```
UI Layer (écrans et composants)
        ↓
State Layer (stores Zustand)
        ↓
API Layer (client Axios)
        ↓
API Cabanga (https://api.scolares.be/cabanga/api)
```

---

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [pnpm](https://pnpm.io/) (gestionnaire de paquets)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Un émulateur Android/iOS ou l'application **Expo Go** sur votre téléphone

### Cloner le projet

```bash
git clone https://github.com/mgamsdve/Mobile-Cabanga.git
cd Mobile-Cabanga
```

### Installer les dépendances

```bash
pnpm install
```

---

## Lancement

### Démarrer l'application

```bash
pnpm start
```

### Lancer sur Android

```bash
pnpm android
```

### Lancer sur iOS

```bash
pnpm ios
```

### Lancer dans le navigateur (web)

```bash
pnpm web
```

---

## Structure du projet

```
Mobile-Cabanga/
├── src/
│   ├── api/
│   │   ├── auth.ts           # Authentification
│   │   └── cabangaApi.ts     # Client Axios + fonctions API
│   ├── components/           # Composants UI réutilisables
│   ├── navigation/
│   │   ├── RootNavigator.tsx # Navigation principale
│   │   └── MainTabs.tsx      # Onglets du bas
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── DiaryScreen.tsx
│   │   ├── ScheduleScreen.tsx
│   │   ├── HolidaysScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── store/
│   │   ├── authStore.ts      # Authentification
│   │   ├── diaryStore.ts     # Agenda
│   │   ├── scheduleStore.ts  # Horaire
│   │   └── uiStore.ts        # État UI
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   └── utils/
│       ├── dateUtils.ts
│       └── subjectColors.ts
├── assets/                   # Images, icônes, polices
├── App.tsx                   # Point d'entrée principal
├── app.json                  # Configuration Expo
├── package.json
└── tsconfig.json
```

---

## Variables d'environnement

Aucune variable d'environnement n'est requise pour le développement local. L'URL de l'API est configurée directement dans `src/api/cabangaApi.ts` :

```
https://api.scolares.be/cabanga/api
```

---

## Scripts disponibles

| Commande          | Description                          |
| ----------------- | ------------------------------------ |
| `pnpm start`      | Démarre le serveur de développement  |
| `pnpm android`    | Lance l'app sur Android              |
| `pnpm ios`        | Lance l'app sur iOS                  |
| `pnpm web`        | Lance l'app dans le navigateur       |
| `pnpm typecheck`  | Vérifie les types TypeScript         |

---

## Licence

Projet privé — © Cabanga / Scolares.be
