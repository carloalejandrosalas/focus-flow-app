# FocusFlow

A focus management web app built with React, TypeScript, Tailwind CSS, and Firebase Firestore. Helps you stay productive using the **Pomodoro** and **Flowtime** techniques while tracking tasks and time spent.

---

## Features

- **Pomodoro Timer** — 25-min focus blocks with 5-min short breaks and 15-min long breaks after every 4 pomodoros. Circular progress ring with phase indicators.
- **Flowtime Timer** — Work in uninterrupted flow for as long as you need, then take a break proportional to your work time (recommended: 5 → 8 → 10 → 15 min).
- **Method Selector** — Switch between Pomodoro and Flowtime at any time (disabled mid-session).
- **Task Management** — Create tasks with a title, description, and priority (Low / Medium / High). Filter by status and search by name.
- **Time Tracking** — Every timer session is recorded in Firestore with method, phase, duration, and completion status.
- **Task Detail View** — See total time spent, pomodoros completed, status controls, and a full session history for each task.
- **Dashboard** — Overview of total focus time, pomodoros done, tasks completed, and in-progress items.

---

## Tech Stack

| Layer        | Technology                    |
| ------------ | ----------------------------- |
| UI framework | React 19 + TypeScript         |
| Routing      | React Router v7               |
| Styling      | Tailwind CSS v4 (Vite plugin) |
| Icons        | Lucide React                  |
| Backend / DB | Firebase Firestore            |
| Bundler      | Vite 8 + Rolldown             |
| Compiler     | React Compiler (babel preset) |
| Linter       | Oxlint                        |

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure Firebase

Copy the example env file and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

You can get these values from the [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps.

> Firestore collections (`tasks` and `sessions`) are created automatically on first write.

### 3. Run the dev server

```bash
pnpm dev
```

### 4. Build for production

```bash
pnpm build
```

---

## Project Structure

```
src/
  types/index.ts              — Shared TypeScript interfaces
  lib/firebase.ts             — Firebase init + Firestore helpers
  hooks/
    useTasks.ts               — Task CRUD and loading state
    useTimer.ts               — Pomodoro & Flowtime timer engine
  components/
    Layout.tsx                — App shell
    Navbar.tsx                — Top navigation
    MethodSelector.tsx        — Pomodoro / Flowtime toggle
    PomodoroTimer.tsx         — Countdown timer component
    FlowtimeTimer.tsx         — Stopwatch component
    TaskCard.tsx              — Task list item
    TaskForm.tsx              — Create / edit task modal
  pages/
    DashboardPage.tsx         — Stats and quick actions
    TimerPage.tsx             — Timer + task selector
    TasksPage.tsx             — Full task list with filters
    TaskDetailPage.tsx        — Task info and session history
```

See [CHANGELOG.md](CHANGELOG.md) for release history.
