"use client";

import React, { useEffect, useState } from "react";
import { db, Todo } from "@/lib/dexieClient";
import { setupSync, pushOutbox } from "@/lib/syncManager";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { SyncStatus } from "../components/syncStatus";
import { OfflineSyncManager } from "@/app/components/offlineSyncManager";

export const TodoDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [undoQueue, setUndoQueue] = useState<
    { id: string; timer: number | null }[]
  >([]);

  useEffect(() => {
    let mounted = true;
    
    // Initial load from local DB
    (async () => {
      const arr = await db.todos.toArray();
      if (!mounted) return;
      setTodos(arr);
      setLoading(false);
    })();

    // Live query: subscribe to changes
    const refreshTodos = async () => {
      if (!mounted) return;
      setTodos(await db.todos.toArray());
    };

    const iv = setInterval(refreshTodos, 700);
    setupSync(); // Attach online event handlers

    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, []);

  async function createTodo() {
    if (!title.trim()) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      deleted: false,
      updatedAt: Date.now(),
      ownerId: user?.id,
    };
    
    await db.todos.put(newTodo);
    await db.outbox.put(newTodo);
    setTitle("");
    setTodos(await db.todos.toArray());
    
    if (navigator.onLine) {
      pushOutbox().catch(console.error);
    }
  }

  async function startEdit(t: Todo) {
    setEditingId(t.id);
    setEditingTitle(t.title);
  }

  async function saveEdit() {
    if (!editingId) return;
    const t = await db.todos.get(editingId);
    if (!t) return;
    
    t.title = editingTitle;
    t.updatedAt = Date.now();
    
    await db.todos.put(t);
    await db.outbox.put(t);
    setEditingId(null);
    setEditingTitle("");
    setTodos(await db.todos.toArray());
    
    if (navigator.onLine) {
      pushOutbox().catch(console.error);
    }
  }

  async function toggleComplete(t: Todo) {
    t.completed = !t.completed;
    t.updatedAt = Date.now();
    
    await db.todos.put(t);
    await db.outbox.put(t);
    setTodos(await db.todos.toArray());
    
    if (navigator.onLine) {
      pushOutbox().catch(console.error);
    }
  }

  async function softDelete(t: Todo) {
    t.deleted = true;
    t.updatedAt = Date.now();
    
    await db.todos.put(t);
    await db.outbox.put(t);
    setTodos(await db.todos.toArray());

    const timer = window.setTimeout(async () => {
      setUndoQueue((q) => q.filter((item) => item.id !== t.id));
    }, 5000);
    
    setUndoQueue((q) => [...q, { id: t.id, timer }]);

    if (navigator.onLine) {
      pushOutbox().catch(console.error);
    }
  }

  async function cancelDelete(id: string) {
    const found = undoQueue.find((u) => u.id === id);
    if (found && found.timer) clearTimeout(found.timer);
    
    setUndoQueue((q) => q.filter((u) => u.id !== id));
    
    const t = await db.todos.get(id);
    if (!t) return;
    
    t.deleted = false;
    t.updatedAt = Date.now();
    
    await db.todos.put(t);
    await db.outbox.put(t);
    setTodos(await db.todos.toArray());
    
    if (navigator.onLine) {
      pushOutbox().catch(console.error);
    }
  }

  async function permanentDelete(id: string) {
    await db.todos.delete(id);
    
    const tombstone: Todo = {
      id,
      title: "",
      updatedAt: Date.now(),
      deleted: true,
    };
    
    await db.outbox.put(tombstone);
    setTodos(await db.todos.toArray());
    
    if (navigator.onLine) {
      pushOutbox().catch(console.error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      {/* Background Sync Manager */}
      <OfflineSyncManager userId={user?.id} syncInterval={10000} />

      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Todo Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-300">
              {user?.username ?? user?.email}
            </div>
            <button onClick={signOut} className="px-3 py-1 bg-red-600 rounded">
              Sign out
            </button>
          </div>
        </div>

        {/* Sync Status Component */}
        <div className="mb-6">
          <SyncStatus />
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && createTodo()}
              placeholder="New todo"
              className="flex-1 px-3 py-2 rounded bg-slate-800"
            />
            <button
              onClick={createTodo}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" /> Loading...
            </div>
          ) : null}
          
          <ul className="space-y-3">
            {todos
              .filter((t) => !t.deleted)
              .map((t) => (
                <li
                  key={t.id}
                  className="bg-slate-800 p-3 rounded flex justify-between items-center hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!t.completed}
                      onChange={() => toggleComplete(t)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div
                        className={`font-medium ${t.completed ? "line-through text-slate-400" : ""}`}
                      >
                        {t.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        Updated {new Date(t.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(t)}
                      className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => softDelete(t)}
                      className="px-2 py-1 bg-rose-600 rounded hover:bg-rose-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}

            {todos
              .filter((t) => t.deleted)
              .map((t) => (
                <li
                  key={t.id}
                  className="bg-rose-950 p-3 rounded flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium line-through text-slate-300">
                      {t.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      Deleted {new Date(t.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cancelDelete(t.id)}
                      className="px-2 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => permanentDelete(t.id)}
                      className="px-2 py-1 bg-rose-700 rounded hover:bg-rose-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {editingId && (
          <div className="fixed inset-0 grid place-items-center bg-black/50 z-50">
            <div className="bg-slate-800 p-6 rounded max-w-xl w-full">
              <h3 className="text-lg font-semibold mb-3">Edit Todo</h3>
              <input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                className="w-full px-3 py-2 mb-4 bg-slate-900 rounded"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditingTitle("");
                  }}
                  className="px-3 py-1 bg-slate-600 rounded hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
