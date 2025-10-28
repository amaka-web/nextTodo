import axios from "axios";
import { db, Todo } from "./dexieClient";

const BASE_URL = "/api/todos";

function getAuthHeader() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 🔹 Push unsynced todos to your /api/todos endpoint
export async function pushOutbox() {
  const items = await db.outbox.toArray();
  if (items.length === 0) return;

  try {
    const resp = await axios.post(BASE_URL, items, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (resp.status === 201 || resp.status === 200) {
      // Clear outbox after successful push
      await db.outbox.clear();

      // Get server canonical todos
      const serverTodos: Todo[] = resp.data.todos || [];

      // Replace local todos with server version
      await db.transaction("rw", db.todos, async () => {
        await db.todos.clear();
        for (const t of serverTodos) await db.todos.put(t);
      });
    }
  } catch (err) {
    console.error("❌ Sync push failed:", err);
  }
}

// 🔹 Pull latest todos from server to local DB
export async function pullServer() {
  try {
    const resp = await axios.get(BASE_URL, {
      headers: { ...getAuthHeader() },
    });

    if (resp.status === 200) {
      const serverTodos: Todo[] = resp.data.todos || resp.data;

      await db.transaction("rw", db.todos, async () => {
        for (const st of serverTodos) {
          const local = await db.todos.get(st.id);
          if (!local || (st.updatedAt || 0) >= (local.updatedAt || 0)) {
            await db.todos.put(st);
          }
        }
      });
    }
  } catch (err) {
    console.error("❌ Pull failed:", err);
  }
}

// 🔹 Setup background sync for online/offline
export function setupSync() {
  if (typeof window === "undefined") return;

  const syncNow = () => {
    pushOutbox();
    pullServer();
  };

  if (navigator.onLine) syncNow();

  window.addEventListener("online", syncNow);
}
