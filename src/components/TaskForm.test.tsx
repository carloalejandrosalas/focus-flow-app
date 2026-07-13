import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "./TaskForm";

describe("TaskForm", () => {
  it("renders 'New Task' title when no initial data", () => {
    render(<TaskForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("New Task")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create task/i }),
    ).toBeInTheDocument();
  });

  it("renders 'Edit Task' title when initial data is provided", () => {
    render(
      <TaskForm
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        initial={{ title: "Existing", priority: "high" }}
      />,
    );
    expect(screen.getByText("Edit Task")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
  });

  it("populates fields with initial data", () => {
    render(
      <TaskForm
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        initial={{ title: "My Task", description: "My desc", priority: "low" }}
      />,
    );
    expect(screen.getByDisplayValue("My Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("My desc")).toBeInTheDocument();
  });

  it("disables submit button when title is empty", () => {
    render(<TaskForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: /create task/i })).toBeDisabled();
  });

  it("enables submit button when title is entered", async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/accomplish/i), "My new task");
    expect(
      screen.getByRole("button", { name: /create task/i }),
    ).not.toBeDisabled();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits the form with trimmed title and selected priority", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onSubmit={onSubmit} onClose={onClose} />);

    await user.type(
      screen.getByPlaceholderText(/accomplish/i),
      "  Build feature  ",
    );
    await user.type(
      screen.getByPlaceholderText(/details/i),
      "Some description",
    );
    // Select high priority
    await user.click(screen.getByRole("button", { name: /high/i }));
    await user.click(screen.getByRole("button", { name: /create task/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Build feature",
      description: "Some description",
      priority: "high",
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("defaults to 'medium' priority", () => {
    render(<TaskForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    const mediumBtn = screen.getByRole("button", { name: /medium/i });
    // Active medium button uses the active class
    expect(mediumBtn.className).toContain("border-indigo-500");
  });

  it("allows switching priority selection", async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} onClose={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /low/i }));
    const lowBtn = screen.getByRole("button", { name: /low/i });
    expect(lowBtn.className).toContain("border-indigo-500");
  });

  it("does not submit when title is only whitespace", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onSubmit={onSubmit} onClose={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/accomplish/i), "   ");
    // button should still be disabled (title.trim() is empty)
    expect(screen.getByRole("button", { name: /create task/i })).toBeDisabled();
  });
});
