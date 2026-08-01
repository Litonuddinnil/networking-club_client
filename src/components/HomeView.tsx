import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Users,
  Calendar,
  Megaphone,
  ArrowRight,
  Cpu,
  Trophy,
  Sparkles,
  Network,
  Zap,
  Globe2,
  Radio,
  ShieldCheck,
  Layers,
  Server,
  Wifi,
  ChevronDown,
  Terminal,
  Cpu as CpuIcon,
  Quote,
  Mail,
  User as UserIcon,
  MessageSquare,
  Building2,
  GraduationCap,
  Briefcase,
  Facebook,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Twitter,
  Search,
  Filter,
  RefreshCw,
  Database,
  Signal,
  Flame,
  Play,
  CheckCircle2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchApiJson } from "@/lib/api";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import NetworkGlobe3D from "./NetworkGlobe3D";
import { type TopologyMode } from "./three/TopologyLab3D";
import ThreeJSErrorBoundary from "./ThreeJSErrorBoundary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import SportsEventSpotlight from "@/components/SportsEventSpotlight";
import { fadeUp, stagger, sectionView, EASE_OUT } from "@/lib/motion";

// Lenis smooth scrolling import (Ensure package is installed: npm i lenis)
import Lenis from "lenis";

interface Notice {
  _id?: string;
  title?: string;
  description?: string;
  date?: string;
  category?: string;
}

interface EventItem {
  _id?: string;
  title?: string;
  date?: string;
  description?: string;
  location?: string;
}

interface Member {
  _id?: string;
  name?: string;
  role?: string;
  xp?: number;
}

interface Course {
  _id?: string;
  title?: string;
  level?: string;
  provider?: string;
  progress?: number;
  description?: string;
}

interface Device {
  _id?: string;
  name?: string;
  category?: string;
  type?: string;
  status?: string;
  location?: string;
  throughput?: string;
}

interface TopologyMetric {
  _id?: string;
  id?: string;
  topology: TopologyMode | string;
  label?: string;
  latencyMs: number;
  throughputGbps: number;
  uptimePct: number;
  packetHealth: number;
  status?: "live" | "synthetic" | "degraded" | string;
  nodes?: number;
  source?: string;
  lastUpdated?: string;
}

interface Sponsor {
  _id?: string;
  name?: string;
  tier?: string;
}

/* ===========================================================
   Animated counter (IntersectionObserver-based)
   =========================================================== */
const Counter: React.FC<{ value: number; suffix?: string; duration?: number }> = ({
  value,
  suffix = "",
  duration = 1500,
}) => {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.floor(eased * value));
            if (p < 1) requestAnimationFrame(step);
            else setN(value);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, duration]);
  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
};

/* ===========================================================
   Typewriter terminal-style cycling words
   =========================================================== */
