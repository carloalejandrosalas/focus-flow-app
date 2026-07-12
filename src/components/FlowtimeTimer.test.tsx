import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlowtimeTimer from "./FlowtimeTimer";
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
  elapsed: 0,
  isRunning: false,
  isOnBreak: false,
  recommendedBreak: 5 * 60,
  selectedTask: null,
  sessionStart: null,
  onStart: vi.fn(),
  onPause: vi.fn(),
  onResume: vi.fn(),
  onStop: vi.fn(),
  onStartBreak: vi.fn(),
  onEndBreak: vi.fn(),
};

describe("FlowtimeTimer", () => {
  it("renders the elapsed time in MM:SS format", () => {
    render(<FlowtimeTimer {...defaultProps} elapsed={0} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("renders formatted elapsed time", () => {
    render(<FlowtimeTimer {...defaultProps} elapsed={90} />);
    expect(screen.getByText("01:30")).toBeInTheDocument();
  });

  it("shows 'Ready' status when not running and no session", () => {
    render(<FlowtimeTimer {...defaultProps} />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("shows 'Flowing' status when running", () => {
    render(
      <FlowtimeTimer
        {...defaultProps}
        isRunning={true}
        sessionStart={new Date()}
      />,
    );
    expect(screen.getByText("Flowing")).toBeInTheDocument();
  });

  it("shows 'On Break' status during a break", () => {
    render(
      <FlowtimeTimer
        {...defaultProps}
        isOnBreak={true}
        sessionStart={new Date()}
      />,
    );
    expect(screen.getByText("On Break")).toBeInTheDocument();
  });

  it("shows Start Flow button when no session is active", () => {
    render(<FlowtimeTimer {...defaultProps} sessionStart={null} />);
    expect(
      screen.getByRole("button", { name: /start flow/i }),
    ).toBeInTheDocument();
  });

  it("disables Start Flow when no task is selected", () => {
    render(<FlowtimeTimer {...defaultProps} selectedTask={null} />);
    expect(screen.getByRole("button", { name: /start flow/i })).toBeDisabled();
  });

  it("enables Start Flow when task is selected", () => {
    render(<FlowtimeTimer {...defaultProps} selectedTask={mockTask} />);
    expect(
      screen.getByRole("button", { name: /start flow/i }),
    ).not.toBeDisabled();
  });

  it("calls onStart when Start Flow is clicked", async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();
    render(
      <FlowtimeTimer
        {...defaultProps}
        selectedTask={mockTask}
        onStart={onStart}
      />,
    );
    await user.click(screen.getByRole("button", { name: /start flow/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it("shows Pause and Take Break buttons during an active running session", () => {
    render(
      <FlowtimeTimer
        {...defaultProps}
        isRunning={true}
        sessionStart={new Date()}
      />,
    );
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /take break/i }),
    ).toBeInTheDocument();
  });

  it("calls onPause when Pause is clicked", async () => {
    const onPause = vi.fn();
    const user = userEvent.setup();
    render(
      <FlowtimeTimer
        {...defaultProps}
        isRunning={true}
        sessionStart={new Date()}
        onPause={onPause}
      />,
    );
    await user.click(screen.getByRole("button", { name: /pause/i }));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("calls onStartBreak when Take Break is clicked", async () => {
    const onStartBreak = vi.fn();
    const user = userEvent.setup();
    render(
      <FlowtimeTimer
        {...defaultProps}
        isRunning={true}
        sessionStart={new Date()}
        onStartBreak={onStartBreak}
      />,
    );
    await user.click(screen.getByRole("button", { name: /take break/i }));
    expect(onStartBreak).toHaveBeenCalledTimes(1);
  });

  it("shows Back to Work and End Session buttons during a break", () => {
    render(
      <FlowtimeTimer
        {...defaultProps}
        isOnBreak={true}
        sessionStart={new Date()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /back to work/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /end session/i }),
    ).toBeInTheDocument();
  });

  it("calls onEndBreak when Back to Work is clicked", async () => {
    const onEndBreak = vi.fn();
    const user = userEvent.setup();
    render(
      <FlowtimeTimer
        {...defaultProps}
        isOnBreak={true}
        sessionStart={new Date()}
        onEndBreak={onEndBreak}
      />,
    );
    await user.click(screen.getByRole("button", { name: /back to work/i }));
    expect(onEndBreak).toHaveBeenCalledTimes(1);
  });

  it("calls onStop when End Session is clicked during break", async () => {
    const onStop = vi.fn();
    const user = userEvent.setup();
    render(
      <FlowtimeTimer
        {...defaultProps}
        isOnBreak={true}
        sessionStart={new Date()}
        onStop={onStop}
      />,
    );
    await user.click(screen.getByRole("button", { name: /end session/i }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("does not show break recommendation when elapsed is 0", () => {
    render(<FlowtimeTimer {...defaultProps} elapsed={0} />);
    expect(screen.queryByText("Recommended break:")).not.toBeInTheDocument();
  });

  it("shows break recommendation when elapsed > 0", () => {
    render(
      <FlowtimeTimer
        {...defaultProps}
        elapsed={100}
        recommendedBreak={5 * 60}
      />,
    );
    expect(screen.getByText("Recommended break:")).toBeInTheDocument();
    expect(screen.getByText("05:00")).toBeInTheDocument();
  });

  it("shows Resume button when session is paused (not running, not on break, session active)", () => {
    render(
      <FlowtimeTimer
        {...defaultProps}
        isRunning={false}
        isOnBreak={false}
        sessionStart={new Date()}
      />,
    );
    expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
  });

  it("calls onResume when Resume is clicked", async () => {
    const onResume = vi.fn();
    const user = userEvent.setup();
    render(
      <FlowtimeTimer
        {...defaultProps}
        isRunning={false}
        isOnBreak={false}
        sessionStart={new Date()}
        onResume={onResume}
      />,
    );
    await user.click(screen.getByRole("button", { name: /resume/i }));
    expect(onResume).toHaveBeenCalledTimes(1);
  });
});
