import Dexie from 'dexie';

export interface Todo {
  id: string;
  title: string;
  body?: string;
  completed?: boolean;
  deleted?: boolean;
  updatedAt: number;
  ownerId?: string;
}

class AppDB extends Dexie {
  todos!: Dexie.Table<Todo, string>;
  outbox!: Dexie.Table<Todo, string>;

  constructor() {
    super('TodoAppDB');
    this.version(1).stores({
      todos: 'id, updatedAt, completed, deleted',
      outbox: 'id, updatedAt',
    });
    this.todos = this.table('todos');
    this.outbox = this.table('outbox');
  }
}

export const db = new AppDB();