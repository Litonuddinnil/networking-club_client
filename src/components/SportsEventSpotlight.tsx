import React, { useState, useEffect } from "react";
import { Trophy, MapPin, Clock, Sparkles, Radio } from "lucide-react";

interface EventItem {
  _id?: string;
  id?: string;
  title?: string;
  type?: string;
  date?: string;
  time?: string;
  location?: string;
  image?: string;
}

interface SportsEventSpotlightProps {
  events?: EventItem[];
}

export default function SportsEventSpotlight({ events = [] }: SportsEventSpotlightProps) {
  // MongoDB ডাটাবেজ থেকে প্রথম সক্রিয় ইভেন্টটি নেওয়া হচ্ছে
  const activeEvent = events.length > 0 ? events[0] : null;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // রিয়েল-টাইম কাউন্টডাউন টাইমার ক্যালকুলেশন
  useEffect(() => {
    if (!activeEvent?.date) return;

    const timer = setInterval(() => {
      const targetTime = new Date(activeEvent.date!).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeEvent]);

  if (!activeEvent) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-[#03070E] p-8 text-center font-mono text-xs text-slate-400">
        <Radio className="w-6 h-6 text-emerald-400 animate-pulse mx-auto mb-2" />
        No active scheduled event telemetry found in database.
      </div>
    );
  }

  const isLive =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  const formattedDate = activeEvent.date
    ? new Date(activeEvent.date).toDateString().toUpperCase()
    : "UPCOMING";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-[#020408] via-[#03070E] to-[#08121e] p-6 sm:p-8 text-white shadow-2xl shadow-emerald-500/10">
      {/* Background Dynamic Image Glow */}
      {activeEvent.image && (
        <div className="pointer-events-none absolute inset-0 opacity-15 overflow-hidden">
          <img
            src={activeEvent.image}
            alt={activeEvent.title}
            className="w-full h-full object-cover filter blur-sm"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Left Side: Dynamic Event Information */}
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center space-x-2 text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>NEXT MATCH • BRIEFING</span>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight leading-tight">
              {activeEvent.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-bold uppercase flex items-center space-x-1">
              <Sparkles className="w-3 h-3 mr-1" />
              {activeEvent.type || "WORKSHOP"}
            </span>

            {activeEvent.location && (
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-full flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-emerald-400 mr-1" />
                {activeEvent.location}
              </span>
            )}

            {activeEvent.time && (
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-full flex items-center space-x-1">
                <Clock className="w-3 h-3 text-emerald-400 mr-1" />
                {activeEvent.time}
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Dynamic Countdown Timer */}
        <div className="space-y-3 w-full lg:w-auto">
          <div className="grid grid-cols-4 gap-3 text-center font-mono">
            <div className="bg-[#020408] border border-emerald-500/20 p-3 sm:p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {String(timeLeft.days).padStart(2, "0")}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">DAYS</div>
            </div>

            <div className="bg-[#020408] border border-emerald-500/20 p-3 sm:p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">HRS</div>
            </div>

            <div className="bg-[#020408] border border-emerald-500/20 p-3 sm:p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">MIN</div>
            </div>

            <div className="bg-[#020408] border border-emerald-500/20 p-3 sm:p-4 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">SEC</div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1">
            <span className="flex items-center text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5" />
              {isLive ? "LIVE NOW" : "UPCOMING BRIEFING"}
            </span>
            <span>📅 {formattedDate}</span>
          </div>

          <button className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase rounded-2xl transition-all shadow-lg shadow-emerald-500/10">
            • {isLive ? "LIVE - JOIN THE LOBBY" : "REGISTER FOR EVENT"}
          </button>
        </div>
      </div>
    </div>
  );
}