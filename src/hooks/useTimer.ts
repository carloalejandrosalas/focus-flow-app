import { useState, useEffect, useRef, useCallback } from "react";
import type { TimerMethod, PomodoroPhase, Task } from "../types";
import { createSession, closeSession, updateTask } from "../lib/firebase";

// ── Pomodoro config ───────────────────────────────────────────────────────────
const POMODORO_DURATIONS: Record<PomodoroPhase, number> = {
  work: 25 * 60,
  "short-break": 5 * 60,
  "long-break": 15 * 60,
};

// Flowtime break recommendation based on work duration (seconds)
export function recommendedBreak(workedSeconds: number): number {
  if (workedSeconds < 25 * 60) return 5 * 60;
  if (workedSeconds < 50 * 60) return 8 * 60;
  if (workedSeconds < 90 * 60) return 10 * 60;
  return 15 * 60;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface UseTimerOptions {
  method: TimerMethod;
  selectedTask: Task | null;
  onSessionEnd?: () => void;
}

export function useTimer({
  method,
  selectedTask,
  onSessionEnd,
}: UseTimerOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds elapsed (flowtime)
  const [remaining, setRemaining] = useState(POMODORO_DURATIONS.work); // countdown (pomodoro)
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false); // flowtime break mode

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset when method changes
  useEffect(() => {
    clearTimer();
    setIsRunning(false);
    setElapsed(0);
    setRemaining(POMODORO_DURATIONS.work);
    setPhase("work");
    setIsOnBreak(false);
  }, [method]);

  const start = useCallback(async () => {
    if (!selectedTask) return;
    const now = new Date();
    setSessionStart(now);

    const id = await createSession({
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      method,
      startTime: now,
      endTime: null,
      duration: 0,
      phase: method === "pomodoro" ? phase : undefined,
      completed: false,
    });
    setSessionId(id);
    setIsRunning(true);
  }, [selectedTask, method, phase]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(
    async (completed = false) => {
      clearTimer();
      setIsRunning(false);

      const workedTime =
        method === "pomodoro" ? POMODORO_DURATIONS[phase] - remaining : elapsed;

      if (sessionId && selectedTask) {
        await closeSession(sessionId, workedTime, completed);
        if (phase === "work" || method === "flowtime") {
          await updateTask(selectedTask.id, {
            totalTimeSpent: selectedTask.totalTimeSpent + workedTime,
            ...(completed && method === "pomodoro"
              ? { pomodorosCompleted: selectedTask.pomodorosCompleted + 1 }
              : {}),
          });
        }
      }

      setSessionId(null);
      setSessionStart(null);
      setElapsed(0);
      setRemaining(POMODORO_DURATIONS.work);
      setPhase("work");
      setIsOnBreak(false);
      onSessionEnd?.();
    },
    [sessionId, selectedTask, method, phase, remaining, elapsed, onSessionEnd],
  );

  // Tick
  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      if (method === "flowtime") {
        setElapsed((e) => e + 1);
      } else {
        setRemaining((r) => {
          if (r <= 1) {
            // Phase finished
            clearTimer();
            setIsRunning(false);
            handlePomodoroPhaseEnd();
            return 0;
          }
          return r - 1;
        });
      }
    }, 1000);

    return clearTimer;
  }, [isRunning, method]);

  const handlePomodoroPhaseEnd = useCallback(() => {
    if (phase === "work") {
      setPomodoroCount((c) => {
        const next = c + 1;
        const nextPhase: PomodoroPhase =
          next % 4 === 0 ? "long-break" : "short-break";
        setPhase(nextPhase);
        setRemaining(POMODORO_DURATIONS[nextPhase]);
        return next;
      });
    } else {
      setPhase("work");
      setRemaining(POMODORO_DURATIONS.work);
    }
    onSessionEnd?.();
  }, [phase, onSessionEnd]);

  const startFlowtimeBreak = useCallback(() => {
    setIsOnBreak(true);
    setIsRunning(false);
  }, []);

  const endFlowtimeBreak = useCallback(() => {
    setIsOnBreak(false);
  }, []);

  const skipPhase = useCallback(() => {
    if (method !== "pomodoro") return;
    clearTimer();
    setIsRunning(false);
    handlePomodoroPhaseEnd();
  }, [method, handlePomodoroPhaseEnd]);

  return {
    isRunning,
    elapsed,
    remaining,
    phase,
    pomodoroCount,
    sessionStart,
    isOnBreak,
    start,
    pause,
    resume,
    stop,
    skipPhase,
    startFlowtimeBreak,
    endFlowtimeBreak,
    recommendedBreak: recommendedBreak(elapsed),
  };
}
