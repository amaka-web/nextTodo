import type { NextApiRequest, NextApiResponse } from 'next';
import { readTodos, writeTodos, ServerTodo } from '@/lib/todosDb';
import { verifyToken } from '@/lib/jwt';

interface AuthPayload {
  sub?: string;
  id?: string;
  email?: string;
  [key: string]: unknown;
}

function requireAuth(req: NextApiRequest, res: NextApiResponse): AuthPayload | null {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  const token = auth.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ message: 'Invalid token' });
    return null;
  }
  return payload as AuthPayload;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;
  
  if (method === 'GET') {
    const payload = requireAuth(req, res);
    if (!payload) return;
    
    const all = readTodos();
    // Optionally filter by ownerId: return only that user's todos
    // const userTodos = all.filter(t => t.ownerId === payload.sub || t.ownerId === payload.id)
    return res.status(200).json(all);
  }

  if (method === 'POST') {
    const payload = requireAuth(req, res);
    if (!payload) return;
    
    const ops = req.body; // expect array of todos or a single todo (upsert)
    const current = readTodos();

    // allow single object or array
    const incoming = Array.isArray(ops) ? ops : [ops];

    for (const item of incoming) {
      // find existing
      const idx = current.findIndex((t) => t.id === item.id);
      
      // attach ownerId if missing
      if (!item.ownerId) {
        item.ownerId = payload.sub || payload.id || payload.email;
      }
      
      if (idx === -1) {
        current.push(item as ServerTodo);
      } else {
        // simple last-write-wins based on updatedAt
        if ((item.updatedAt || 0) >= (current[idx].updatedAt || 0)) {
          current[idx] = { ...current[idx], ...item };
        }
      }
    }

    writeTodos(current);
    return res.status(201).json({ ok: true, todos: current });
  }

  return res.status(405).end();
}