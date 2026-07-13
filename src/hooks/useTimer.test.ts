import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { formatTime, recommendedBreak, useTimer } from "./useTimer";
import type { Task } from "../types";

// ── Mock firebase ─────────────────────────────────────────────────────────────
vi.mock("../lib/firebase", () => ({
  createSession: vi.fn(),
  closeSession: vi.fn(),
  updateTask: vi.fn(),
}));

import { createSession, closeSession, updateTask } from "../lib/firebase";

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockTask: Task = {
  id: "task-1",
  title: "Test Task",
  description: "desc",
  priority: "medium",
  status: "todo",
  totalTimeSpent: 120,
  pomodorosCompleted: 2,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// ── formatTime ────────────────────────────────────────────────────────────────

describe("formatTime", () => {
  it("formats zero correctly", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats seconds under one minute", () => {
    expect(formatTime(30)).toBe("00:30");
  });

  it("formats exactly one minute", () => {
    expect(formatTime(60)).toBe("01:00");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(90)).toBe("01:30");
  });

  it("formats large values", () => {
    expect(formatTime(25 * 60)).toBe("25:00");
  });

  it("pads single-digit minutes and seconds", () => {
    expect(formatTime(9 * 60 + 5)).toBe("09:05");
  });
});

// ── recommendedBreak ──────────────────────────────────────────────────────────

describe("recommendedBreak", () => {
  it("returns 5 min for less than 25 min of work", () => {
    expect(recommendedBreak(0)).toBe(5 * 60);
    expect(recommendedBreak(24 * 60)).toBe(5 * 60);
    expect(recommendedBreak(1)).toBe(5 * 60);
  });

  it("returns 8 min for 25–49 min of work", () => {
    expect(recommendedBreak(25 * 60)).toBe(8 * 60);
    expect(recommendedBreak(49 * 60)).toBe(8 * 60);
  });

  it("returns 10 min for 50–89 min of work", () => {
    expect(recommendedBreak(50 * 60)).toBe(10 * 60);
    expect(recommendedBreak(89 * 60)).toBe(10 * 60);
  });

  it("returns 15 min for 90+ min of work", () => {
    expect(recommendedBreak(90 * 60)).toBe(15 * 60);
    expect(recommendedBreak(120 * 60)).toBe(15 * 60);
  });
});

