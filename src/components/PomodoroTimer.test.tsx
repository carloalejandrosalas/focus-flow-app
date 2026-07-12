import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PomodoroTimer from "./PomodoroTimer";
import type { Task } from "../types";

const mockTask: Task = {
  id: "task-1",
  title: "My Task",
  description: "",
  priority: "medium",
  status: "in-progress",
  totalTimeSpent: 0,
  pomodorosCompleted: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const defaultProps = {
  remaining: 25 * 60,
  phase: "work" as const,
  pomodoroCount: 0,
  isRunning: false,
  selectedTask: null,
  onStart: vi.fn(),
  onPause: vi.fn(),
  onResume: vi.fn(),
  onStop: vi.fn(),
  onSkip: vi.fn(),
};

describe("PomodoroTimer", () => {
  it("renders the remaining time in MM:SS format", () => {
    render(<PomodoroTimer {...defaultProps} remaining={25 * 60} />);
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("renders all three phase labels", () => {
    render(<PomodoroTimer {...defaultProps} />);
    // "Focus Time" appears twice: in the phase tab strip and below the SVG display
    expect(screen.getAllByText("Focus Time").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Short Break")).toBeInTheDocument();
    expect(screen.getByText("Long Break")).toBeInTheDocument();
  });

  it("highlights the active phase", () => {
    render(<PomodoroTimer {...defaultProps} phase="short-break" />);
    // "Short Break" appears in both the tab pill and the timer label — check the tab pill
    const allShortBreak = screen.getAllByText("Short Break");
    expect(allShortBreak.length).toBeGreaterThanOrEqual(1);
    // The active pill has the emerald colour class
    const activePill = allShortBreak.find((el) =>
      el.className.includes("text-emerald-400"),
    );
    expect(activePill).toBeDefined();
  });

  it("shows Start Focus button when no session is active", () => {
    render(
      <PomodoroTimer {...defaultProps} pomodoroCount={0} isRunning={false} />,
    );
    expect(
      screen.getByRole("button", { name: /start focus/i }),
    ).toBeInTheDocument();
  });

  it("disables Start Focus when no task is selected", () => {
    render(
      <PomodoroTimer {...defaultProps} selectedTask={null} isRunning={false} />,
    );
    expect(screen.getByRole("button", { name: /start focus/i })).toBeDisabled();
  });

  it("enables Start Focus when task is selected", () => {
    render(
      <PomodoroTimer
        {...defaultProps}
        selectedTask={mockTask}
        isRunning={false}
      />,
    );
    expect(
      screen.getByRole("button", { name: /start focus/i }),
    ).not.toBeDisabled();
  });

  it("calls onStart when Start Focus is clicked", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(
      <PomodoroTimer
        {...defaultProps}
        selectedTask={mockTask}
        onStart={onStart}
      />,
    );
    await user.click(screen.getByRole("button", { name: /start focus/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("shows Pause button when running", () => {
    render(
      <PomodoroTimer
        {...defaultProps}
        isRunning={true}
        pomodoroCount={1}
        selectedTask={mockTask}
      />,
    );
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("calls onPause when Pause is clicked", async () => {
    const onPause = vi.fn();
    const user = userEvent.setup();
    render(
      <PomodoroTimer
        {...defaultProps}
        isRunning={true}
        pomodoroCount={1}
        selectedTask={mockTask}
        onPause={onPause}
      />,
    );
    await user.click(screen.getByRole("button", { name: /pause/i }));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("shows Resume button when paused mid-session", () => {
    render(
      <PomodoroTimer
        {...defaultProps}
        isRunning={false}
        pomodoroCount={1}
        selectedTask={mockTask}
      />,
    );
    expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
  });

  it("calls onResume when Resume is clicked", async () => {
    const onResume = vi.fn();
    const user = userEvent.setup();
    render(
      <PomodoroTimer
        {...defaultProps}
        isRunning={false}
        pomodoroCount={1}
        selectedTask={mockTask}
        onResume={onResume}
      />,
    );
    await user.click(screen.getByRole("button", { name: /resume/i }));
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("renders 4 pomodoro dots", () => {
    render(<PomodoroTimer {...defaultProps} />);
    // 4 dot divs are rendered
    const dots = document.querySelectorAll(".w-3.h-3.rounded-full");
    expect(dots.length).toBe(4);
  });

  it("fills correct number of dots based on pomodoroCount", () => {
    render(<PomodoroTimer {...defaultProps} pomodoroCount={2} />);
    const dots = Array.from(document.querySelectorAll(".w-3.h-3.rounded-full"));
    const filled = dots.filter((d) => d.className.includes("bg-indigo-500"));
    expect(filled.length).toBe(2);
  });

  it("wraps dot count modulo 4 (after long break)", () => {
    render(<PomodoroTimer {...defaultProps} pomodoroCount={5} />);
    const dots = Array.from(document.querySelectorAll(".w-3.h-3.rounded-full"));
    // 5 % 4 = 1 filled dot
    const filled = dots.filter((d) => d.className.includes("bg-indigo-500"));
    expect(filled.length).toBe(1);
  });

  it("calls onSkip when Skip is clicked during a session", async () => {
    const onSkip = vi.fn();
    const user = userEvent.setup();
    render(
      <PomodoroTimer
        {...defaultProps}
        isRunning={true}
        pomodoroCount={1}
        onSkip={onSkip}
      />,
    );
    await user.click(screen.getByRole("button", { name: /skip/i }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it("calls onStop when End button is clicked during a session", async () => {
    const onStop = vi.fn();
    const user = userEvent.setup();
    render(
      <PomodoroTimer
        {...defaultProps}
        isRunning={true}
        pomodoroCount={1}
        onStop={onStop}
      />,
    );
    await user.click(screen.getByRole("button", { name: /end/i }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
