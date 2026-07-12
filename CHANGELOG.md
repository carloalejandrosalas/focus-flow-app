# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.1] — 2026-07-12

### Added

- Initial release of FocusFlow.
- Pomodoro timer with 25/5/15-minute phases, circular SVG progress ring, phase-dot counter, skip, pause, and end controls.
- Flowtime timer with freeform stopwatch, proportional break recommendation, and break mode.
- Method selector to toggle between Pomodoro and Flowtime (locked during active session).
- Task management: create, edit, delete tasks with title, description, and priority.
- Task status control: To Do → In Progress → Completed.
- Time tracking: sessions persisted to Firestore with method, phase, duration, and completion flag.
- Task detail page showing cumulative time, pomodoro count, status picker, and full session history.
- Dashboard with focus time, pomodoro count, and task completion stats.
- Firestore integration via environment-variable-based Firebase config.
- Tailwind CSS v4 with dark slate theme.
- React Router v7 with nested layout routing.
