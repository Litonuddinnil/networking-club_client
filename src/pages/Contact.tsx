import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Github, Send, Copy, Check, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { fadeUp, EASE_OUT, stagger } from "@/lib/motion";

const CLUB_EMAIL = "networkingclub@jstu.ac.bd";
const FACEBOOK_URL = "https://www.facebook.com/networkingclub.jstu/";

/**
 * Split-flap / terminal-flavored contact page.
 *
 * Vibe borrowed from coduron.yzz.me/contact.php:
 *  - Black/dark stage with bright LED-style letters
 *  - Each character "flaps" (flip) into place
 *  - Below: clean form with neon LED accents + channel list
 */
export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CLUB_EMAIL);
      setCopied(true);
    } catch {
      /* ignore */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email.includes("@") || !msg) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
    window.setTimeout(() => setSent(false), 2500);
    setName("");
    setEmail("");
    setMsg("");
  };

  return (
    <section className="relative z-10 px-4 py-16">
      <div className="sh-container max-w-5xl">
        {/* Back link */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>

        {/* HERO — split-flap terminal board */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card/60 p-8 md:p-14 backdrop-blur-xl"
        >
          {/* Glow wash — router LEDs */}
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-1 -z-10 opacity-60 blur-2xl"
            style={{
              background:
                "radial-gradient(60% 50% at 30% 30%, rgba(0,229,255,0.25), transparent 60%), radial-gradient(60% 50% at 80% 70%, rgba(138,91,255,0.25), transparent 60%)",
            }}
          />
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            Connect / Contact
          </p>
          <h1 className="mb-2 font-display text-3xl md:text-5xl font-extrabold leading-tight">
            <SplitFlap text="GET IN TOUCH" />
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Workshops, partnerships, executive seats — drop a line and the
            committee will route your message to the right subnet.
          </p>
        </motion.div>

        {/* CHANNELS */}
        <motion.div
          variants={stagger(0.04, 0.08)}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <ChannelCard
            icon={Mail}
            label="Email"
            value={CLUB_EMAIL}
            onAction={handleCopy}
            actionLabel={copied ? "Copied ✓" : "Copy email"}
            copied={copied}
          />
          <ChannelCard
            icon={MapPin}
            label="Lab"
            value="Jashore University of Science & Technology"
            actionLabel="Open map"
            href="#map"
          />
          <ChannelCard
            icon={Phone}
            label="Helpline"
            value="+880 1XXX-XXXXXX"
            actionLabel="Call desk"
            href="tel:+8801000000000"
          />
        </motion.div>

        {/* FORM */}
        <motion.div
          {...fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6"
        >
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-name" className="font-mono text-xs uppercase tracking-widest">
                  Name
                </Label>
                <Input
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email" className="font-mono text-xs uppercase tracking-widest">
                  Email
                </Label>
                <Input
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-msg" className="font-mono text-xs uppercase tracking-widest">
                Message
              </Label>
              <Textarea
                id="c-msg"
                rows={6}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Tell us what you're thinking…"
              />
            </div>
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? "Sending…" : sent ? "Sent ✓" : "Send message"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Side rail — channels + socials */}
          <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="font-display text-lg font-bold">Other channels</h3>
            <p className="text-sm text-muted-foreground">
              Prefer socials? Reach us on Facebook or open a GitHub issue on the
              club repo.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" /> GitHub
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${CLUB_EMAIL}`}>
                  <Mail className="mr-2 h-4 w-4" /> {CLUB_EMAIL}
                </a>
              </Button>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 font-mono text-[10px] uppercase tracking-widest text-primary">
              Response time · &lt; 24 h
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* Split-flap character — each cell flips in sequence. */
function SplitFlap({ text }: { text: string }) {
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {text.split("").map((ch, i) => (
        <SplitFlapChar key={i} char={ch} index={i} />
      ))}
    </span>
  );
}

function SplitFlapChar({ char, index }: { char: string; index: number }) {
  const isSpace = char === " ";
  return (
    <motion.span
      initial={{ rotateX: -90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{
        delay: index * 0.04,
        duration: 0.45,
        ease: EASE_OUT,
      }}
      className={`inline-flex h-[1.1em] w-[0.7em] sm:h-[1.2em] sm:w-[0.7em] items-center justify-center rounded-md border border-primary/40 bg-background font-mono font-bold text-primary shadow-[inset_0_-2px_0_rgba(0,229,255,0.25)] ${
        isSpace ? "opacity-0" : ""
      }`}
    >
      {isSpace ? "\u00A0" : char}
    </motion.span>
  );
}

interface ChannelProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  value: string;
  actionLabel: string;
  href?: string;
  onAction?: () => void;
  copied?: boolean;
}

function ChannelCard({
  icon: Icon,
  label,
  value,
  actionLabel,
  href,
  onAction,
  copied,
}: ChannelProps) {
  const Body = (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className="group rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl transition hover:border-primary/50 hover:shadow-[0_10px_30px_-12px_rgba(0,229,255,0.4)]"
    >
      {Body}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary hover:text-secondary transition"
        >
          {copied ? <Check size={14} /> : onAction ? <Copy size={14} /> : null}
          {actionLabel}
        </button>
        {href && (
          <a
            href={href}
            className="text-xs font-mono text-muted-foreground hover:text-primary transition"
          >
            open →
          </a>
        )}
      </div>
    </motion.div>
  );
}