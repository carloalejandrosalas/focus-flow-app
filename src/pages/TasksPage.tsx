import { useState } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import type { TaskStatus } from "../types";

const STATUS_TABS: { value: "all" | TaskStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function TasksPage() {
  const { tasks, loading, addTask, removeTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");

  const filtered = tasks
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-slate-400 text-sm mt-1">
            {tasks.length} tasks total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500
                     rounded-lg text-sm font-medium transition-colors"
        >
          <PlusIcon size={16} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors
                ${statusFilter === tab.value ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading tasks…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {tasks.length === 0 ? (
            <>
              <p className="text-lg mb-2">No tasks yet</p>
              <p className="text-sm">Create your first task to get started.</p>
            </>
          ) : (
            <p>No tasks match your filters.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={removeTask} />
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm onSubmit={addTask} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