const TYPEWRITER_WORDS = [
  "ping club.net",
  "ssh member@lab",
  "trace route to future",
  "build the network",
  "learn. hack. ship.",
];
const Typewriter: React.FC<{ words?: string[] }> = ({ words = TYPEWRITER_WORDS }) => {
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wi];
    const speed = deleting ? 40 : 90;
    const t = setTimeout(() => {
      if (!deleting) {
        const next = word.substring(0, text.length + 1);
        setText(next);
        if (next === word) setTimeout(() => setDeleting(true), 1400);
      } else {
        const next = word.substring(0, text.length - 1);
        setText(next);
        if (next.length === 0) {
          setDeleting(false);
          setWi((wi + 1) % words.length);
        }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [text, deleting, wi, words]);
  return (
    <span className="text-primary font-mono">
      {text}
      <span className="text-primary animate-caret">▌</span>
    </span>
  );
};

// Local member photos
import litonPhoto from "@/asset/liton.jpg";
import anantoPhoto from "@/asset/ananto.jpg";
import fahadPhoto from "@/asset/fahad.jpg";
import hrittikPhoto from "@/asset/hrittik.jpg";
import istiaquePhoto from "@/asset/istiaque.jpg";
import mehediPhoto from "@/asset/mehedi.jpg";
import mouliPhoto from "@/asset/mouli.jpg";
import mubinPhoto from "@/asset/mubin.jpg";
import muktiPhoto from "@/asset/Mukti.jpg";
import newazPhoto from "@/asset/newaz.jpg";
import prokritPhoto from "@/asset/prokrit.jpg";
import shajedulPhoto from "@/asset/shajedul.jpg";
import tanvirPhoto from "@/asset/tanvir_riad.jpg"; 

type TeamMember = {
  name: string;
  role: string;
  memberId: number;
  initials?: string;
  tone: string;
  photo?: string;
  bio?: string;
  quote?: string;
  badge?: string;
  session?: string;
  skills?: string[];
  joined?: string;
  socials?: { facebook?: string; linkedin?: string; twitter?: string; mail?: string };
};

const TEAM: TeamMember[] = [
  {
    name: "Ahaduzaman Ananto",
    role: "Management Secretary",
    memberId: 260018,
    initials: "AA",
    tone: "from-purple-500/30 via-fuchsia-500/20 to-cyan-500/20",
    badge: "Management Secretary",
    session: "2026-2027",
    photo: anantoPhoto,
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Md. Fahad Al Hasan",
    role: "Sponsorship & Partnership Coordinator",
    memberId: 260017,
    initials: "FA",
    photo: fahadPhoto,
    tone: "from-cyan-500/30 via-sky-500/20 to-purple-500/20",
    badge: "Sponsorship Coordinator",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Hrithik Chandra Barman",
    role: "Treasurer",
    memberId: 260006,
    initials: "HB",
    photo: hrittikPhoto,
    tone: "from-violet-500/30 via-purple-500/20 to-fuchsia-500/20",
    badge: "Treasurer",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Istiaque Ahmed",
    role: "E-Sports",
    memberId: 260014,
    initials: "IA",
    photo: istiaquePhoto,
    tone: "from-emerald-500/30 via-teal-500/20 to-cyan-500/20",
    badge: "E-Sports",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Liton Uddin",
    role: "Programming Secretary",
    memberId: 260010,
    initials: "LU",
    photo: litonPhoto,
    tone: "from-amber-500/30 via-orange-500/20 to-pink-500/20",
    badge: "Programming Secretary",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Mehedi Hasan Alvi",
    role: "Events",
    memberId: 260013,
    initials: "MA",
    photo: mehediPhoto,
    tone: "from-emerald-500/30 via-green-500/20 to-cyan-500/20",
    badge: "Events",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Sohisnuta Dey Mouli",
    role: "Marketing Secretary",
    memberId: 260016,
    initials: "SM",
    photo: mouliPhoto,
    tone: "from-cyan-500/30 via-blue-500/20 to-indigo-500/20",
    badge: "Marketing Secretary",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Mubin Tahmid",
    role: "Technical Affairs",
    memberId: 260012,
    initials: "MT",
    photo: mubinPhoto,
    tone: "from-purple-500/30 via-fuchsia-500/20 to-pink-500/20",
    badge: "Technical Affairs",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Nadia Nasrin Mukti",
    role: "Organizing Secretary",
    memberId: 260008,
    initials: "NM",
    photo: muktiPhoto,
    tone: "from-pink-500/30 via-rose-500/20 to-amber-500/20",
    badge: "Organizing Secretary",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Md. Shah Newaz Ahmed Akash",
    role: "Training",
    memberId: 260011,
    initials: "SA",
    photo: newazPhoto,
    tone: "from-rose-500/30 via-pink-500/20 to-purple-500/20",
    badge: "Training",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Mantasha Nusrat Zaman Prokrit",
    role: "Executive Member",
    memberId: 260019,
    initials: "MP",
    photo: prokritPhoto,
    tone: "from-blue-500/30 via-indigo-500/20 to-purple-500/20",
    badge: "Executive Member",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Shajedul Islam",
    role: "Media & Graphics",
    memberId: 260015,
    initials: "SI",
    photo: shajedulPhoto,
    tone: "from-indigo-500/30 via-blue-500/20 to-cyan-500/20",
    badge: "Media & Graphics",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
  {
    name: "Md. Tanvir Hasan Riyad",
    role: "Organizing Secretary",
    memberId: 260007,
    initials: "TR",
    photo: tanvirPhoto,
    tone: "from-amber-500/30 via-yellow-500/20 to-orange-500/20",
    badge: "Organizing Secretary",
    session: "2026-2027",
    quote: "Building Connections. Creating Opportunities. Shaping Futures.",
    bio: "Building Connections. Creating Opportunities. Shaping Futures.",
  },
];

type Advisor = {
  name: string;
  role: string;
  initials: string;
  tone: string;
};

const ADVISORS: Advisor[] = [
  {
    name: "Dr. Al Amin",
    role: "Faculty Advisor · CSE",
    initials: "AA",
    tone: "from-amber-500/30 via-orange-500/20 to-rose-500/20",
  },
  {
    name: "Engr. Kamrul Hasan",
    role: "Industry Mentor · Cisco",
    initials: "KH",
    tone: "from-cyan-500/30 via-blue-500/20 to-indigo-500/20",
  },
];

function TeamSlider({ team }: { team: TeamMember[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);

  const active = team[idx];
  const avatarSrc = (m: TeamMember) =>
    m.photo ||
    `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(m.name)}&backgroundType=gradientLinear&backgroundColor=7c3aed,06b6d4,ec4899`;

  useEffect(() => {
    if (paused || team.length < 2) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % team.length);
    }, 6000);
    return () => clearInterval(t);
  }, [paused, team.length]);

  const prev = () => setIdx((i) => (i - 1 + team.length) % team.length);
  const next = () => setIdx((i) => (i + 1) % team.length);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-8 items-stretch">
        <div className="relative h-[440px] sm:h-[500px] lg:h-[580px] rounded-3xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl shadow-primary/20 group">
          <AnimatePresence mode="wait">
            <motion.div
              key={`photo-${active.name}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="absolute inset-0"
            >
              <img
                src={avatarSrc(active)}
                alt={`${active.name} portrait`}
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover object-top filter saturate-110 group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          </AnimatePresence>

          <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${active.tone} opacity-35 mix-blend-overlay`} />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {active.badge && (
            <div className="absolute top-5 left-5 z-10">
              <Badge className="font-mono text-[11px] tracking-wider uppercase bg-black/60 backdrop-blur-md border-white/30 text-white shadow-lg">
                {active.badge}
              </Badge>
            </div>
          )}

          <div className="absolute top-5 right-5 z-10 px-3 py-1 rounded-full text-[11px] font-mono text-white/90 bg-black/50 backdrop-blur-md border border-white/20">
            {String(idx + 1).padStart(2, "0")} / {String(team.length).padStart(2, "0")}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {active.name}
            </h3>
            <p className="text-sm sm:text-base text-cyan-400 font-mono uppercase tracking-widest mt-2">
              {active.role}
            </p>
          </div>
          <span className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/15" />
        </div>

        <div className="relative flex flex-col justify-between rounded-3xl border border-white/15 bg-card/50 backdrop-blur-xl p-6 sm:p-8 overflow-hidden shadow-xl">
          <div className={`pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-linear-to-br ${active.tone} opacity-25 blur-3xl`} />

          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${active.name}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="relative z-10 space-y-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono uppercase tracking-widest">
                  <Sparkles size={12} /> Executive Profile
                </span>
                <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  Session: {active.session || "2026-2027"}
                </span>
              </div>

              <blockquote className="text-lg sm:text-xl text-foreground/95 font-display italic leading-relaxed border-l-2 border-primary pl-4 my-4">
                "{active.quote || active.bio}"
              </blockquote>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Node ID &amp; Verification</div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400">JNC-EXEC-{active.memberId}</span>
                  <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck size={14} /> Verified Core</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {team.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Show member ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx ? "w-8 bg-primary shadow-[0_0_10px_rgba(255,107,0,0.8)]" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Previous member"
                className="inline-flex w-10 h-10 items-center justify-center rounded-xl border border-white/15 bg-background/60 text-foreground hover:text-primary hover:border-primary/60 transition shadow-md"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                aria-label="Next member"
                className="inline-flex w-10 h-10 items-center justify-center rounded-xl border border-white/15 bg-background/60 text-foreground hover:text-primary hover:border-primary/60 transition shadow-md"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        className="mt-6 flex gap-3 overflow-x-auto pb-3 scrollbar-thin snap-x snap-mandatory"
      >
        {team.map((m, i) => {
          const isActive = i === idx;
          return (
            <button
              key={m.name}
              data-thumb-idx={i}
              onClick={() => setIdx(i)}
              className={`group relative shrink-0 snap-center w-[160px] sm:w-[180px] h-[110px] rounded-2xl overflow-hidden border transition-all ${
                isActive
                  ? "border-primary shadow-[0_0_20px_rgba(255,107,0,0.4)] scale-105"
                  : "border-white/10 hover:border-primary/50 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={avatarSrc(m)}
                alt={`${m.name} thumbnail`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-linear-to-br ${m.tone} opacity-40 mix-blend-overlay`} />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5 text-left">
                <p className="text-xs font-bold text-white truncate">{m.name}</p>
                <p className="text-[9px] text-cyan-300 font-mono uppercase tracking-widest truncate">
                  {m.role}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function HomeView() {
  // Lenis smooth scrolling initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useGsapReveal();
  const [topology, setTopology] = useState<TopologyMode>("mesh");
  const TOPOLOGY_TABS: { id: TopologyMode; label: string; icon: string }[] = [
    { id: "mesh",   label: "Mesh",   icon: "◇◇◇" },
    { id: "hybrid", label: "Hybrid", icon: "✦✧" },
    { id: "tree",   label: "Tree",   icon: "▲▼" },
    { id: "bus",    label: "Bus",    icon: "──" },
    { id: "star",   label: "Star",   icon: "☆" },
    { id: "ring",   label: "Ring",   icon: "◯" },
  ];

  const { data: topologyMetrics = [] } = useQuery<TopologyMetric[]>({
    queryKey: ["public-topology-metrics"],
    queryFn: async () => {
      return fetchApiJson<TopologyMetric[]>("/api/topology-metrics");
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const safeArr = <T,>(v: T[] | undefined): T[] => (Array.isArray(v) ? v : []);

  const currentMetric =
    topologyMetrics.find((m) => m.topology === topology) || topologyMetrics[0];

  const latencyMs = currentMetric?.latencyMs ?? 14;
  const throughputGbps = currentMetric?.throughputGbps ?? 2.4;
  const uptimePct = currentMetric?.uptimePct ?? 99.98;
  const packetHealth = currentMetric?.packetHealth ?? 97.4;

  const latencyPct = Math.min(100, Math.max(2, Math.round((latencyMs / 60) * 100)));
  const throughputPct = Math.min(100, Math.max(4, Math.round((throughputGbps / 4) * 100)));
  const uptimePctBar = Math.min(100, Math.round(uptimePct));
  const healthPct = Math.min(100, Math.max(20, Math.round(packetHealth)));

  const [courseQuery, setCourseQuery] = useState("");
  const [courseLevel, setCourseLevel] = useState<string>("all");
  const [deviceQuery, setDeviceQuery] = useState("");
  const [deviceCategory, setDeviceCategory] = useState<string>("all");

  const { data: notices = [] } = useQuery<Notice[]>({
    queryKey: ["public-notices"],
    queryFn: async () => {
      return fetchApiJson<Notice[]>("/api/notices");
    },
  });

  const { data: events = [] } = useQuery<EventItem[]>({
    queryKey: ["public-events"],
    queryFn: async () => {
      return fetchApiJson<EventItem[]>("/api/events");
    },
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ["public-members"],
    queryFn: async () => {
      return fetchApiJson<Member[]>("/api/members");
    },
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["public-courses"],
    queryFn: async () => {
      return fetchApiJson<Course[]>("/api/courses");
    },
  });

  const { data: devices = [] } = useQuery<Device[]>({
    queryKey: ["public-devices"],
    queryFn: async () => {
      return fetchApiJson<Device[]>("/api/devices");
    },
  });

  const filteredCourses = React.useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    return safeArr(courses)
      .filter((c) => {
        if (courseLevel !== "all" && (c.level || "general").toLowerCase() !== courseLevel) {
          return false;
        }
        if (!q) return true;
        return (
          (c.title || "").toLowerCase().includes(q) ||
          (c.provider || "").toLowerCase().includes(q)
        );
      })
      .slice(0, 4);
  }, [courses, courseQuery, courseLevel]);

  const filteredDevices = React.useMemo(() => {
    const q = deviceQuery.trim().toLowerCase();
    return safeArr(devices)
      .filter((d) => {
        const cat = (d.category || d.type || "other").toLowerCase();
        if (deviceCategory !== "all" && cat !== deviceCategory) return false;
        if (!q) return true;
        return (
          (d.name || "").toLowerCase().includes(q) ||
          cat.includes(q) ||
          (d.location || "").toLowerCase().includes(q)
        );
      })
      .slice(0, 6);
  }, [devices, deviceQuery, deviceCategory]);

  const { data: sponsors = [] } = useQuery<Sponsor[]>({
    queryKey: ["public-sponsors"],
    queryFn: async () => {
      return fetchApiJson<Sponsor[]>("/api/sponsors");
    },
  });

  const upcomingEvents = safeArr(events).slice(0, 4);
  const recentNotices = safeArr(notices).slice(0, 4);
  const memberCount = safeArr(members).length;
  const courseCount = safeArr(courses).length;
  const deviceCount = safeArr(devices).length;
  const sponsorCount = safeArr(sponsors).length;

  const stats = [
    { value: memberCount, label: "Active Members", icon: Users, tone: "primary" },
    { value: courseCount, label: "Training Tracks", icon: Activity, tone: "secondary" },
    { value: deviceCount, label: "IoT Devices", icon: Cpu, tone: "accent" },
    { value: sponsorCount, label: "Industry Partners", icon: Trophy, tone: "primary" },
  ];

  const ticker = [
    { icon: Radio, text: "LIVE: Campus Wi-Fi Maintenance — Block C, 2026-08-02" },
    { icon: ShieldCheck, text: "Cybersecurity Workshop registration is now OPEN" },
    { icon: Server, text: "New Rack 14 deployed — 6 servers online" },
    { icon: Wifi, text: "Captive Portal upgraded to v4.2" },
    { icon: Layers, text: "Member count milestone: 300+ active learners" },
    { icon: Terminal, text: "Hackathon 2026 — 48 hours, 1 mission, infinite packets" },
  ];

  const featureList = [
    { icon: Network, title: "Networking Labs", desc: "Hands-on practice with routers, switches, and real-world topologies.", tone: "primary" },
    { icon: Cpu, title: "IoT Devices", desc: `Explore ${deviceCount}+ IoT devices — sensors, microcontrollers & more.`, tone: "accent" },
    { icon: Trophy, title: "Leaderboard", desc: "Earn XP through challenges, quizzes, and community contributions.", tone: "secondary" },
    { icon: Globe2, title: "Community", desc: `${memberCount}+ passionate learners collaborating on real projects.`, tone: "primary" },
    { icon: ShieldCheck, title: "Cyber Security", desc: "Capture-the-flag, threat modeling, and red-team basics.", tone: "destructive" },
    { icon: Terminal, title: "Hackathons", desc: "48-hour sprints to build real working prototypes.", tone: "secondary" },
  ];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  const { toast } = useToast();
  const [contactState, setContactState] = useState<"idle" | "sending" | "sent">("idle");
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email.includes("@") || !contactForm.message) {
      toast({
        title: "Missing fields",
        description: "Please fill name, email, and message.",
        variant: "destructive",
      });
      return;
    }
    setContactState("sending");
    await new Promise((r) => setTimeout(r, 900));
    setContactState("sent");
    toast({
      title: "Message sent ✓",
      description: "We'll get back to you within 24 hours.",
    });
    setContactForm({ name: "", email: "", message: "" });
    setTimeout(() => setContactState("idle"), 3000);
  };

  return (
    <div className="overflow-hidden bg-background text-foreground relative selection:bg-primary/30 selection:text-primary-foreground">
      {/* HERO SECTION */}
      <section ref={heroRef} data-reveal="parallax" className="relative min-h-[95vh] flex items-center pt-28 pb-16">
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-background via-background/80 to-card/40" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="sh-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="px-3.5 py-2 gap-2 border-primary/40 text-primary bg-primary/10 backdrop-blur-md shadow-lg shadow-primary/10">
                <span className="text-secondary status-dot animate-ping" />
                <span className="font-mono tracking-wider">JSTU Networking Club · Live Core</span>
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight text-foreground"
            >
              <span className="block">Connect.</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Build.
              </span>
              <span className="block">Innovate.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl font-mono text-muted-foreground h-8 flex items-center gap-2 bg-card/40 px-4 py-2 rounded-xl border border-white/10 w-fit backdrop-blur-md"
            >
              <span className="text-primary font-bold">$</span> <Typewriter />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed"
            >
              A premier technological community of <span className="text-primary font-bold">{memberCount}+ passionate scholars</span> exploring hardware routers, IoT automation, and enterprise infrastructure.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Button asChild size="lg" className="group shadow-xl shadow-primary/20 px-8 py-6 text-base rounded-2xl">
                <Link to="/login">
                  <span className="flex items-center gap-2">
                    Member Portal
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 py-6 text-base rounded-2xl border-white/20 bg-card/40 backdrop-blur-md hover:bg-card">
                <Link to="/lab">
                  <Network size={18} />
                  Explore Network Lab
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4"
            >
              {stats.map((s) => (
                <Card key={s.label} className="relative overflow-hidden p-4 card-lift bg-card/50 backdrop-blur-xl border-white/10 shadow-xl">
                  <s.icon className="text-primary mb-2" size={22} />
                  <div className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    <Counter value={s.value} />
                  </div>
                  <Separator className="my-2 bg-white/10" />
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                    {s.label}
                  </div>
                </Card>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[480px] md:h-[600px] w-full"
          >
            <div className="absolute inset-0 rounded-3xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-card/60 to-transparent backdrop-blur-xl">
              <ThreeJSErrorBoundary fallback={<div className="absolute inset-0 bg-primary/10" />}>
                <NetworkGlobe3D />
              </ThreeJSErrorBoundary>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* TICKER SECTION */}
      <section id="ticker" data-reveal="up" className="relative border-y border-white/10 bg-card/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="flex animate-marquee whitespace-nowrap py-3.5">
          {[...ticker, ...ticker].map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-8 text-sm font-mono">
              <t.icon size={16} className="text-primary animate-pulse" />
              <span className="text-foreground/90 font-medium">{t.text}</span>
              <span className="text-primary/40">●</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <motion.section {...sectionView} variants={fadeUp} id="about" data-reveal="up" className="py-28 relative">
        <div className="sh-container">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono uppercase tracking-widest mb-4 shadow-lg shadow-primary/10">
              <Sparkles size={14} /> Core Capabilities
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
              Engineered for <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Network Specialists</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureList.map((f, i) => (
              <Card key={f.title} data-reveal="scale" className="group relative h-full card-lift overflow-hidden bg-card/50 backdrop-blur-xl border-white/10 shadow-xl p-2">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <f.icon className="text-primary" size={26} />
                    </div>
                    <Badge variant="outline" className="font-mono text-xs border-white/20 bg-white/5">0{i + 1}</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold">{f.title}</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm leading-relaxed mt-2">{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </motion.section>

      {/* EVENTS + NOTICES */}
      <motion.section {...sectionView} variants={fadeUp} id="events" data-reveal="up" className="py-28 relative bg-card/25 border-y border-white/10 backdrop-blur-md">
        <div className="sh-container">
          <SportsEventSpotlight events={upcomingEvents} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-lg">
                  <Calendar className="text-primary" size={26} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-foreground">Upcoming Workshops</h2>
                  <p className="text-xs text-emerald-400 font-mono uppercase tracking-widest mt-1">Live Club Events</p>
                </div>
              </div>
              <div className="space-y-4">
                {upcomingEvents.length === 0 && <Skeleton className="h-32 w-full rounded-2xl" />}
                {upcomingEvents.map((ev, i) => (
                  <div key={ev._id || i} data-reveal="slide-left" className="border border-white/15 bg-card/60 backdrop-blur-xl rounded-2xl p-6 card-lift shadow-xl space-y-2 hover:border-emerald-400/40 transition-colors">
                    <div className="text-xs text-primary uppercase tracking-widest font-mono font-bold bg-primary/10 px-3 py-1 rounded-md border border-primary/25 w-fit">
                      📅 {ev.date ? new Date(ev.date).toDateString() : "TBA"}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{ev.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{ev.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center shadow-lg">
                  <Megaphone className="text-accent" size={26} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-foreground">Official Notices</h2>
                  <p className="text-xs text-accent font-mono uppercase tracking-widest mt-1">Official Club Circulars</p>
                </div>
              </div>
              <div className="space-y-4">
                {recentNotices.length === 0 && <Skeleton className="h-32 w-full rounded-2xl" />}
                {recentNotices.map((n, i) => (
                  <div key={n._id || i} data-reveal="slide-right" className="border border-white/15 bg-card/60 backdrop-blur-xl rounded-2xl p-6 card-lift shadow-xl space-y-2">
                    <div className="text-xs text-accent uppercase tracking-widest font-mono font-bold bg-accent/10 px-3 py-1 rounded-md border border-accent/25 w-fit">
                      📢 {n.category || "Announcement"}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{n.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{n.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* RESOURCES HUB & ANIMATED LAB VIDEO SECTION */}
      <motion.section {...sectionView} variants={fadeUp} data-reveal="up" className="py-28 relative">
        <div className="sh-container">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-mono uppercase tracking-widest mb-4 shadow-lg shadow-secondary/10">
              <GraduationCap size={14} /> Academic Infrastructure
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Resources <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Hub</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-card/50 backdrop-blur-xl border-white/15 shadow-xl p-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">Training Tracks</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs border-white/20 bg-white/5">{courseCount} Total</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredCourses.map((c, i) => (
                  <div key={c._id || i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-white/10 hover:border-primary/40 transition">
                    <span className="font-bold text-foreground text-sm">{c.title}</span>
                    <span className="text-[10px] uppercase px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/25 font-mono font-semibold">
                      {c.level || "Standard"}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-xl border-white/15 shadow-xl p-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">Hardware Inventory</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs border-white/20 bg-white/5">{deviceCount} Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDevices.map((d, i) => (
                  <div key={d._id || i} className="p-4 rounded-2xl bg-muted/30 border border-white/10 hover:border-accent/40 transition">
                    <div className="font-bold text-sm text-foreground truncate">{d.name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider mt-1">{d.category || "Router Node"}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Animated Lab Simulation Box with Built-in Cyber CSS Animation */}
          <Card className="mt-8 overflow-hidden bg-card/60 backdrop-blur-2xl border-white/20 shadow-2xl p-2">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center shadow-inner">
                    <Network className="text-secondary animate-pulse" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-white">Live Network Lab Simulation Engine</CardTitle>
                    <div className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-2">
                      <Database size={12} className="text-secondary" /> Telemetry Stream: <span className="text-emerald-400 font-bold">Live &amp; Healthy</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-3 py-1 text-xs">
                  <span className="text-emerald-400 status-dot mr-2 animate-ping" /> SECURE FEED
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="scene-stage h-[420px] sm:h-[480px] relative rounded-2xl overflow-hidden border border-white/25 bg-slate-950 shadow-2xl flex flex-col items-center justify-center group">

                {/* ব্যাকগ্রাউন্ড মুভিং সাইবার গ্রিড ও স্ক্যানার অ্যানিমেশন */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 animate-pulse" />

                {/* স্ক্যানার লাইন যা ওপর থেকে নিচে নামবে */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-[scanline_4s_ease-in-out_infinite]" />

                {/* মাঝখানে রাউটার নোড পালস এফেক্ট */}
                <div className="relative z-10 flex flex-col items-center space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-28 h-28 rounded-full bg-cyan-500/10 animate-ping" />
                    <div className="absolute w-20 h-20 rounded-full bg-primary/20 animate-pulse" />
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.4)] text-cyan-400">
                      <Server size={28} className="animate-bounce" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-mono text-cyan-300 tracking-widest uppercase">Routing Packets via {topology.toUpperCase()} Node</p>
                    <p className="text-[10px] font-mono text-slate-500">JSTU Backbone Hub • Latency: {latencyMs}ms</p>
                  </div>
                </div>

                {/* ফ্লোটিং ডেটা প্যাকেট ডেকোরেশন */}
                <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono text-emerald-400 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  TCP Handshake Established
                </div>

                <div className="absolute top-5 left-5 z-10 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-xl border border-white/30 text-xs font-mono text-cyan-400 flex items-center gap-2 shadow-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  Mode: {topology.toUpperCase()} TOPOLOGY ACTIVE
                </div>
              </div>

              {currentMetric && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-white/10 shadow-lg">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">Avg Latency</div>
                    <div className="text-xl font-black text-foreground mt-1">{latencyMs} <span className="text-xs font-normal text-muted-foreground">ms</span></div>
                    <Progress value={latencyPct} className="mt-3" />
                  </div>
                  <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-white/10 shadow-lg">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">Throughput</div>
                    <div className="text-xl font-black text-foreground mt-1">{throughputGbps} <span className="text-xs font-normal text-muted-foreground">Gbps</span></div>
                    <Progress value={throughputPct} className="mt-3" />
                  </div>
                  <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-white/10 shadow-lg">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">System Uptime</div>
                    <div className="text-xl font-black text-foreground mt-1">{uptimePct}%</div>
                    <Progress value={uptimePctBar} className="mt-3" />
                  </div>
                  <div className="p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-white/10 shadow-lg">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">Packet Health</div>
                    <div className="text-xl font-black text-foreground mt-1">{packetHealth}%</div>
                    <Progress value={healthPct} className="mt-3" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* TEAM SECTION */}
      <motion.section {...sectionView} variants={fadeUp} data-reveal="up" className="py-28 relative bg-card/20 border-t border-white/10">
        <div className="sh-container">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono uppercase tracking-widest mb-4 shadow-lg shadow-primary/10">
              <Building2 size={14} /> Club Leadership
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
              Meet the <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Executive Board</span>
            </h2>
          </div>
          <TeamSlider team={TEAM} />
        </div>
      </motion.section>

      {/* CONTACT SECTION */}
      <motion.section {...sectionView} variants={fadeUp} data-reveal="up" className="py-28 relative">
        <div className="sh-container max-w-3xl">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono uppercase tracking-widest mb-4 shadow-lg shadow-primary/10">
              <Mail size={14} /> Direct Dispatch
            </span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Let's <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Connect</span>
            </h2>
          </div>
          <Card className="bg-card/50 backdrop-blur-2xl border-white/15 shadow-2xl p-4">
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Your Name</Label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Enter full name"
                      className="bg-muted/40 border-white/15 py-6 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Email Address</Label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="student@jstu.ac.bd"
                      className="bg-muted/40 border-white/15 py-6 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Message</Label>
                  <Textarea
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Inquire about membership, network lab booking, or sponsorship..."
                    className="bg-muted/40 border-white/15 rounded-xl resize-none"
                  />
                </div>
                <Button type="submit" disabled={contactState === "sending"} className="w-full py-6 text-base font-bold rounded-xl shadow-xl shadow-primary/20">
                  {contactState === "sending" ? "Transmitting Packet..." : contactState === "sent" ? "Delivered Successfully ✓" : "Dispatch Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </div>
  );
}
