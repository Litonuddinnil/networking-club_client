/**
 * SportsEventSpotlight — esports / sports-style animated preview card for the
 * next upcoming event. Think Free Fire pre-match lobby: radar ring, scanline,
 * countdown clock, breathing glow border.
 *
 * Animations run on requestAnimationFrame and pure CSS keyframes so they
 * don't fight with GSAP/Lenis. Respects prefers-reduced-motion (static).
 */

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Sparkles, Trophy, Zap } from "lucide-react";

type EventLike = {
  id?: string;
  _id?: string;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  type?: string;
  isRegistered?: boolean;
  image?: string;
};

type Props = {
  events: EventLike[];
};

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setNow(Date.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const diffMs = Math.max(0, target - now);
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, isLive: diffMs === 0, diffMs };
}

function parseEventDate(ev: EventLike): number {
  // Try ISO first, then fall back to arbitrary date string.
  if (typeof ev.date === "string") {
    const iso = Date.parse(ev.date);
    if (!Number.isNaN(iso)) return iso;
  }
  return Number.POSITIVE_INFINITY;
}

export default function SportsEventSpotlight({ events }: Props) {
  const nextEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    return [...events].sort((a, b) => parseEventDate(a) - parseEventDate(b))[0];
  }, [events]);

  const targetTs = nextEvent ? parseEventDate(nextEvent) : 0;
  const countdown = useCountdown(targetTs);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  if (!nextEvent) return null;

  return (
    <div
      data-reveal="up"
      className="relative mb-10 overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/70 via-slate-950 to-black p-6 sm:p-8 shadow-[0_30px_80px_-20px_rgba(16,185,129,0.55)]"
    >
      {/* Animated scan-line */}
      {!reducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="ff-scanline absolute left-0 right-0 mx-auto h-[2px] w-[80%] bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
        </div>
      )}

      {/* Breathing border gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-60"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(16,185,129,0.25), transparent 60%), radial-gradient(120% 80% at 100% 100%, rgba(132,204,22,0.18), transparent 60%)",
          animation: reducedMotion ? undefined : "ffBreath 4.5s ease-in-out infinite",
        }}
      />

      {/* Top neon strip */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-lime-400 to-transparent" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
        {/* LEFT — radar + meta */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0">
              {!reducedMotion && (
                <>
                  <div className="absolute inset-0 rounded-full border border-emerald-400/30" />
                  <div
                    className="absolute inset-0 rounded-full border border-emerald-400/40"
                    style={{ animation: "ffRadar 2.4s linear infinite" }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border border-lime-400/40"
                    style={{ animation: "ffRadar 3.6s linear infinite reverse" }}
                  />
                </>
              )}
              <div className="absolute inset-1 rounded-full bg-emerald-500/15 border border-emerald-400/50 flex items-center justify-center shadow-inner">
                <Trophy className="h-5 w-5 text-emerald-300" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-300 font-mono text-[10px] tracking-[0.3em] uppercase">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-emerald-400"
                  style={
                    reducedMotion
                      ? undefined
                      : { animation: "ffPulse 1.4s ease-in-out infinite" }
                  }
                />
                Next Match · Briefing
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight mt-1">
                {nextEvent.title}
              </h3>
            </div>
          </div>

          {nextEvent.description && (
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
              {nextEvent.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              {nextEvent.type ?? "Esports Brief"}
            </span>
            {nextEvent.location && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                {nextEvent.location}
              </span>
            )}
            {nextEvent.time && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                {nextEvent.time}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT — countdown */}
        <div className="relative">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: "Days", v: countdown.days },
              { label: "Hrs", v: countdown.hours },
              { label: "Min", v: countdown.minutes },
              { label: "Sec", v: countdown.seconds },
            ].map((b, i) => (
              <div
                key={b.label}
                className="rounded-2xl border border-emerald-500/30 bg-black/60 px-2 sm:px-3 py-3 sm:py-4 text-center backdrop-blur-md"
                style={
                  reducedMotion
                    ? undefined
                    : {
                        animation: "ffCellGlow 2.6s ease-in-out infinite",
                        animationDelay: `${i * 0.18}s`,
                      }
                }
              >
                <div className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-emerald-300 tabular-nums leading-none">
                  {String(b.v).padStart(2, "0")}
                </div>
                <div className="mt-1.5 font-mono text-[9px] sm:text-[10px] tracking-[0.3em] text-emerald-400/80 uppercase">
                  {b.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-emerald-300/80">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              {countdown.isLive ? "LIVE NOW" : "Countdown active"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {new Date(targetTs).toDateString()}
            </span>
          </div>

          {countdown.isLive && (
            <div
              className="mt-3 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-3 py-2 text-emerald-300 text-xs font-mono uppercase tracking-widest text-center"
              style={{ animation: "ffBlink 1s steps(2,end) infinite" }}
            >
              ● Live · Join the lobby
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ffScan {
          0%   { transform: translateY(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(220%); opacity: 0; }
        }
        .ff-scanline { animation: ffScan 3.4s linear infinite; }

        @keyframes ffRadar {
          from { transform: scale(0.6); opacity: 1; }
          to   { transform: scale(1.5); opacity: 0; }
        }

        @keyframes ffPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.25); opacity: 0.6; }
        }

        @keyframes ffBreath {
          0%, 100% { opacity: 0.45; }
          50%      { opacity: 0.85; }
        }

        @keyframes ffCellGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.0); border-color: rgba(16,185,129,0.30); }
          50%      { box-shadow: 0 0 22px 0 rgba(16,185,129,0.35); border-color: rgba(16,185,129,0.55); }
        }

        @keyframes ffBlink {
          50% { opacity: 0.4; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ff-scanline { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
