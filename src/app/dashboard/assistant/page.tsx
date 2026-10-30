"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Leaf } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "How many meals have been redistributed?",
  "Which NGOs need vegetarian meals?",
  "Show urgent donations needing pickup",
  "I have 100 surplus meals expiring in 2 hours",
  "How does AI matching work?",
  "Show volunteer statistics",
];

function formatMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-emerald-600 underline">$1</a>');
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 **Welcome to FoodBridge AI Assistant!**\n\nI can help you with platform statistics, finding donations, NGO information, volunteer opportunities, and more.\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg, timestamp: new Date() }]);
    setLoading(true);

    try {
      const r = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const d = await r.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: d.response || "I couldn't process that request. Please try again.",
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Network error. Please check your connection and try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          AI Assistant
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Ask anything about FoodBridge AI platform data</p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "assistant" ? "bg-emerald-100" : "bg-gray-200"}`}>
              {m.role === "assistant" ? <Bot className="w-4 h-4 text-emerald-600" /> : <User className="w-4 h-4 text-gray-600" />}
            </div>
            <div className={`max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === "assistant" ? "bg-white border border-gray-200 text-gray-700" : "bg-emerald-600 text-white"}`}>
                <p dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }} />
              </div>
              <span className="text-xs text-gray-400 mt-1 px-1">
                {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-left text-xs border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask anything about food donations, NGOs, impact…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4 disabled:opacity-60">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
