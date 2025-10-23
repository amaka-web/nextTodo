import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages } = req.body; // [{role: 'user', content: '...'}]

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ message: 'OpenAI key not set' });

  // Minimal call to OpenAI Chat completions
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // use any allowed model (adjust as you like)
      messages,
      max_tokens: 600
    })
  });

  const json = await r.json();
  return res.status(r.status).json(json);
}