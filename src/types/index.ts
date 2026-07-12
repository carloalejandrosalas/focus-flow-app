export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "completed";
export type TimerMethod = "pomodoro" | "flowtime";
export type PomodoroPhase = "work" | "short-break" | "long-break";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  totalTimeSpent: number; // seconds
  pomodorosCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  taskId: string;
  taskTitle: string;
  method: TimerMethod;
  startTime: Date;
  endTime: Date | null;
  duration: number; // seconds
  phase?: PomodoroPhase; // for pomodoro sessions
  completed: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
}
