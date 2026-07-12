import { useState, useEffect, useCallback } from "react";
import {
  fetchTasks,
  fetchTask,
  createTask,
  updateTask,
  deleteTask,
  fetchSessionsForTask,
} from "../lib/firebase";
import type { Task, Session, TaskFormData } from "../types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = useCallback(
    async (data: TaskFormData) => {
      await createTask(data);
      await load();
    },
    [load],
  );

  const editTask = useCallback(
    async (id: string, data: Partial<Omit<Task, "id" | "createdAt">>) => {
      await updateTask(id, data);
      await load();
    },
    [load],
  );

  const removeTask = useCallback(
    async (id: string) => {
      await deleteTask(id);
      await load();
    },
    [load],
  );

  return { tasks, loading, error, addTask, editTask, removeTask, reload: load };
}

export function useTaskDetail(id: string | undefined) {
  const [task, setTask] = useState<Task | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [t, s] = await Promise.all([fetchTask(id), fetchSessionsForTask(id)]);
    setTask(t);
    setSessions(s);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { task, sessions, loading, reload: load };
}
