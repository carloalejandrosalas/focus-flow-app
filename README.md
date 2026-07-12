# 🧠 FocusFlow

Stop doom-scrolling, start actually doing things. FocusFlow keeps you on track with **Pomodoro** and **Flowtime** timers, task management, and time logging — because your brain deserves better than 47 open browser tabs.

---

## ✨ What it does

### 🍅 Pomodoro Timer

Classic 25-min focus blocks, 5-min breathers, and a well-earned 15-min long break after every 4 rounds. Comes with a circular progress ring so you can watch time melt away in style.

### 🌊 Flowtime Timer

For when you're _actually in the zone_ and a 25-minute cutoff feels criminal. Work as long as you're flowing, then take a break proportional to your effort. No arbitrary interruptions.

### ⚡ Method Selector

Flip between Pomodoro and Flowtime whenever you like — just not mid-session. We're focused here, not chaotic.

### 📋 Task Management

Create tasks with a title, description, and priority (Low / Medium / High). Search, filter by status, and stop pretending your mental to-do list is reliable.

### ⏱️ Time Tracking

Every session is logged to Firestore — method, phase, duration, the whole thing. No more "I think I worked like… 2 hours?" guessing games.

### 🗂️ Task Detail View

Dig into any task to see total time invested, pomodoros completed, full session history, and status controls. Evidence that you actually did the work.

### 📊 Dashboard

A quick snapshot of your day: total focus time, pomodoros crushed, tasks done, and what's still haunting you.

---

## 🛠️ Tech Stack

|                 |                               |
| --------------- | ----------------------------- |
| ⚛️ **UI**       | React 19 + TypeScript         |
| 🧭 **Routing**  | React Router v7               |
| 🎨 **Styling**  | Tailwind CSS v4 (Vite plugin) |
| 🔥 **Backend**  | Firebase Firestore            |
| 🖼️ **Icons**    | Lucide React                  |
| ⚡ **Bundler**  | Vite 8 + Rolldown             |
| 🧪 **Compiler** | React Compiler                |
| 🔍 **Linter**   | Oxlint                        |

---

## 🚀 Getting Started

### 1 · Install dependencies

```bash
pnpm install
```

### 2 · Connect Firebase

Grab your credentials from the [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps, then:

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

> 💡 The `tasks` and `sessions` Firestore collections are created automatically on first write — nothing to set up manually.

### 3 · Run it

```bash
pnpm dev
```

### 4 · Ship it

```bash
pnpm build
```

---

## 📁 Project Structure

```
src/
  types/index.ts          → shared TypeScript interfaces
  lib/firebase.ts         → Firebase init + Firestore helpers
  hooks/
    useTasks.ts           → task CRUD + loading state
    useTimer.ts           → Pomodoro & Flowtime timer engine
  components/
    Layout.tsx            → app shell
    Navbar.tsx            → top nav
    MethodSelector.tsx    → 🍅 / 🌊 toggle
    PomodoroTimer.tsx     → countdown ring
    FlowtimeTimer.tsx     → stopwatch + break recommendation
    TaskCard.tsx          → task list item
    TaskForm.tsx          → create / edit task modal
  pages/
    DashboardPage.tsx     → stats overview
    TimerPage.tsx         → timer + task selector
    TasksPage.tsx         → full task list with filters
    TaskDetailPage.tsx    → task detail + session history
```

---

See [CHANGELOG.md](CHANGELOG.md) for release history.

<!--  -->
