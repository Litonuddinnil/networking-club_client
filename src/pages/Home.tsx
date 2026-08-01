import React, { useEffect, useState } from "react";
import HomeView from "../components/HomeView";
import AIAssistant from "@/components/AIAssistant";
import { Sparkles, X } from "lucide-react";
import { useAiDiagnostics } from "@/hooks/useAiDiagnostics";

export default function Home() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const { isAiLoading, handleSendAiMessage } = useAiDiagnostics({
    context: {
      source: "home-page",
      page: "public-landing",
    },
  });

  // Close on Escape key
  useEffect(() => {
    if (!isAiOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsAiOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAiOpen]);

  // Lock body scroll when the chat panel is open (mobile-friendly)
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isAiOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAiOpen]);

  return (
    <>
      <HomeView />

      {/* Floating AI launcher button */}
      <button
        type="button"
        onClick={() => setIsAiOpen((v) => !v)}
        aria-label={isAiOpen ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={isAiOpen}
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all border border-white/20"
      >
        <span className="relative flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
          <Sparkles className="w-4 h-4 relative" />
        </span>
        <span className="hidden sm:inline">AI Help</span>
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setIsAiOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAiOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-up chat panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="NetClub AI assistant"
        className={`fixed z-50 bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[420px] sm:max-w-[calc(100vw-3rem)] transition-all duration-300 ease-out ${
          isAiOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative m-3 sm:m-0 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsAiOpen(false)}
            aria-label="Close chat"
            className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-black/50 hover:bg-black/80 border border-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <AIAssistant
            isAiLoading={isAiLoading}
            onSendAiMessage={handleSendAiMessage}
          />
        </div>
      </aside>
    </>
  );
}
