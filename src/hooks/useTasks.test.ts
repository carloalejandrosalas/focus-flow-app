import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTasks, useTaskDetail } from "./useTasks";
import type { Task, Session } from "../types";

// ── Mock firebase ─────────────────────────────────────────────────────────────
vi.mock("../lib/firebase", () => ({
  fetchTasks: vi.fn(),
  fetchTask: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  fetchSessionsForTask: vi.fn(),
}));

import {
  fetchTasks,
  fetchTask,
  createTask,
  updateTask,
  deleteTask,
  fetchSessionsForTask,
} from "../lib/firebase";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const task1: Task = {
  id: "t1",
  title: "Task One",
  description: "First task",
  priority: "high",
  status: "todo",
  totalTimeSpent: 0,
  pomodorosCompleted: 0,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const task2: Task = {
  id: "t2",
  title: "Task Two",
  description: "",
  priority: "low",
  status: "completed",
  totalTimeSpent: 600,
  pomodorosCompleted: 1,
  createdAt: new Date("2024-01-02"),
  updatedAt: new Date("2024-01-02"),
};

const session1: Session = {
  id: "s1",
  taskId: "t1",
  taskTitle: "Task One",
  method: "pomodoro",
  startTime: new Date("2024-01-01T10:00:00"),
  endTime: new Date("2024-01-01T10:25:00"),
  duration: 1500,
  phase: "work",
  completed: true,
};

// ── useTasks ──────────────────────────────────────────────────────────────────

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchTasks).mockResolvedValue([task1, task2]);
    vi.mocked(createTask).mockResolvedValue("t3");
    vi.mocked(updateTask).mockResolvedValue(undefined);
    vi.mocked(deleteTask).mockResolvedValue(undefined);
  });

  it("loads tasks on mount", async () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toEqual([task1, task2]);
    expect(result.current.error).toBeNull();
  });

  it("sets error state when fetchTasks rejects", async () => {
    vi.mocked(fetchTasks).mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Network error");
    expect(result.current.tasks).toEqual([]);
  });

  it("addTask calls createTask and reloads the list", async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(fetchTasks).mockResolvedValue([task1, task2]);
    await act(async () => {
      await result.current.addTask({
        title: "New Task",
        description: "",
        priority: "medium",
      });
    });
    expect(createTask).toHaveBeenCalledWith({
      title: "New Task",
      description: "",
      priority: "medium",
    });
    expect(fetchTasks).toHaveBeenCalledTimes(2);
  });

  it("editTask calls updateTask and reloads the list", async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editTask("t1", { status: "in-progress" });
    });
    expect(updateTask).toHaveBeenCalledWith("t1", { status: "in-progress" });
    expect(fetchTasks).toHaveBeenCalledTimes(2);
  });

  it("removeTask calls deleteTask and reloads the list", async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeTask("t1");
    });
    expect(deleteTask).toHaveBeenCalledWith("t1");
    expect(fetchTasks).toHaveBeenCalledTimes(2);
  });

  it("reload re-fetches tasks", async () => {
    const { result } = renderHook(() => useTasks());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.reload();
    });
    expect(fetchTasks).toHaveBeenCalledTimes(2);
  });
});

// ── useTaskDetail ─────────────────────────────────────────────────────────────

describe("useTaskDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchTask).mockResolvedValue(task1);
    vi.mocked(fetchSessionsForTask).mockResolvedValue([session1]);
  });

  it("fetches task and sessions by id", async () => {
    const { result } = renderHook(() => useTaskDetail("t1"));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.task).toEqual(task1);
    expect(result.current.sessions).toEqual([session1]);
  });

  it("returns null task and empty sessions when id is undefined", async () => {
    const { result } = renderHook(() => useTaskDetail(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.task).toBeNull();
    expect(result.current.sessions).toEqual([]);
    expect(fetchTask).not.toHaveBeenCalled();
  });

  it("sets task to null when fetchTask returns null (not found)", async () => {
    vi.mocked(fetchTask).mockResolvedValueOnce(null);
    const { result } = renderHook(() => useTaskDetail("missing-id"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.task).toBeNull();
  });

  it("handles fetchTask failure gracefully", async () => {
    vi.mocked(fetchTask).mockRejectedValueOnce(new Error("Firestore error"));
    const { result } = renderHook(() => useTaskDetail("t1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Promise.allSettled used – task should be null on rejection
    expect(result.current.task).toBeNull();
  });

  it("handles fetchSessionsForTask failure gracefully", async () => {
    vi.mocked(fetchSessionsForTask).mockRejectedValueOnce(
      new Error("Sessions error"),
    );
    const { result } = renderHook(() => useTaskDetail("t1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Promise.allSettled – sessions should be empty on rejection
    expect(result.current.sessions).toEqual([]);
  });

  it("reload re-fetches task and sessions", async () => {
    const { result } = renderHook(() => useTaskDetail("t1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.reload();
    });
    expect(fetchTask).toHaveBeenCalledTimes(2);
    expect(fetchSessionsForTask).toHaveBeenCalledTimes(2);
  });
});
