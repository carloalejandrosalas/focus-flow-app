import { formatTime } from "../hooks/useTimer";
import type { Task } from "../types";

interface Props {
  elapsed: number;
  isRunning: boolean;
  isOnBreak: boolean;
  recommendedBreak: number;
  selectedTask: Task | null;
  sessionStart: Date | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onStartBreak: () => void;
  onEndBreak: () => void;
}

export default function FlowtimeTimer({
  elapsed,
  isRunning,
  isOnBreak,
  recommendedBreak,
  selectedTask,
  sessionStart,
  onStart,
  onPause,
  onResume,
  onStop,
  onStartBreak,
  onEndBreak,
}: Props) {
  const sessionActive = sessionStart !== null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Method description */}
      <div className="text-center text-sm text-slate-400 max-w-xs">
        Work until you naturally lose focus, then take a proportional break.
      </div>

      {/* Big stopwatch */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={`relative flex items-center justify-center w-52 h-52 rounded-full border-4
            transition-colors ${isOnBreak ? "border-violet-500/40" : isRunning ? "border-violet-500" : "border-slate-700"}`}
        >
          <div
            className={`absolute inset-1 rounded-full transition-opacity ${
              isRunning ? "animate-pulse opacity-10 bg-violet-500" : "opacity-0"
            }`}
          />
          <div className="flex flex-col items-center">
            <span className="text-5xl font-mono font-bold tracking-tight">
              {formatTime(elapsed)}
            </span>
            <span className="text-sm text-violet-400 font-medium mt-1">
              {isOnBreak ? "On Break" : isRunning ? "Flowing" : "Ready"}
            </span>
          </div>
        </div>

        {/* Break recommendation */}
        {elapsed > 0 && (
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
            <span>Recommended break:</span>
            <span className="text-violet-400 font-medium">
              {formatTime(recommendedBreak)}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {!sessionActive ? (
          <button
            onClick={onStart}
            disabled={!selectedTask}
            className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Start Flow
          </button>
        ) : isOnBreak ? (
          <>
            <button
              onClick={onEndBreak}
              className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium transition-colors"
            >
              Back to Work
            </button>
            <button
              onClick={onStop}
              className="px-4 py-3 rounded-xl border border-rose-800/60 text-rose-400 hover:bg-rose-400/10
                         text-sm transition-colors"
            >
              End Session
            </button>
          </>
        ) : (
          <>
            {isRunning ? (
              <>
                <button
                  onClick={onPause}
                  className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 font-medium transition-colors"
                >
                  Pause
                </button>
                <button
                  onClick={onStartBreak}
                  className="px-6 py-3 rounded-xl bg-violet-700 hover:bg-violet-600 font-medium transition-colors"
                >
                  Take Break
                </button>
              </>
            ) : (
              <button
                onClick={onResume}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium transition-colors"
              >
                Resume
              </button>
            )}
            <button
              onClick={onStop}
              className="px-4 py-3 rounded-xl border border-rose-800/60 text-rose-400 hover:bg-rose-400/10
                         text-sm transition-colors"
            >
              End Session
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
