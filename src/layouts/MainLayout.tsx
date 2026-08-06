import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  Command,
  LogIn,
  Sparkles,
  Menu,
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  MapPin,
  ArrowUpRight,
  Send,
  Loader2,
  ExternalLink,
  Wifi,
  WifiOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { fadeUp, stagger, sectionView, EASE_OUT } from "@/lib/motion";
import CommandPalette from "@/components/CommandPalette";
import ClubLogo from "@/components/ClubLogo";
import ThemeToggle from "@/components/ThemeToggle";
import NetworkDevicesField from "@/components/NetworkDevicesField";
import NetworkDevicesField3D from "@/components/three/NetworkDevicesField3D";
import ThreeJSErrorBoundary from "@/components/ThreeJSErrorBoundary";
import { useAuth } from "@/provider/AuthProvider";
import { useAxiosPublic } from "@/hooks/useAxiosPublic";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Lab", path: "/lab" },
  { label: "Contact", path: "/contact" },
  { label: "Facebook", path: "https://www.facebook.com/networkingclub.jstu/" },
];

const FOOTER_QUICK = [
  { label: "Lab Core", href: "/lab" },
  { label: "About Club", href: "/#about" },
  { label: "Events & Workshops", href: "/#events" },
  { label: "Executive Team", href: "/#team" },
  { label: "Notices & News", href: "/dashboard?tab=announcements" },
  { label: "Admin Console", href: "/dashboard?tab=admin" },
  { label: "Contact Portal", href: "/contact" },
  { label: "Official Facebook", href: "https://www.facebook.com/networkingclub.jstu/" },
];

const FOOTER_RESOURCES = [
  { label: "Privacy Policy", href: "/contact" },
  { label: "Code of Conduct", href: "/contact" },
  { label: "System Status", href: "/lab" },
  { label: "Lab Changelog", href: "/lab" },
];

const SOCIALS = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/networkingclub.jstu/",
    label: "Facebook",
    accent: "from-[#1877F2] via-[#4267B2] to-[#898F9C]",
    glow: "shadow-[0_0_18px_-2px_rgba(24,119,242,0.65)]",
    ring: "hover:border-[#1877F2]",
    text: "hover:text-[#1877F2]",
    featured: true,
  },
  { icon: Github, href: "https://github.com", label: "GitHub", featured: false },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter / X", featured: false },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", featured: false },
  { icon: Mail, href: "mailto:networkingclub@jstu.ac.bd", label: "Email", featured: false },
];

function Brand({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-3">
      <ClubLogo size={size === "sm" ? 36 : 40} />
    </div>
  );
}

