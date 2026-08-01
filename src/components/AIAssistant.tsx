import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  Trash2,
  Cpu,
  Brain,
  Zap,
  ChevronRight,
} from "lucide-react";

interface AIAssistantProps {
  isAiLoading: boolean;
  onSendAiMessage: (
    prompt: string,
    model: "gemini" | "deepseek",
    callback: (reply: string) => void
  ) => void;
}

type AiModel = "gemini" | "deepseek";

interface ChatMessage {
  id: number;
  sender: "ai" | "user";
  text: string;
  model?: AiModel;
  /** Used while streaming the AI response for a typewriter effect */
  pending?: boolean;
}

const QUICK_PROMPTS: { label: string; prompt: string; icon: React.ReactNode }[] = [
  {
    label: "CCNA Subnetting",
    prompt: "Explain VLSM subnetting with a worked example for 192.168.10.0/24.",
    icon: <Brain className="w-3 h-3" />,
  },
  {
    label: "MikroTik QoS",
    prompt: "How do I prioritise VoIP traffic on a MikroTik router using queue tree?",
    icon: <Zap className="w-3 h-3" />,
  },
  {
    label: "OSPF Neighbours",
    prompt: "Walk me through troubleshooting OSPF neighbour adjacency issues.",
    icon: <Cpu className="w-3 h-3" />,
  },
  {
    label: "Wi-Fi Diagnostics",
    prompt: "Diagnose why clients keep disconnecting from the campus Wi-Fi.",
    icon: <Sparkles className="w-3 h-3" />,
  },
];

export default function AIAssistant({ isAiLoading, onSendAiMessage }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      sender: "ai",
      text: "Greetings, Auditor. I am your DeepSeek-powered JSTU Networking Club Assistant. Ask me anything regarding CCNA, MikroTik, or network diagnostics.",
      model: "deepseek",
    },
  ]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState<AiModel>("deepseek");
  const idRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to the newest message whenever the list changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isAiLoading]);

  const sendPrompt = (raw: string) => {
    const prompt = raw.trim();
    if (!prompt || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: idRef.current++,
      sender: "user",
      text: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Placeholder AI bubble so the user sees the typing indicator immediately
    const pendingId = idRef.current++;
    setMessages((prev) => [
      ...prev,
      { id: pendingId, sender: "ai", text: "", model, pending: true },
    ]);

    onSendAiMessage(prompt, model, (reply) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId ? { ...m, text: reply, pending: false } : m
        )
      );
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(input);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: idRef.current++,
        sender: "ai",
        text: "Conversation cleared. How can I help you with networking today?",
        model,
      },
    ]);
    inputRef.current?.focus();
  };

  const statusLabel = useMemo(() => {
    if (isAiLoading) return "STREAMING";
    return "ONLINE";
  }, [isAiLoading]);

  return (
    <div className="bg-[#03070E] border border-white/10 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Subtle animated radial wash */}
      <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl animate-pulse pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              NetClub AI Diagnostics
            </h3>
            <p className="text-[9px] text-slate-500 font-mono">
              Powered by {model === "gemini" ? "Gemini" : "DeepSeek"} Core
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear conversation"
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <span
            className={`px-2 py-0.5 font-mono text-[8px] font-bold rounded-md border transition-colors ${
              isAiLoading
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${
                isAiLoading
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-400 animate-pulse"
              }`}
            />
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Model switcher */}
      <div className="relative z-10 flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 w-full sm:w-fit">
        {(["deepseek", "gemini"] as AiModel[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModel(m)}
            disabled={isAiLoading}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
              model === m
                ? "bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 shadow-inner"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            {m === "gemini" ? "Gemini 1.5" : "DeepSeek V3"}
          </button>
        ))}
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1 relative z-10 text-xs font-mono"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                msg.sender === "user"
                  ? "bg-orange-600 text-white"
                  : "bg-slate-900 border border-white/10 text-cyan-400"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>
            <div
              className={`p-3 rounded-2xl max-w-[80%] text-[11px] leading-relaxed whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-orange-600/10 border border-orange-500/20 text-orange-200 rounded-tr-none"
                  : "bg-slate-900/80 border border-white/5 text-slate-300 rounded-tl-none"
              }`}
            >
              {msg.pending ? (
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                </span>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isAiLoading && !messages.some((m) => m.pending) && (
          <div className="flex items-center space-x-2 text-slate-500 text-[10px] italic">
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
            <span>Analyzing network routing protocols...</span>
          </div>
        )}
      </div>

      {/* Quick prompt chips */}
      <div className="relative z-10 flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => sendPrompt(q.prompt)}
            disabled={isAiLoading}
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-400/30 text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-cyan-400/70 group-hover:text-cyan-300">{q.icon}</span>
            {q.label}
            <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="relative z-10 flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2 focus-within:border-cyan-400/40 transition-colors"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask network diagnostic query..."
          aria-label="AI prompt input"
          className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full font-mono"
        />
        <button
          type="submit"
          disabled={isAiLoading || !input.trim()}
          aria-label="Send message"
          className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors shrink-0 ml-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
