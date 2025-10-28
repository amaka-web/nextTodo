// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0]?.message?.content || "No response received.";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("ChatGPT connection error:", error);
    return NextResponse.json({ reply: "Failed to connect to ChatGPT." });
  }
}