// ── useTimer hook ─────────────────────────────────────────────────────────────

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(createSession).mockResolvedValue("session-abc");
    vi.mocked(closeSession).mockResolvedValue(undefined);
    vi.mocked(updateTask).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("initialises with default pomodoro state", () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: null }),
    );
    expect(result.current.isRunning).toBe(false);
    expect(result.current.remaining).toBe(25 * 60);
    expect(result.current.phase).toBe("work");
    expect(result.current.elapsed).toBe(0);
    expect(result.current.pomodoroCount).toBe(0);
    expect(result.current.isOnBreak).toBe(false);
  });

  it("does not start when no task is selected", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: null }),
    );
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.isRunning).toBe(false);
    expect(createSession).not.toHaveBeenCalled();
  });

  it("starts timer and creates session for pomodoro", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.isRunning).toBe(true);
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: "task-1",
        taskTitle: "Test Task",
        method: "pomodoro",
        phase: "work",
        completed: false,
      }),
    );
  });

  it("starts timer and creates session for flowtime", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "flowtime", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.isRunning).toBe(true);
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: "task-1",
        method: "flowtime",
        phase: undefined,
      }),
    );
  });

  it("decrements remaining each second for pomodoro", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remaining).toBe(25 * 60 - 3);
  });

  it("increments elapsed each second for flowtime", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "flowtime", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.elapsed).toBe(5);
  });

  it("pauses and resumes timer", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      result.current.pause();
    });
    expect(result.current.isRunning).toBe(false);
    const remaining = result.current.remaining;

    // No further countdown while paused
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remaining).toBe(remaining);

    act(() => {
      result.current.resume();
    });
    expect(result.current.isRunning).toBe(true);
  });

  it("stops timer, closes session, and resets state", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    await act(async () => {
      await result.current.stop(false);
    });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.remaining).toBe(25 * 60);
    expect(result.current.elapsed).toBe(0);
    expect(result.current.phase).toBe("work");
    expect(closeSession).toHaveBeenCalledWith("session-abc", 5, false);
  });

  it("updates task totalTimeSpent when stopping flowtime", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "flowtime", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    await act(async () => {
      await result.current.stop(false);
    });
    expect(updateTask).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ totalTimeSpent: 130 }),
    );
  });

  it("resets state when method changes", async () => {
    let method = "pomodoro" as "pomodoro" | "flowtime";
    const { result, rerender } = renderHook(() =>
      useTimer({ method, selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    method = "flowtime";
    act(() => {
      rerender();
    });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsed).toBe(0);
    expect(result.current.remaining).toBe(25 * 60);
  });

  it("skipPhase does nothing for flowtime method", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "flowtime", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    const beforePhase = result.current.phase;
    act(() => {
      result.current.skipPhase();
    });
    expect(result.current.phase).toBe(beforePhase);
  });

  it("startFlowtimeBreak sets isOnBreak and pauses timer", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "flowtime", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      result.current.startFlowtimeBreak();
    });
    expect(result.current.isOnBreak).toBe(true);
    expect(result.current.isRunning).toBe(false);
  });

  it("endFlowtimeBreak clears isOnBreak", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "flowtime", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      result.current.startFlowtimeBreak();
      result.current.endFlowtimeBreak();
    });
    expect(result.current.isOnBreak).toBe(false);
  });

  it("calls onSessionEnd callback when stop() completes", async () => {
    const onSessionEnd = vi.fn();
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: mockTask, onSessionEnd }),
    );
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await result.current.stop(false);
    });
    expect(onSessionEnd).toHaveBeenCalledTimes(1);
  });

  it("returns recommendedBreak based on elapsed time", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "flowtime", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });
    // 25 min elapsed => recommendedBreak = 8 min
    expect(result.current.recommendedBreak).toBe(8 * 60);
  });

  it("marks session as completed when stop(true) is called", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await result.current.stop(true);
    });
    expect(closeSession).toHaveBeenCalledWith(
      "session-abc",
      expect.any(Number),
      true,
    );
  });

  it("increments pomodorosCompleted when completing a pomodoro work session", async () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: mockTask }),
    );
    await act(async () => {
      await result.current.start();
    });
    await act(async () => {
      await result.current.stop(true);
    });
    expect(updateTask).toHaveBeenCalledWith(
      "task-1",
      expect.objectContaining({ pomodorosCompleted: 3 }),
    );
  });
});

// ── Pomodoro phase transition ─────────────────────────────────────────────────

describe("useTimer – pomodoro phase progression", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("skipPhase transitions work → short-break on first call", () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: mockTask }),
    );

    act(() => {
      result.current.skipPhase();
    });

    expect(result.current.phase).toBe("short-break");
    expect(result.current.remaining).toBe(5 * 60);
    expect(result.current.pomodoroCount).toBe(1);
  });

  it("skipPhase transitions short-break → work", () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: mockTask }),
    );

    // work → short-break
    act(() => {
      result.current.skipPhase();
    });
    // short-break → work
    act(() => {
      result.current.skipPhase();
    });

    expect(result.current.phase).toBe("work");
    expect(result.current.remaining).toBe(25 * 60);
  });

  it("transitions to long-break after 4 work phases via skipPhase", () => {
    const { result } = renderHook(() =>
      useTimer({ method: "pomodoro", selectedTask: mockTask }),
    );

    // Cycle through 4 work phases:
    // work→break→work→break→work→break→work→long-break = 7 skips
    for (let i = 0; i < 7; i++) {
      act(() => {
        result.current.skipPhase();
      });
    }

    expect(result.current.phase).toBe("long-break");
    expect(result.current.pomodoroCount).toBe(4);
    expect(result.current.remaining).toBe(15 * 60);
  });

  it("skipPhase does nothing for flowtime", () => {
    const { result } = renderHook(() =>
      useTimer({ method: "flowtime", selectedTask: mockTask }),
    );

    act(() => {
      result.current.skipPhase();
    });

    // Phase is not a relevant concept in flowtime; state unchanged
    expect(result.current.phase).toBe("work");
    expect(result.current.pomodoroCount).toBe(0);
  });
});
