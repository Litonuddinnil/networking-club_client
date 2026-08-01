import { useCallback, useState } from "react";
import { useAxiosPublic } from "./useAxiosPublic";

export type AiModel = "gemini" | "deepseek";

interface UseAiDiagnosticsOptions {
  /** Optional extra context sent to the server alongside the user prompt. */
  context?: Record<string, unknown>;
  /** Optional system instruction override. */
  systemInstruction?: string;
}

/**
 * Shared AI diagnostics hook used by the Home page and the Dashboard.
 * Mirrors the previous in-page implementation so existing behaviour is preserved.
 */
export function useAiDiagnostics(options: UseAiDiagnosticsOptions = {}) {
  const axiosPublic = useAxiosPublic();
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSendAiMessage = useCallback(
    async (
      prompt: string,
      model: AiModel,
      callback: (reply: string) => void
    ) => {
      setIsAiLoading(true);
      try {
        const { data } = await axiosPublic.post("/api/diagnose-network", {
          model,
          prompt: JSON.stringify({
            message: prompt,
            context: options.context ?? {},
          }),
          systemInstruction:
            options.systemInstruction ??
            "You are the official JSTU Networking Club AI Diagnostics Assistant.",
        });

        if (data?.text) {
          callback(data.text);
        } else {
          throw new Error(data?.error || "Failed to contact AI engine");
        }
      } catch (error: any) {
        callback(
          `Diagnostics node reported error: ${
            error?.message || "unknown failure"
          }`
        );
      } finally {
        setIsAiLoading(false);
      }
    },
    [axiosPublic, options.context, options.systemInstruction]
  );

  return { isAiLoading, handleSendAiMessage };
}
