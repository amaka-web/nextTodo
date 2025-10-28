export interface Todo {
  id: number;
  title: string;
  completed?: boolean;
  updatedAt?: number;
}

export const todos: Todo[] = [];