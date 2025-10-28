{/*
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import validator from "validator";
import { users } from "@/lib/usersDB";

export async function POST(req: Request) {
  const { username, email, password } = await req.json();

  if (!validator.isEmail(email)) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return NextResponse.json({ message: "Email already exists" }, { status: 400 });
  }

  users.push({ username, email, password });

  const token = jwt.sign({ email, username }, process.env.JWT_SECRET!, { expiresIn: "1h" });

  return NextResponse.json({ message: "Account created", token }, { status: 201 });
}
*/}
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  return NextResponse.json({
    token: "mock-token",
    user: { id: "1", username, email },
  });
}

