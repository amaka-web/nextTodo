import { NextResponse } from "next/server";

let todos: any[] = [];

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const todo = todos.find((t) => t.id === parseInt(params.id));
  if (!todo) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(todo, { status: 200 });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const updatedData = await req.json();
  const id = parseInt(params.id);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  todos[index] = { ...todos[index], ...updatedData };
  return NextResponse.json(todos[index], { status: 200 });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  todos = todos.filter((t) => t.id !== id);
  return NextResponse.json({ todos }, { status: 200 });
}
