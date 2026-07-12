import { useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useTimer } from "../hooks/useTimer";
import MethodSelector from "../components/MethodSelector";
import PomodoroTimer from "../components/PomodoroTimer";
import FlowtimeTimer from "../components/FlowtimeTimer";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import type { TimerMethod, Task } from "../types";
import { PlusIcon, InfoIcon } from "lucide-react";

const METHOD_INFO = {
  pomodoro: {
    title: "Pomodoro Technique",
    description:
      "Work in focused 25-minute intervals separated by short 5-minute breaks. After 4 pomodoros, take a longer 15-minute break.",
    color: "text-indigo-400",
  },
  flowtime: {
    title: "Flowtime Technique",
    description:
      "Work for as long as you are in flow, then take a proportional break. Respects your natural concentration rhythm.",
    color: "text-violet-400",
  },
};

export default function TimerPage() {
  const { tasks, loading, addTask, removeTask, reload } = useTasks();
  const [method, setMethod] = useState<TimerMethod>("pomodoro");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const timer = useTimer({
    method,
    selectedTask,
    onSessionEnd: () => reload(),
  });

  function handleMethodChange(m: TimerMethod) {
    if (timer.isRunning) return; // don't switch mid-session
    setMethod(m);
  }

  function handleSelectTask(task: Task) {
    if (timer.isRunning) return;
    setSelectedTask((prev) => (prev?.id === task.id ? null : task));
  }

  const info = METHOD_INFO[method];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timer</h1>
          <p className="text-slate-400 text-sm mt-1">
            Stay focused with your chosen method
          </p>
        </div>
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <InfoIcon size={18} />
        </button>
      </div>

      {showInfo && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 space-y-1">
          <p className={`font-semibold ${info.color}`}>{info.title}</p>
          <p className="text-slate-400">{info.description}</p>
        </div>
      )}

      {/* Method selector */}
      <MethodSelector
        method={method}
        onChange={handleMethodChange}
        disabled={timer.isRunning}
      />

      {/* Timer display */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
        {method === "pomodoro" ? (
          <PomodoroTimer
            remaining={timer.remaining}
            phase={timer.phase}
            pomodoroCount={timer.pomodoroCount}
            isRunning={timer.isRunning}
            selectedTask={selectedTask}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onStop={() => timer.stop(false)}
            onSkip={timer.skipPhase}
          />
        ) : (
          <FlowtimeTimer
            elapsed={timer.elapsed}
            isRunning={timer.isRunning}
            isOnBreak={timer.isOnBreak}
            recommendedBreak={timer.recommendedBreak}
            selectedTask={selectedTask}
            sessionStart={timer.sessionStart}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onStop={() => timer.stop(true)}
            onStartBreak={timer.startFlowtimeBreak}
            onEndBreak={timer.endFlowtimeBreak}
          />
        )}
      </div>

      {/* Task selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-200">
            Select Task
            {selectedTask && (
              <span className="ml-2 text-xs text-indigo-400 font-normal">
                — {selectedTask.title}
              </span>
            )}
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white
                       px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <PlusIcon size={12} />
            New Task
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No tasks yet. Create one above to get started.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {tasks
              .filter((t) => t.status !== "completed")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={removeTask}
                  isSelected={selectedTask?.id === task.id}
                  onSelect={handleSelectTask}
                  selectable={!timer.isRunning}
                />
              ))}
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          onSubmit={async (data) => {
            await addTask(data);
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
