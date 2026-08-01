import { useEffect } from "react";
import { motion } from "motion/react";
import { Facebook, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fadeUp, EASE_OUT } from "@/lib/motion";

const FB_URL = "https://www.facebook.com/networkingclub.jstu/";

/**
 * Themed "router route" for the Facebook page.
 * Lives inside the SPA so users land on /connect/facebook first, see a branded
 * bridge page with our orange/teal/amber theme, and are then auto-redirected
 * to facebook.com/networkingclub.jstu in a new tab.
 */
export default function FacebookRedirect() {
  useEffect(() => {
    const t = window.setTimeout(() => {
      window.open(FB_URL, "_blank", "noopener,noreferrer");
    }, 900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#1877F2]/30 bg-card/60 p-8 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(24,119,242,0.45)]"
      >
        {/* Animated gradient ring following the project's theme */}
        <span className="pointer-events-none absolute -inset-px rounded-2xl bg-linear-to-br from-primary/40 via-[#1877F2]/30 to-secondary/40 opacity-40 blur-md" />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,107,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,107,0,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#1877F2] to-[#4267B2] text-white shadow-[0_0_30px_-4px_rgba(24,119,242,0.75)]"
          >
            <Facebook className="h-8 w-8" />
            <span className="absolute -inset-1 rounded-2xl border border-[#1877F2]/40 animate-ping" />
          </motion.div>

          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-[#1877F2]/80">
            Connect / Facebook
          </p>
          <h1 className="mb-3 font-display text-2xl font-bold text-gradient-animated sm:text-3xl">
            Opening our Facebook page…
          </h1>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            We're launching{" "}
            <span className="font-semibold text-foreground">facebook.com/networkingclub.jstu</span>{" "}
            in a new tab. If it doesn't open automatically, use the button below.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="bg-linear-to-r from-[#1877F2] to-[#4267B2] text-white hover:from-[#1877F2] hover:to-[#4267B2]/90">
              <a href={FB_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Open Facebook Page
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
          </div>

          {/* Loading bar — matches the orange/teal theme */}
          <div className="mt-7 h-1 w-full overflow-hidden rounded-full bg-border/60">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity }}
              className="h-full w-1/2 bg-linear-to-r from-primary via-[#1877F2] to-secondary"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
