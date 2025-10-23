import axios from 'axios';
import { db, Todo } from './dexieClient';

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function pushOutbox() {
  const items = await db.outbox.toArray();
  if (items.length === 0) return;
  try {
    const resp = await axios.post('/api/todos', items, { headers: { 'Content-Type': 'application/json', ...getAuthHeader() }});
    if (resp.status === 201) {
      // clear outbox
      await db.outbox.clear();
      // write server canonical todos to local db
      const serverTodos: Todo[] = resp.data.todos || [];
      // replace local todos with server version (simple approach)
      await db.transaction('rw', db.todos, async () => {
        await db.todos.clear();
        for (const t of serverTodos) await db.todos.put(t);
      });
    }
  } catch (err) {
    // leave items in outbox, will retry later
    console.error('Sync push failed', err);
  }
}

export async function pullServer() {
  try {
    const resp = await axios.get('/api/todos', { headers: { ...getAuthHeader() }});
    if (resp.status === 200) {
      const serverTodos: Todo[] = resp.data || [];
      // Merge server todos into local db using updatedAt
      await db.transaction('rw', db.todos, async () => {
        for (const st of serverTodos) {
          const local = await db.todos.get(st.id);
          if (!local || (st.updatedAt || 0) >= (local.updatedAt || 0)) {
            await db.todos.put(st);
          }
        }
      });
    }
  } catch (err) {
    console.error('Pull failed', err);
  }
}

export function setupSync() {
  // push immediately if online
  if (typeof window === 'undefined') return;
  if (navigator.onLine) {
    pushOutbox();
    pullServer();
  }
  window.addEventListener('online', () => {
    pushOutbox();
    pullServer();
  });
}