import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TaskCard from "./TaskCard";
import type { Task } from "../types";

const baseTask: Task = {
  id: "task-1",
  title: "Write unit tests",
  description: "Cover all hooks and components",
  priority: "high",
  status: "todo",
  totalTimeSpent: 3661, // 61 min 1 sec
  pomodorosCompleted: 3,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

function renderCard(overrides: Partial<Task> = {}, props = {}) {
  return render(
    <MemoryRouter>
      <TaskCard
        task={{ ...baseTask, ...overrides }}
        onDelete={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  );
}

describe("TaskCard", () => {
  it("renders the task title", () => {
    renderCard();
    expect(screen.getByText("Write unit tests")).toBeInTheDocument();
  });

  it("renders the task description", () => {
    renderCard();
    expect(
      screen.getByText("Cover all hooks and components"),
    ).toBeInTheDocument();
  });

  it("does not render description when empty", () => {
    renderCard({ description: "" });
    expect(
      screen.queryByText("Cover all hooks and components"),
    ).not.toBeInTheDocument();
  });

  it("renders the priority badge", () => {
    renderCard();
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("applies correct style for high priority", () => {
    renderCard({ priority: "high" });
    const badge = screen.getByText("high");
    expect(badge.className).toContain("text-rose-400");
  });

  it("applies correct style for medium priority", () => {
    renderCard({ priority: "medium" });
    const badge = screen.getByText("medium");
    expect(badge.className).toContain("text-amber-400");
  });

  it("applies correct style for low priority", () => {
    renderCard({ priority: "low" });
    const badge = screen.getByText("low");
    expect(badge.className).toContain("text-emerald-400");
  });

  it("renders formatted total time spent", () => {
    renderCard({ totalTimeSpent: 3661 });
    // 3661 seconds = 61 min 01 sec
    expect(screen.getByText("61:01")).toBeInTheDocument();
  });

  it("renders pomodoros completed count", () => {
    // pomodorosCompleted is rendered as text alongside a FlameIcon SVG inside a span
    renderCard({ pomodorosCompleted: 3 });
    expect(document.body.textContent).toContain("3");
    // The flame span should be present
    const flameSpan = document.querySelector(".flex.items-center.gap-4");
    expect(flameSpan?.textContent).toContain("3");
  });

  it("does not render pomodoro count when zero", () => {
    renderCard({ pomodorosCompleted: 0 });
    // When pomodorosCompleted is 0 the FlameIcon + count span is not rendered
    // Check absence of a flame icon in the footer
    const footer = document.querySelector(".flex.items-center.gap-4");
    const flameIcons = footer?.querySelectorAll(".lucide-flame");
    expect(flameIcons?.length ?? 0).toBe(0);
  });

  it("shows Active badge when isSelected is true", () => {
    renderCard({}, { isSelected: true });
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("does not show Active badge when isSelected is false", () => {
    renderCard({}, { isSelected: false });
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("calls onDelete with task id when delete button is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TaskCard task={baseTask} onDelete={onDelete} />
      </MemoryRouter>,
    );
    // The delete button (trash icon) is present; click it
    const deleteBtn = screen.getByRole("button");
    await user.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith("task-1");
  });

  it("calls onSelect when selectable and card is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TaskCard
          task={baseTask}
          onDelete={vi.fn()}
          selectable
          onSelect={onSelect}
        />
      </MemoryRouter>,
    );
    const card = screen.getByText("Write unit tests").closest(".group")!;
    await user.click(card);
    expect(onSelect).toHaveBeenCalledWith(baseTask);
  });
});
