import * as React from "react";
import logoWhite from "@/asset/logo_copy_white.PNG";
import logoBlack from "@/asset/logo_black_copy.PNG";
import { useTheme } from "@/provider/ThemeProvider";

interface ClubLogoProps {
  /**
   * Size in pixels. Falls back to named preset sizes when omitted.
   * - numeric: explicit pixel size for the icon container
   * - "sm" | "md" | "lg": preset sizes
   */
  size?: number | "sm" | "md" | "lg";
  className?: string;
  /** Hide the wordmark; useful in tight UI like avatars. */
  compact?: boolean;
  /** Use the new hexagonal mark variant (default). */
  variant?: "hex" | "shield" | "image";
  /** Override the auto theme detection. */
  forceTheme?: "dark" | "light";
}

/**
 * ClubLogo — JSTU NetClub brand mark.
 *
 * - variant="image" (default) renders the real PNG asset:
 *      • `logo_copy_white.PNG` on dark theme
 *      • `logo_black_copy.PNG` on light theme
 * - variant="hex" / "shield" fall back to the original gradient mark.
 *
 * `forceTheme` lets callers (e.g. themed bridge pages) override detection.
 */
export default function ClubLogo({
  size = "md",
  className = "",
  compact = false,
  variant = "image",
  forceTheme,
}: ClubLogoProps) {
  const presets = {
    sm: { box: 28, height: 28, text: "text-sm", sub: "text-[8px]" },
    md: { box: 36, height: 36, text: "text-base", sub: "text-[9px]" },
    lg: { box: 48, height: 48, text: "text-xl", sub: "text-[10px]" },
  } as const;

  const px = typeof size === "number" ? size : presets[size].box;
  const imgHeight = typeof size === "number" ? px : presets[size].height;
  const textCls = typeof size === "number" ? "text-base" : presets[size].text;
  const subCls = typeof size === "number" ? "text-[10px]" : presets[size].sub;

  const { theme } = useTheme();
  const activeTheme = forceTheme ?? theme;
  const imgSrc = activeTheme === "light" ? logoBlack : logoWhite;

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {variant === "image" ? (
        <img
          src={imgSrc}
          alt="JSTU Networking Club logo"
          style={{ height: imgHeight, width: "auto" }}
          className="shrink-0 transition-transform group-hover:scale-105 drop-shadow-[0_0_18px_rgba(255,107,0,0.25)]"
        />
      ) : (
        <div
          style={{ width: px, height: px }}
          className="relative rounded-2xl bg-linear-to-tr from-primary via-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 border border-primary/30 shrink-0 transition-transform group-hover:scale-105"
        >
          <span className="absolute inset-0 rounded-2xl border border-primary/40 animate-ring pointer-events-none" />
        </div>
      )}

      {!compact && (
        <div>
          <div className={`font-display font-extrabold text-foreground ${textCls} tracking-tight leading-tight flex items-center`}>
            JSTU
            <span className="ml-1 text-primary font-mono">NetClub</span>
          </div>
          <div className={`font-mono uppercase tracking-[0.22em] text-muted-foreground ${subCls} leading-none mt-1`}>
            Networking &amp; Lab Core
          </div>
        </div>
      )}
    </div>
  );
}