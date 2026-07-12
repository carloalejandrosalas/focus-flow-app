import { Link } from "react-router-dom";
import {
  ClockIcon,
  FlameIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
} from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { formatTime } from "../hooks/useTimer";

export default function DashboardPage() {
  const { tasks, loading } = useTasks();

  const totalTime = tasks.reduce((s, t) => s + t.totalTimeSpent, 0);
  const totalPomodoros = tasks.reduce((s, t) => s + t.pomodorosCompleted, 0);
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Your focus overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<ClockIcon size={20} className="text-indigo-400" />}
          label="Total Focus Time"
          value={loading ? "—" : formatTime(totalTime)}
        />
        <StatCard
          icon={<FlameIcon size={20} className="text-orange-400" />}
          label="Pomodoros Done"
          value={loading ? "—" : String(totalPomodoros)}
        />
        <StatCard
          icon={<CheckCircle2Icon size={20} className="text-emerald-400" />}
          label="Tasks Completed"
          value={loading ? "—" : String(completed)}
        />
        <StatCard
          icon={<span className="text-xl">⚡</span>}
          label="In Progress"
          value={loading ? "—" : String(inProgress)}
        />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <ActionCard
          to="/timer"
          emoji="⏱️"
          title="Start a Session"
          description="Use Pomodoro or Flowtime to focus on a task."
          color="bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/60"
        />
        <ActionCard
          to="/tasks"
          emoji="📋"
          title="Manage Tasks"
          description="Add, view and track all your tasks and time logs."
          color="bg-violet-500/10 border-violet-500/30 hover:border-violet-500/60"
        />
      </div>

      {/* Recent tasks */}
      {!loading && tasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-200">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all <ArrowRightIcon size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="flex items-center justify-between bg-slate-800 border border-slate-700
                           hover:border-slate-600 rounded-lg px-4 py-3 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">
                    {task.status.replace("-", " ")}
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {formatTime(task.totalTimeSpent)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="p-2 bg-slate-700/50 rounded-lg w-fit">{icon}</div>
      <div>
        <p className="text-2xl font-bold font-mono">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ActionCard({
  to,
  emoji,
  title,
  description,
  color,
}: {
  to: string;
  emoji: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className={`group block p-5 rounded-xl border transition-all ${color}`}
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="font-semibold mb-1 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  );
}
