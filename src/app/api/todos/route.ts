import { NextResponse } from "next/server";

let todos: any[] = [];

export async function GET() {
  return NextResponse.json({ todos }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const newTodos = Array.isArray(body) ? body : [body];
  todos = [...todos, ...newTodos];
  return NextResponse.json({ todos }, { status: 201 });
}
