import React, { useEffect } from "react";
import { useNavigate, useLocation, useRouteError } from "react-router-dom";
import { AlertCircle, HelpCircle, ArrowLeft, Compass } from "lucide-react";
import NetworkBackground from "../components/NetworkBackground";

export default function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // useRouteError() returns ErrorResponse for unmatched routes and thrown errors.
  // For an unmatched route, error.status === 404 and error.statusText === "Not Found".
  // Hook MUST be called at the top level of the component (Rules of Hooks).
  // When ErrorPage is rendered via the wildcard "*" route, useRouteError returns
  // undefined, so we fall back to a 404 with the current URL.
  const thrownError = useRouteError() as
    | { status?: number; statusText?: string; message?: string; data?: unknown }
    | undefined;

  const routeError = thrownError;

  const status = routeError?.status ?? 404;
  const statusText = routeError?.statusText ?? "Not Found";
  const errorMessage =
    routeError?.message ||
    (status === 404
      ? "The packet requested a destination segment that is unreachable or unadvertised in our local routing tables. Ensure your gateway is correctly configured."
      : "An unexpected fault was detected along the data path.");

  useEffect(() => {
    // Helpful diagnostic for debugging 404s — visible in browser console.
    // eslint-disable-next-line no-console
    console.warn(
      `[ErrorPage] ${status} ${statusText} at ${location.pathname}${location.search}`,
      routeError
    );
  }, [status, statusText, location.pathname, location.search, routeError]);

  return (
    <div className="min-h-screen bg-[#020408] text-slate-300 relative flex flex-col justify-center items-center p-6 text-center">
      <NetworkBackground />

      <div className="max-w-md bg-[#03070E]/90 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative z-10 backdrop-blur-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center animate-bounce">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-display font-extrabold text-white uppercase tracking-wide">
            {status}: ROUTING LOOP DETECTED
          </h1>
          <p className="text-[10px] text-red-400 font-mono tracking-widest uppercase">
            TTL (Time-To-Live) Threshold Reached
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{errorMessage}</p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono mt-2">
            <Compass className="w-3 h-3 text-orange-500" />
            <span className="truncate max-w-[16rem]" title={`${location.pathname}${location.search}`}>
              {location.pathname}
              {location.search}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Hop back to Gateway</span>
        </button>
      </div>
    </div>
  );
}
