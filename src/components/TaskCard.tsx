import { Link } from "react-router-dom";
import {
  ClockIcon,
  FlameIcon,
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import type { Task } from "../types";
import { formatTime } from "../hooks/useTimer";

interface Props {
  task: Task;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (task: Task) => void;
  selectable?: boolean;
}

const PRIORITY_STYLES = {
  low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  high: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

const STATUS_ICON = {
  todo: <CircleIcon size={16} className="text-slate-500" />,
  "in-progress": (
    <Loader2Icon size={16} className="text-indigo-400 animate-spin" />
  ),
  completed: <CheckCircle2Icon size={16} className="text-emerald-400" />,
};

export default function TaskCard({
  task,
  onDelete,
  isSelected,
  onSelect,
  selectable,
}: Props) {
  return (
    <div
      className={`group relative bg-slate-800 rounded-xl border transition-all
        ${isSelected ? "border-indigo-500 ring-1 ring-indigo-500/40" : "border-slate-700 hover:border-slate-600"}
        ${selectable ? "cursor-pointer" : ""}`}
      onClick={() => selectable && onSelect?.(task)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <span className="mt-0.5 shrink-0">{STATUS_ICON[task.status]}</span>
            <div className="min-w-0">
              <Link
                to={`/tasks/${task.id}`}
                className="font-medium text-sm hover:text-indigo-300 transition-colors truncate block"
                onClick={(e) => selectable && e.preventDefault()}
              >
                {task.title}
              </Link>
              {task.description && (
                <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}
            >
              {task.priority}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-rose-400
                         hover:bg-rose-400/10 transition-all"
            >
              <Trash2Icon size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ClockIcon size={12} />
            {formatTime(task.totalTimeSpent)}
          </span>
          {task.pomodorosCompleted > 0 && (
            <span className="flex items-center gap-1">
              <FlameIcon size={12} className="text-orange-400" />
              {task.pomodorosCompleted} pomodoros
            </span>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-10 text-xs text-indigo-400 font-medium">
          Active
        </div>
      )}
    </div>
  );
}
