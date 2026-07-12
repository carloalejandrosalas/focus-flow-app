import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "./DashboardPage";
import type { Task } from "../types";

// ── Mock useTasks hook ────────────────────────────────────────────────────────
vi.mock("../hooks/useTasks", () => ({
  useTasks: vi.fn(),
}));

import { useTasks } from "../hooks/useTasks";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const tasks: Task[] = [
  {
    id: "t1",
    title: "Task Alpha",
    description: "",
    priority: "high",
    status: "completed",
    totalTimeSpent: 1500,
    pomodorosCompleted: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "t2",
    title: "Task Beta",
    description: "",
    priority: "medium",
    status: "in-progress",
    totalTimeSpent: 900,
    pomodorosCompleted: 0,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "t3",
    title: "Task Gamma",
    description: "",
    priority: "low",
    status: "todo",
    totalTimeSpent: 0,
    pomodorosCompleted: 0,
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
  },
];

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.mocked(useTasks).mockReturnValue({
      tasks: [],
      loading: false,
      error: null,
      addTask: vi.fn(),
      editTask: vi.fn(),
      removeTask: vi.fn(),
      reload: vi.fn(),
    });
  });

  it("renders heading and subtitle", () => {
    renderDashboard();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Your focus overview")).toBeInTheDocument();
  });

  it("shows loading placeholder '—' while loading", () => {
    vi.mocked(useTasks).mockReturnValue({
      tasks: [],
      loading: true,
      error: null,
      addTask: vi.fn(),
      editTask: vi.fn(),
      removeTask: vi.fn(),
      reload: vi.fn(),
    });
    renderDashboard();
    // All 4 stat cards should show '—'
    expect(screen.getAllByText("—")).toHaveLength(4);
  });

  it("shows total focus time as formatted string", () => {
    vi.mocked(useTasks).mockReturnValue({
      tasks,
      loading: false,
      error: null,
      addTask: vi.fn(),
      editTask: vi.fn(),
      removeTask: vi.fn(),
      reload: vi.fn(),
    });
    renderDashboard();
    // Total time: 1500 + 900 + 0 = 2400s = 40:00
    expect(screen.getByText("40:00")).toBeInTheDocument();
  });

  it("shows correct stat card values after loading", () => {
    vi.mocked(useTasks).mockReturnValue({
      tasks,
      loading: false,
      error: null,
      addTask: vi.fn(),
      editTask: vi.fn(),
      removeTask: vi.fn(),
      reload: vi.fn(),
    });
    renderDashboard();
    // Pomodoros Done stat label is always present
    expect(screen.getByText("Pomodoros Done")).toBeInTheDocument();
    // Tasks Completed label
    expect(screen.getByText("Tasks Completed")).toBeInTheDocument();
    // In Progress label
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    // Total focus time: 1500 + 900 + 0 = 2400s = 40:00
    expect(screen.getByText("40:00")).toBeInTheDocument();
    // There should be three stat cards each showing "1" (pomodoros, completed, in-progress)
    const ones = screen.getAllByText("1");
    expect(ones.length).toBe(3);
  });

  it("renders quick action links to timer and tasks", () => {
    renderDashboard();
    expect(screen.getByText("Start a Session")).toBeInTheDocument();
    expect(screen.getByText("Manage Tasks")).toBeInTheDocument();
  });

  it("shows recent tasks section when tasks exist", () => {
    vi.mocked(useTasks).mockReturnValue({
      tasks,
      loading: false,
      error: null,
      addTask: vi.fn(),
      editTask: vi.fn(),
      removeTask: vi.fn(),
      reload: vi.fn(),
    });
    renderDashboard();
    expect(screen.getByText("Recent Tasks")).toBeInTheDocument();
    expect(screen.getByText("Task Alpha")).toBeInTheDocument();
    expect(screen.getByText("Task Beta")).toBeInTheDocument();
    expect(screen.getByText("Task Gamma")).toBeInTheDocument();
  });

  it("does not show recent tasks when task list is empty", () => {
    renderDashboard();
    expect(screen.queryByText("Recent Tasks")).not.toBeInTheDocument();
  });

  it("shows at most 5 recent tasks", () => {
    const manyTasks = Array.from({ length: 8 }, (_, i) => ({
      ...tasks[0],
      id: `t${i}`,
      title: `Task ${i}`,
    }));
    vi.mocked(useTasks).mockReturnValue({
      tasks: manyTasks,
      loading: false,
      error: null,
      addTask: vi.fn(),
      editTask: vi.fn(),
      removeTask: vi.fn(),
      reload: vi.fn(),
    });
    renderDashboard();
    // Tasks 0–4 visible (max 5)
    expect(screen.getByText("Task 0")).toBeInTheDocument();
    expect(screen.getByText("Task 4")).toBeInTheDocument();
    expect(screen.queryByText("Task 5")).not.toBeInTheDocument();
  });
});
