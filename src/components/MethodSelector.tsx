import type { TimerMethod } from "../types";

interface Props {
  method: TimerMethod;
  onChange: (m: TimerMethod) => void;
  disabled?: boolean;
}

export default function MethodSelector({ method, onChange, disabled }: Props) {
  return (
    <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
      <button
        disabled={disabled}
        onClick={() => onChange("pomodoro")}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
          ${
            method === "pomodoro"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          }
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        🍅 Pomodoro
      </button>
      <button
        disabled={disabled}
        onClick={() => onChange("flowtime")}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
          ${
            method === "flowtime"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          }
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        🌊 Flowtime
      </button>
    </div>
  );
}
