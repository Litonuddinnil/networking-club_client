import { motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/provider/ThemeProvider";

/**
 * ThemeToggle — small icon-only control.
 * Sits in the header beside the command palette button.
 * Uses router-themed cyan/violet ring on hover for consistency.
 */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94, rotate: -8 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/40 text-muted-foreground transition hover:border-primary hover:text-primary hover:shadow-[0_0_18px_-2px_rgba(0,229,255,0.45)]"
    >
      <Sun className={`absolute h-4 w-4 transition-all ${isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
      <Moon className={`absolute h-4 w-4 transition-all ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`} />
    </motion.button>
  );
}