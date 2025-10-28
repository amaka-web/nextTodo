import { NextResponse } from "next/server";
import { todos, Todo } from "@/lib/todoStore";

export async function GET() {
  return NextResponse.json({ todos }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const newTodos: Todo[] = Array.isArray(body) ? body : [body];
  todos.push(...newTodos);
  return NextResponse.json({ todos }, { status: 201 });
}
