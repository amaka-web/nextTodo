import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "users.json");

export interface User {
  username: string;
  email: string;
  password: string; // hashed
}

// Read database
export function getUsers(): User[] {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

// Save database
export function saveUsers(users: User[]) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}
