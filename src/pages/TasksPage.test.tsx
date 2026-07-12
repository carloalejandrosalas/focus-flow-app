import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TasksPage from "./TasksPage";
import type { Task } from "../types";

// ── Mock useTasks hook ────────────────────────────────────────────────────────
vi.mock("../hooks/useTasks", () => ({
  useTasks: vi.fn(),
}));

// Mock firebase to prevent TaskForm from failing during integration
vi.mock("../lib/firebase", () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  fetchTasks: vi.fn(),
  fetchTask: vi.fn(),
  fetchSessionsForTask: vi.fn(),
}));

import { useTasks } from "../hooks/useTasks";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const tasks: Task[] = [
  {
    id: "t1",
    title: "Build the API",
    description: "REST endpoints",
    priority: "high",
    status: "in-progress",
    totalTimeSpent: 600,
    pomodorosCompleted: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "t2",
    title: "Write docs",
    description: "",
    priority: "low",
    status: "todo",
    totalTimeSpent: 0,
    pomodorosCompleted: 0,
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "t3",
    title: "Deploy to prod",
    description: "",
    priority: "medium",
    status: "completed",
    totalTimeSpent: 300,
    pomodorosCompleted: 0,
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
  },
];

const mockHook = {
  tasks,
  loading: false,
  error: null,
  addTask: vi.fn().mockResolvedValue(undefined),
  editTask: vi.fn(),
  removeTask: vi.fn(),
  reload: vi.fn(),
};

function renderPage() {
  return render(
    <MemoryRouter>
      <TasksPage />
    </MemoryRouter>,
  );
}

describe("TasksPage", () => {
  beforeEach(() => {
    vi.mocked(useTasks).mockReturnValue({ ...mockHook });
  });

  it("renders page title", () => {
    renderPage();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });

  it("shows total task count", () => {
    renderPage();
    expect(screen.getByText("3 tasks total")).toBeInTheDocument();
  });

  it("renders all tasks by default", () => {
    renderPage();
    expect(screen.getByText("Build the API")).toBeInTheDocument();
    expect(screen.getByText("Write docs")).toBeInTheDocument();
    expect(screen.getByText("Deploy to prod")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    vi.mocked(useTasks).mockReturnValue({
      ...mockHook,
      tasks: [],
      loading: true,
    });
    renderPage();
    expect(screen.getByText("Loading tasks…")).toBeInTheDocument();
  });

  it("shows empty state when no tasks exist", () => {
    vi.mocked(useTasks).mockReturnValue({
      ...mockHook,
      tasks: [],
      loading: false,
    });
    renderPage();
    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
  });

  it("filters tasks by search input", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByPlaceholderText("Search tasks…"), "api");
    expect(screen.getByText("Build the API")).toBeInTheDocument();
    expect(screen.queryByText("Write docs")).not.toBeInTheDocument();
    expect(screen.queryByText("Deploy to prod")).not.toBeInTheDocument();
  });

  it("search is case-insensitive", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByPlaceholderText("Search tasks…"), "BUILD");
    expect(screen.getByText("Build the API")).toBeInTheDocument();
  });

  it("shows 'No tasks match your filters.' when search has no results", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(
      screen.getByPlaceholderText("Search tasks…"),
      "xyz-no-match",
    );
    expect(
      screen.getByText("No tasks match your filters."),
    ).toBeInTheDocument();
  });

  it("filters by status tab: To Do", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "To Do" }));
    expect(screen.getByText("Write docs")).toBeInTheDocument();
    expect(screen.queryByText("Build the API")).not.toBeInTheDocument();
    expect(screen.queryByText("Deploy to prod")).not.toBeInTheDocument();
  });

  it("filters by status tab: In Progress", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "In Progress" }));
    expect(screen.getByText("Build the API")).toBeInTheDocument();
    expect(screen.queryByText("Write docs")).not.toBeInTheDocument();
  });

  it("filters by status tab: Completed", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Completed" }));
    expect(screen.getByText("Deploy to prod")).toBeInTheDocument();
    expect(screen.queryByText("Build the API")).not.toBeInTheDocument();
  });

  it("shows all tasks again when All tab is selected", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "To Do" }));
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("Build the API")).toBeInTheDocument();
    expect(screen.getByText("Write docs")).toBeInTheDocument();
    expect(screen.getByText("Deploy to prod")).toBeInTheDocument();
  });

  it("opens TaskForm when New Task button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /new task/i }));
    // The form dialog renders an h2 with "New Task"
    expect(
      screen.getByRole("heading", { name: "New Task" }),
    ).toBeInTheDocument();
  });

  it("closes TaskForm when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /new task/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    // The form heading h2 should no longer be present
    expect(
      screen.queryByRole("heading", { name: "New Task" }),
    ).not.toBeInTheDocument();
  });

  it("calls addTask when TaskForm is submitted", async () => {
    const addTask = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useTasks).mockReturnValue({ ...mockHook, addTask });
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /new task/i }));
    await user.type(
      screen.getByPlaceholderText(/accomplish/i),
      "New important task",
    );
    await user.click(screen.getByRole("button", { name: /create task/i }));
    expect(addTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New important task" }),
    );
  });
});
