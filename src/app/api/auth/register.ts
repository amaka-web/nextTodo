import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, findUserByEmail } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import validator from 'validator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' });

  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  if (!validator.isEmail(email))
    return res.status(400).json({ message: 'Invalid email format' });

  const existingUser = findUserByEmail(email);
  if (existingUser)
    return res.status(400).json({ message: 'Email already registered' });

  const user = await createUser(username, email, password);
  const token = signToken({ id: user.id, email: user.email, username: user.username });

  res.status(200).json({
    message: 'User registered successfully',
    token,
    user: { id: user.id, username: user.username, email: user.email },
  });
}
