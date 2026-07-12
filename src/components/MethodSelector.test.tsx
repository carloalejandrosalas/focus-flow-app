import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MethodSelector from "./MethodSelector";

describe("MethodSelector", () => {
  it("renders both method buttons", () => {
    render(<MethodSelector method="pomodoro" onChange={vi.fn()} />);
    expect(screen.getByText(/Pomodoro/i)).toBeInTheDocument();
    expect(screen.getByText(/Flowtime/i)).toBeInTheDocument();
  });

  it("highlights the active method button", () => {
    const { rerender } = render(
      <MethodSelector method="pomodoro" onChange={vi.fn()} />,
    );
    const pomodoroBtn = screen.getByText(/Pomodoro/i).closest("button")!;
    expect(pomodoroBtn.className).toContain("bg-indigo-600");

    rerender(<MethodSelector method="flowtime" onChange={vi.fn()} />);
    const flowtimeBtn = screen.getByText(/Flowtime/i).closest("button")!;
    expect(flowtimeBtn.className).toContain("bg-violet-600");
  });

  it("calls onChange with 'flowtime' when Flowtime button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MethodSelector method="pomodoro" onChange={onChange} />);
    await user.click(screen.getByText(/Flowtime/i));
    expect(onChange).toHaveBeenCalledWith("flowtime");
  });

  it("calls onChange with 'pomodoro' when Pomodoro button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MethodSelector method="flowtime" onChange={onChange} />);
    await user.click(screen.getByText(/Pomodoro/i));
    expect(onChange).toHaveBeenCalledWith("pomodoro");
  });

  it("disables both buttons when disabled prop is true", () => {
    render(
      <MethodSelector method="pomodoro" onChange={vi.fn()} disabled={true} />,
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <MethodSelector method="pomodoro" onChange={onChange} disabled={true} />,
    );
    await user.click(screen.getByText(/Flowtime/i));
    expect(onChange).not.toHaveBeenCalled();
  });
});
