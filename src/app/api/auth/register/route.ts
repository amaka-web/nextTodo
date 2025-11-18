import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsers, saveUsers } from "@/lib/usersDB";

export async function POST(req: Request) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ message: "All fields required" }, { status: 400 });
  }

  const users = getUsers();

  const exists = users.find((u) => u.email === email);
  if (exists) {
    return NextResponse.json({ message: "Email already exists" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  users.push({
    username,
    email,
    password: hashed,
  });

  saveUsers(users);

  return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
}
