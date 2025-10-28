// src/components/ChatWidget.tsx
"use client";
import React, { useState } from "react";
import { getChatResponse } from "../../lib/chatApi";
import { MessageCircle, X } from "lucide-react";

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const reply = await getChatResponse(input);
    setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
          <div className="bg-blue-600 text-white flex justify-between items-center p-3">
            <h2 className="font-semibold">AI Assistant</h2>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-blue-500 self-end ml-auto"
                    : "bg-gray-400 self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <p className="text-sm text-gray-700">Thinking...</p>}
          </div>

          <div className="p-2 border-t flex gap-2">
            <input
              type="text"
              className="bg-blue-300 flex-1 border rounded-lg p-2 text-sm outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 text-white rounded-lg px-3 text-sm hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
