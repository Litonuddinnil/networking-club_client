import React, { useState, useEffect } from "react";
import {
  Trophy,
  MapPin,
  Clock,
  Sparkles,
  Radio,
  Check,
  CalendarDays,
  Users,
} from "lucide-react";
import { useAuth } from "@/provider/AuthProvider";
import { useAxiosPublic } from "@/hooks/useAxiosPublic";
import { useToast } from "@/hooks/use-toast";

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

  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const { toast } = useToast();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeEventId = activeEvent?._id || activeEvent?.id;

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

  // বর্তমান ইউজার ইতিমধ্যে রেজিস্টার্ড কি না — চেক করা হচ্ছে (duplicate prevention)
  useEffect(() => {
    let cancelled = false;
    const checkDuplicate = async () => {
      if (!user?.email || !activeEventId) {
        if (!cancelled) setAlreadyRegistered(false);
        return;
      }
      try {
        const { data } = await axiosPublic.get("/api/event-registrations");
        if (cancelled) return;
        const exists = (Array.isArray(data) ? data : []).some(
          (r: any) =>
            String(r.eventId) === String(activeEventId) &&
            (r.memberEmail || "").toLowerCase() === (user.email || "").toLowerCase() &&
            (r.status || "registered").toLowerCase() !== "cancelled"
        );
        setAlreadyRegistered(exists);
      } catch {
        if (!cancelled) setAlreadyRegistered(false);
      }
    };
    checkDuplicate();
    return () => {
      cancelled = true;
    };
  }, [user?.email, activeEventId, axiosPublic]);

  const handleRegister = async () => {
    if (!activeEvent) return;

    if (!user?.email) {
      toast({
        title: "Login required",
        description: "Please sign in to register for this event.",
        variant: "destructive",
      });
      return;
    }

    if (alreadyRegistered || submitting) return;

    const memberId =
      (user as any)?.memberId ||
      (user as any)?.uid ||
      String(user.email || "").split("@")[0];
    const memberName =
      user.displayName || (user.email || "").split("@")[0] || "Member";

    setSubmitting(true);
    try {
      await axiosPublic.post("/api/event-registrations", {
        eventId: activeEventId,
        eventTitle: activeEvent.title,
        memberId,
        memberName,
        memberEmail: (user.email || "").toLowerCase(),
        status: "registered",
      });
      setAlreadyRegistered(true);
      toast({
        title: "Registered!",
        description: `You are now registered for "${activeEvent.title}".`,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not register. Please try again.";
      if (err?.response?.status === 409) {
        setAlreadyRegistered(true);
        toast({
          title: "Already registered",
          description: "You have already signed up for this event.",
        });
      } else {
        toast({
          title: "Registration failed",
          description: msg,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeEvent) {
    return (
      <div className="relative overflow-hidden rounded-[28px] border border-emerald-500/20 bg-[#03070E] p-10 text-center font-mono text-xs text-slate-400">
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
    <section
      aria-label="Sports event spotlight"
      className="relative overflow-hidden rounded-[28px] border border-emerald-500/30 bg-linear-to-br from-[#020408] via-[#040B14] to-[#0a1a26] text-white shadow-2xl shadow-emerald-500/10"
    >
      {/* Hero background image with cinematic overlay */}
      {activeEvent.image && (
        <>
          <img
            src={activeEvent.image}
            alt={activeEvent.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#020408] via-[#020408]/85 to-[#020408]/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.18),transparent_55%)]" />
        </>
      )}

      {/* Decorative grid + scanline */}
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(16,185,129,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.6)_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-10 lg:p-14">
        {/* LEFT: Event briefing (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-7">
          <div className="flex items-center gap-3 text-[11px] font-mono tracking-[0.35em] text-emerald-400 uppercase">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative rounded-full w-2.5 h-2.5 bg-emerald-400" />
            </span>
            <span>Next Match • Briefing</span>
            <span className="hidden sm:inline-block w-12 h-px bg-emerald-500/40" />
            <span className="hidden sm:inline text-slate-400 tracking-widest">
              ID • {activeEventId || "—"}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-[1.05] tracking-tight">
                <span className="bg-linear-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
                  {activeEvent.title}
                </span>
              </h2>
              <p className="mt-3 text-slate-400 font-mono text-sm max-w-2xl">
                Join the JSTU Networking and Lab Core for an electrifying
                showdown. Squad up, lock your loadout, and prepare to compete
                on the campus grid.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 rounded-full font-bold uppercase flex items-center tracking-widest">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {activeEvent.type || "WORKSHOP"}
            </span>

            {activeEvent.location && (
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 text-slate-200 rounded-full flex items-center">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                {activeEvent.location}
              </span>
            )}

            {activeEvent.time && (
              <span className="px-4 py-1.5 bg-white/5 border border-white/10 text-slate-200 rounded-full flex items-center">
                <Clock className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                {activeEvent.time}
              </span>
            )}

            <span className="px-4 py-1.5 bg-white/5 border border-white/10 text-slate-200 rounded-full flex items-center">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
              {formattedDate}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleRegister}
              disabled={alreadyRegistered || submitting || isLive}
              className={`group relative px-7 py-3.5 font-mono text-sm font-bold tracking-[0.25em] uppercase rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 overflow-hidden ${
                alreadyRegistered
                  ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 cursor-default"
                  : isLive
                    ? "bg-rose-500/10 border border-rose-500/40 text-rose-300 cursor-not-allowed"
                    : "bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 border border-emerald-400 text-[#02110b] shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-60"
              }`}
            >
              {!alreadyRegistered && !isLive && (
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-linear-to-r from-transparent via-white/30 to-transparent" />
              )}
              <span className="relative flex items-center gap-2">
                {alreadyRegistered ? (
                  <>
                    <Check className="w-4 h-4" />
                    Registered
                  </>
                ) : submitting ? (
                  "Registering..."
                ) : isLive ? (
                  <>
                    <Radio className="w-4 h-4 animate-pulse" />• LIVE — LOBBY
                    OPEN
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />• Register for Event
                  </>
                )}
              </span>
            </button>

            <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.3em] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {isLive ? "Live Now" : "Upcoming Briefing"}
            </span>
          </div>
        </div>

        {/* RIGHT: Countdown (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4 lg:border-l lg:border-emerald-500/20 lg:pl-8">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.35em] text-slate-400">
            <span>Countdown</span>
            <span className="text-emerald-400">
              {isLive ? "Live" : "T-Minus"}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center font-mono">
            {[
              { v: timeLeft.days, label: "Days" },
              { v: timeLeft.hours, label: "Hrs" },
              { v: timeLeft.minutes, label: "Min" },
              { v: timeLeft.seconds, label: "Sec" },
            ].map((u) => (
              <div
                key={u.label}
                className="relative bg-black/40 backdrop-blur border border-emerald-500/25 p-3 sm:p-4 rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent" />
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-400 tabular-nums leading-none">
                  {String(u.v).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-[0.3em] mt-2">
                  {u.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center font-mono">
            <div className="bg-white/5 border border-white/10 rounded-xl py-3">
              <div className="text-emerald-400 text-lg font-bold">42</div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                Squads
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl py-3">
              <div className="text-emerald-400 text-lg font-bold">128</div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                Players
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl py-3">
              <div className="text-emerald-400 text-lg font-bold">8</div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                Rounds
              </div>
            </div>
          </div>

          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] pt-2">
            📅 {formattedDate}
          </p>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="relative h-1 bg-linear-to-r from-emerald-500/0 via-emerald-400/70 to-teal-400/0" />
    </section>
  );
}