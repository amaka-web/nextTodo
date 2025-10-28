
import axios from "axios";

export async function getChatResponse(message: string): Promise<string> {
  try {
    const res = await axios.post("/api/chat", { message });
    return res.data.reply || "No response from ChatGPT.";
  } catch (err) {
    console.error("Chat error:", err);
    return "Sorry, I couldn’t connect to ChatGPT.";
  }
}
