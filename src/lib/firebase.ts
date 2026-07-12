import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import type { Task, Session, TaskFormData } from "../types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ── Task helpers ──────────────────────────────────────────────────────────────

function toTask(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    title: data.title as string,
    description: (data.description as string) ?? "",
    priority: (data.priority as Task["priority"]) ?? "medium",
    status: (data.status as Task["status"]) ?? "todo",
    totalTimeSpent: (data.totalTimeSpent as number) ?? 0,
    pomodorosCompleted: (data.pomodorosCompleted as number) ?? 0,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
  };
}

function toSession(id: string, data: Record<string, unknown>): Session {
  return {
    id,
    taskId: data.taskId as string,
    taskTitle: (data.taskTitle as string) ?? "",
    method: data.method as Session["method"],
    startTime: (data.startTime as Timestamp)?.toDate() ?? new Date(),
    endTime: data.endTime ? (data.endTime as Timestamp).toDate() : null,
    duration: (data.duration as number) ?? 0,
    phase: data.phase as Session["phase"],
    completed: (data.completed as boolean) ?? false,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    toTask(d.id, d.data() as Record<string, unknown>),
  );
}

export async function fetchTask(id: string): Promise<Task | null> {
  const snap = await getDoc(doc(db, "tasks", id));
  if (!snap.exists()) return null;
  return toTask(snap.id, snap.data() as Record<string, unknown>);
}

export async function createTask(data: TaskFormData): Promise<string> {
  const ref = await addDoc(collection(db, "tasks"), {
    ...data,
    status: "todo",
    totalTimeSpent: 0,
    pomodorosCompleted: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTask(
  id: string,
  data: Partial<Omit<Task, "id" | "createdAt">>,
): Promise<void> {
  await updateDoc(doc(db, "tasks", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, "tasks", id));
}

// ── Session helpers ───────────────────────────────────────────────────────────

export async function fetchSessionsForTask(taskId: string): Promise<Session[]> {
  const q = query(
    collection(db, "sessions"),
    where("taskId", "==", taskId),
    orderBy("startTime", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    toSession(d.id, d.data() as Record<string, unknown>),
  );
}

export async function createSession(
  data: Omit<Session, "id">,
): Promise<string> {
  const ref = await addDoc(collection(db, "sessions"), {
    ...data,
    startTime: Timestamp.fromDate(data.startTime),
    endTime: data.endTime ? Timestamp.fromDate(data.endTime) : null,
  });
  return ref.id;
}

export async function closeSession(
  sessionId: string,
  duration: number,
  completed: boolean,
): Promise<void> {
  await updateDoc(doc(db, "sessions", sessionId), {
    endTime: serverTimestamp(),
    duration,
    completed,
  });
}
