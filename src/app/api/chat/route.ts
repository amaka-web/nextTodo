import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    // Check if the environment variable is set before creating the client
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("Missing OpenAI API key");
      return NextResponse.json(
        { reply: "Server configuration error: Missing API key." },
        { status: 500 }
      );
    }

    // Initialize OpenAI client inside the route handler
    const openai = new OpenAI({ apiKey });

    // Parse user message
    const { message } = await req.json();

    // Validate message
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { reply: "Invalid message content." },
        { status: 400 }
      );
    }

    // Create Chat Completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0]?.message?.content || "No response received.";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("ChatGPT connection error:", error);
    return NextResponse.json(
      { reply: "Failed to connect to ChatGPT." },
      { status: 500 }
    );
  }
}


