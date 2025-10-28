import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import validator from "validator";
import { users } from "@/lib/usersDB";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!validator.isEmail(email)) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign({ email: user.email, username: user.username }, process.env.JWT_SECRET!, { expiresIn: "1h" });

  return NextResponse.json({ message: "Login successful", token }, { status: 200 });
}

{/*
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Mock check
  if (email === "test@example.com" && password === "password123") {
    return NextResponse.json({
      token: "mock-token",
      user: { id: "1", username: "tester", email },
    });
  }

  return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
}
*/}
