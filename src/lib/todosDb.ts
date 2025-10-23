import fs from 'fs';
import path from 'path';

export interface ServerTodo {
  id: string;
  title: string;
  body?: string;
  completed?: boolean;
  deleted?: boolean;
  updatedAt: number;
  ownerId?: string; // optional: to scope todos to a user
}

const DB_PATH = path.join(process.cwd(), 'data', 'todos.json');

function ensure() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf-8');
}

export function readTodos(): ServerTodo[] {
  ensure();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as ServerTodo[];
}

export function writeTodos(todos: ServerTodo[]) {
  ensure();
  fs.writeFileSync(DB_PATH, JSON.stringify(todos, null, 2), 'utf-8');
}