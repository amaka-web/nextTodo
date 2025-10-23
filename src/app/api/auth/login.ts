import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' });

  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken({ id: user.id, email: user.email, username: user.username });

  res.status(200).json({
    message: 'Login successful',
    token,
    user: { id: user.id, username: user.username, email: user.email },
  });
}
