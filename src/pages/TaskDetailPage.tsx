import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ClockIcon,
  FlameIcon,
  PencilIcon,
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import { useTaskDetail } from "../hooks/useTasks";
import { updateTask, deleteTask } from "../lib/firebase";
import TaskForm from "../components/TaskForm";
import { formatTime } from "../hooks/useTimer";
import type { TaskStatus, Session } from "../types";

const PRIORITY_COLORS = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-rose-400",
};

const STATUS_OPTIONS: {
  value: TaskStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "todo", label: "To Do", icon: <CircleIcon size={14} /> },
  {
    value: "in-progress",
    label: "In Progress",
    icon: <Loader2Icon size={14} />,
  },
  {
    value: "completed",
    label: "Completed",
    icon: <CheckCircle2Icon size={14} />,
  },
];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { task, sessions, loading, reload } = useTaskDetail(id);
  const [showEdit, setShowEdit] = useState(false);

  async function handleStatusChange(status: TaskStatus) {
    if (!task) return;
    await updateTask(task.id, { status });
    reload();
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    await deleteTask(task.id);
    navigate("/tasks");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Loading task…
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
        <p>Task not found.</p>
        <Link
          to="/tasks"
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          Back to tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/tasks"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeftIcon size={14} />
        Back to tasks
      </Link>

      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold break-words">{task.title}</h1>
            {task.description ? (
              <p className="text-slate-400 text-sm mt-2 whitespace-pre-wrap">
                {task.description}
              </p>
            ) : (
              <p className="text-slate-600 text-sm mt-2 italic">
                No description.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowEdit(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <PencilIcon size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
            >
              <Trash2Icon size={16} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-slate-700">
          <Stat
            icon={<ClockIcon size={14} className="text-indigo-400" />}
            label="Time Spent"
            value={formatTime(task.totalTimeSpent)}
          />
          <Stat
            icon={<FlameIcon size={14} className="text-orange-400" />}
            label="Pomodoros"
            value={String(task.pomodorosCompleted)}
          />
          <Stat
            icon={
              <span className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                ■
              </span>
            }
            label="Priority"
            value={task.priority}
          />
        </div>

        {/* Status */}
        <div className="mt-5">
          <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
            Status
          </p>
          <div className="flex gap-2 flex-wrap">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                  ${
                    task.status === opt.value
                      ? "bg-slate-700 border-slate-500 text-white"
                      : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
                  }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Session log */}
      <div>
        <h2 className="font-semibold mb-3">Session History</h2>
        {sessions.length === 0 ? (
          <p className="text-slate-500 text-sm py-6 text-center bg-slate-800 border border-slate-700 rounded-xl">
            No sessions recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>

      {showEdit && (
        <TaskForm
          initial={{
            title: task.title,
            description: task.description,
            priority: task.priority,
          }}
          onSubmit={async (data) => {
            await updateTask(task.id, data);
            reload();
          }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SessionRow({ session }: { session: Session }) {
  const methodColor =
    session.method === "pomodoro" ? "text-indigo-400" : "text-violet-400";
  const date = session.startTime.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 gap-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium capitalize ${methodColor}`}>
            {session.method}
          </span>
          {session.phase && (
            <span className="text-xs text-slate-500 capitalize">
              {session.phase.replace("-", " ")}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">{date}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-mono text-slate-300">
          {formatTime(session.duration)}
        </span>
        {session.completed ? (
          <CheckCircle2Icon size={14} className="text-emerald-400" />
        ) : (
          <CircleIcon size={14} className="text-slate-600" />
        )}
      </div>
    </div>
  );
}
