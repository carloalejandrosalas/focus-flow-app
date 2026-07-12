import { formatTime } from "../hooks/useTimer";
import type { PomodoroPhase, Task } from "../types";

interface Props {
  remaining: number;
  phase: PomodoroPhase;
  pomodoroCount: number;
  isRunning: boolean;
  selectedTask: Task | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkip: () => void;
}

const PHASE_LABELS: Record<PomodoroPhase, string> = {
  work: "Focus Time",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

const PHASE_COLORS: Record<PomodoroPhase, string> = {
  work: "text-indigo-400",
  "short-break": "text-emerald-400",
  "long-break": "text-teal-400",
};

const RING_COLORS: Record<PomodoroPhase, string> = {
  work: "stroke-indigo-500",
  "short-break": "stroke-emerald-500",
  "long-break": "stroke-teal-500",
};

const TOTAL: Record<PomodoroPhase, number> = {
  work: 25 * 60,
  "short-break": 5 * 60,
  "long-break": 15 * 60,
};

export default function PomodoroTimer({
  remaining,
  phase,
  pomodoroCount,
  isRunning,
  selectedTask,
  onStart,
  onPause,
  onResume,
  onStop,
  onSkip,
}: Props) {
  const progress = 1 - remaining / TOTAL[phase];
  const r = 90;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - progress);

  const sessionActive = isRunning || pomodoroCount > 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phase indicator */}
      <div className="flex gap-2 text-sm">
        {(["work", "short-break", "long-break"] as PomodoroPhase[]).map((p) => (
          <span
            key={p}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              phase === p ? `${PHASE_COLORS[p]} bg-slate-700` : "text-slate-600"
            }`}
          >
            {PHASE_LABELS[p]}
          </span>
        ))}
      </div>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width="220" height="220" className="-rotate-90">
          <circle
            cx="110"
            cy="110"
            r={r}
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
          />
          <circle
            cx="110"
            cy="110"
            r={r}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={`${RING_COLORS[phase]} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-mono font-bold tracking-tight">
            {formatTime(remaining)}
          </span>
          <span className={`text-sm font-medium mt-1 ${PHASE_COLORS[phase]}`}>
            {PHASE_LABELS[phase]}
          </span>
        </div>
      </div>

      {/* Pomodoro dots */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < pomodoroCount % 4 ? "bg-indigo-500" : "bg-slate-700"
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!sessionActive ? (
          <button
            onClick={onStart}
            disabled={!selectedTask}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Start Focus
          </button>
        ) : (
          <>
            {isRunning ? (
              <button
                onClick={onPause}
                className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 font-medium transition-colors"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={onResume}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium transition-colors"
              >
                Resume
              </button>
            )}
            <button
              onClick={onSkip}
              className="px-4 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white
                         hover:border-slate-500 text-sm transition-colors"
            >
              Skip
            </button>
            <button
              onClick={onStop}
              className="px-4 py-3 rounded-xl border border-rose-800/60 text-rose-400 hover:bg-rose-400/10
                         text-sm transition-colors"
            >
              End
            </button>
          </>
        )}
      </div>

      {!selectedTask && (
        <p className="text-sm text-slate-500">
          Select a task below to start a session
        </p>
      )}
    </div>
  );
}
