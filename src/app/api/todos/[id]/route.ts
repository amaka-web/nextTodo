import { NextResponse } from "next/server";
import { todos } from "@/lib/todoStore";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const todo = todos.find((t) => t.id === parseInt(id));
  if (!todo) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(todo, { status: 200 });
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updated = await req.json();
  const index = todos.findIndex((t) => t.id === parseInt(id));

  if (index === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  todos[index] = { ...todos[index], ...updated };
  return NextResponse.json(todos[index], { status: 200 });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const index = todos.findIndex((t) => t.id === parseInt(id));

  if (index === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  todos.splice(index, 1);
  return NextResponse.json({ todos }, { status: 200 });
}
