import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

export const ensureDB = () => {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf-8');
};

export const getUsers = (): User[] => {
  ensureDB();
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

export const saveUsers = (users: User[]) => {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
};

export const findUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
};

export const createUser = async (username: string, email: string, password: string): Promise<User> => {
  const users = getUsers();
  const hashed = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: Math.random().toString(36).slice(2),
    username,
    email,
    password: hashed,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};