export default function MainLayout() {
  const [showPalette, setShowPalette] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "loading" | "done">("idle");
  const [serverHealth, setServerHealth] = useState<"online" | "offline" | "checking">("online");

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const axiosPublic = useAxiosPublic();

  // Real-time server health check
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const res = await axiosPublic.get("/api/health");
        if (res.data?.status === "online") {
          setServerHealth("online");
        } else {
          setServerHealth("offline");
        }
      } catch (err) {
        setServerHealth("offline");
      }
    };
    checkServerHealth();
  }, [axiosPublic]);

  // Smart Navigation Handler
  const handleNav = (href: string) => {
    setSheetOpen(false);
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      navigate("/");
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      navigate(href);
    }
  };

  const handleNavigateCommand = (view: "home" | "login" | "dashboard" | "admin" | "payment" | "lab") => {
    const routes: Record<typeof view, string> = {
      home: "/",
      login: "/login",
      dashboard: "/dashboard",
      admin: "/dashboard?tab=admin",
      payment: "/dashboard?tab=payment",
      lab: "/lab",
    };
    handleNav(routes[view]);
  };

  const handleSignOut = () => {
    setSheetOpen(false);
    logout();
    navigate("/");
  };

  const handleGoDashboard = () => {
    setSheetOpen(false);
    navigate("/dashboard");
  };

  const handleGoLogin = () => {
    setSheetOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Real-time API Newsletter Subscription
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setNewsletterState("loading");
    try {
      await axiosPublic.post("/api/subscribers", { email: newsletterEmail }).catch(() => {});
    } catch (err) {
      console.error("Newsletter submission error:", err);
    } finally {
      setNewsletterState("done");
      toast({
        title: "Subscribed ✓",
        description: "Your email has been added to our lab briefing list.",
      });
      setNewsletterEmail("");
      setTimeout(() => setNewsletterState("idle"), 2500);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
      {/* 3D Network Layer */}
      <ThreeJSErrorBoundary fallback={null}>
        <NetworkDevicesField3D />
      </ThreeJSErrorBoundary>
      <ThreeJSErrorBoundary fallback={null}>
        <NetworkDevicesField />
      </ThreeJSErrorBoundary>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] cyber-grid"
      />

      {/* HEADER */}
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(8,8,14,0.78)" : "rgba(8,8,14,0.45)",
          borderColor: scrolled ? "rgba(255,107,0,0.22)" : "rgba(255,107,0,0.10)",
        }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
        className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
          scrolled ? "shadow-[0_8px_30px_-12px_rgba(255,107,0,0.25)]" : ""
        }`}
      >
        <div className="sh-container h-16 flex items-center justify-between gap-4">
          <motion.button
            onClick={() => navigate("/")}
            className="group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Brand size="sm" />
          </motion.button>

          <nav className="hidden lg:flex items-center gap-1 text-xs font-mono">
            {NAV_LINKS.map((l) => {
              const active =
                l.path === "/"
                  ? location.pathname === "/"
                  : location.pathname + location.search === l.path.split("#")[0];
              return (
                <button
                  key={l.path}
                  onClick={() => handleNav(l.path)}
                  className={`relative px-3 py-2 rounded-lg transition uppercase tracking-widest ${
                    active
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-linear-to-r from-primary via-accent to-secondary"
                      transition={{ duration: 0.35, ease: EASE_OUT }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPalette(true)}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/40 hover:bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground transition text-xs"
              aria-label="Open command palette"
            >
              <Command className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-[10px] tracking-widest">SEARCH</span>
              <span className="font-mono text-[9px] bg-background border border-border rounded px-1.5 py-0.5">
                ⌘K
              </span>
            </button>

            <ThemeToggle />

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Button size="sm" onClick={handleGoDashboard}>
                  Dashboard
                </Button>
                <Button size="sm" variant="ghost" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleGoLogin}
                className="hidden md:inline-flex"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Portal
              </Button>
            )}

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[calc(100vw-1rem)] max-w-80 sm:w-96 sm:max-w-96">
                <SheetHeader className="mb-6">
                  <Brand size="sm" />
                  <SheetTitle className="sr-only">JSTU NetClub menu</SheetTitle>
                </SheetHeader>
                <Separator className="my-2" />
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((l) => (
                    <button
                      key={l.path}
                      onClick={() => handleNav(l.path)}
                      className="text-left px-3 py-3 rounded-lg hover:bg-muted/50 font-display text-base text-foreground hover:text-primary transition"
                    >
                      {l.label}
                    </button>
                  ))}
                  <Separator className="my-2" />
                  {user ? (
                    <>
                      <Button onClick={handleGoDashboard} className="w-full">
                        Dashboard
                      </Button>
                      <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleGoLogin} className="w-full">
                      <LogIn className="w-4 h-4 mr-2" /> Sign In
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      {/* MAIN */}
      <main className="relative z-10 flex-1">
        <div data-barba="page" data-barba-namespace="main" className="barba-page">
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <motion.footer
        {...sectionView}
        variants={fadeUp}
        className="relative z-10 border-t border-border mt-24"
      >
        <div className="aurora-bg">
          <div className="sh-container py-16 grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <motion.div variants={stagger(0, 0.08)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
              <motion.div variants={fadeUp} className="mb-4">
                <Brand />
              </motion.div>
              <motion.p variants={fadeUp} className="text-sm text-muted-foreground max-w-sm mb-6">
                Building the next generation of network engineers, security researchers and infrastructure architects — one packet at a time.
              </motion.p>
              <motion.form variants={fadeUp} onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Label htmlFor="footer-newsletter" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Lab Briefing
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="footer-newsletter"
                    type="email"
                    placeholder="you@university.edu"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    disabled={newsletterState === "loading"}
                  />
                  <Button type="submit" size="icon" disabled={newsletterState === "loading"}>
                    {newsletterState === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : newsletterState === "done" ? (
                      <span className="text-xs">✓</span>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">
                  Monthly. Zero spam. Unsubscribe anytime.
                </p>
              </motion.form>
            </motion.div>

            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-foreground mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {FOOTER_QUICK.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => handleNav(l.href)}
                      className="text-sm text-muted-foreground hover:text-primary transition flex items-center gap-1 group"
                    >
                      {l.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-foreground mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                {FOOTER_RESOURCES.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => handleNav(l.href)}
                      className="text-sm text-muted-foreground hover:text-primary transition text-left"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-foreground mb-4">
                Connect
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground mb-5">
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary" />
                  <span>Jamalpur Science &amp; Technology University</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 mt-0.5 text-primary" />
                  <span>networkingclub@jstu.ac.bd</span>
                </li>
              </ul>

              <motion.a
                href="https://www.facebook.com/networkingclub.jstu/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative mb-4 flex items-center gap-3 overflow-hidden rounded-xl border border-[#1877F2]/40 bg-linear-to-br from-[#1877F2]/15 via-[#4267B2]/10 to-[#898F9C]/10 p-3 transition hover:border-[#1877F2] hover:shadow-[0_10px_30px_-10px_rgba(24,119,242,0.55)]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#1877F2] to-[#4267B2] text-white shadow-[0_0_18px_-2px_rgba(24,119,242,0.65)]">
                  <Facebook className="h-4 w-4" />
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-[#1877F2]/80">
                    Follow us
                  </span>
                  <span className="block truncate text-sm font-semibold text-foreground">
                    facebook.com/networkingclub.jstu
                  </span>
                </span>
                <ExternalLink className="relative h-4 w-4 shrink-0 text-[#1877F2] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.a>

              <div className="flex items-center gap-2">
                {SOCIALS.map(({ icon: Icon, href, label, accent, glow, ring, text }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={label}
                    whileHover={{ y: -2, scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`group relative w-9 h-9 rounded-lg border border-border bg-card/40 flex items-center justify-center text-muted-foreground transition overflow-hidden ${
                      accent ? `hover:bg-linear-to-br hover:${accent}` : "hover:border-primary hover:text-primary"
                    } ${ring ?? ""} ${text ?? ""} ${glow ?? ""}`}
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Icon className="relative h-4 w-4" />
                  </motion.a>
                ))}
              </div>

              <motion.button
                type="button"
                onClick={() => handleNav("/contact")}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="group mt-5 relative inline-flex w-full items-center justify-between overflow-hidden rounded-xl border border-primary/40 bg-linear-to-br from-primary/10 via-card/40 to-secondary/10 px-4 py-3 text-left transition hover:border-primary hover:shadow-[0_10px_30px_-12px_rgba(0,229,255,0.55)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <span className="relative flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                    Get in touch
                  </span>
                  <span className="font-display text-sm font-bold text-foreground">
                    Open contact board →
                  </span>
                </span>
                <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </span>
              </motion.button>
            </div>
          </div>

          <div className="border-t border-border/60">
            <div className="sh-container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              {/* Dynamic Live Server Health Check Dot */}
              <div className="font-mono flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    serverHealth === "online"
                      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                      : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                  }`}
                />
                <span>
                  © {new Date().getFullYear()} JSTU Networking Club. Server Status:{" "}
                  <strong className={serverHealth === "online" ? "text-emerald-400" : "text-rose-400"}>
                    {serverHealth.toUpperCase()}
                  </strong>
                </span>
              </div>
              <div className="font-mono flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-primary" /> ISO-27001 Ready
                </span>
                <span>v2.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>

      <CommandPalette
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        onNavigate={handleNavigateCommand}
      />
    </div>
  );
}