import type { NextApiRequest, NextApiResponse } from 'next';
import { readTodos, writeTodos } from '@/lib/todosDb';
import { verifyToken } from '@/lib/jwt';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = auth.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: 'Invalid token' });

  const { id } = req.query;
  if (req.method === 'DELETE') {
    const todos = readTodos();
    const idx = todos.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    todos.splice(idx, 1);
    writeTodos(todos);
    return res.status(204).end();
  }

  return res.status(405).end();
}