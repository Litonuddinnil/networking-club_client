/**
 * Central API origin for both local development and the Vercel deployment.
 *
 * Vite's proxy is available only while running `npm run dev`; a production
 * Vercel build must call the Render API directly. Set VITE_API_URL in Vercel
 * to override the fallback when the Render service URL changes.
 */
const configuredApiUrl = (import.meta as any).env.VITE_API_URL as string | undefined;
const productionApiUrl = "https://networking-club-server.onrender.com";

export const apiBaseUrl = (configuredApiUrl ||
  ((import.meta as any).env.PROD ? productionApiUrl : ""))
  .replace(/\/+$/, "");

export const apiUrl = (path: string) =>
  `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

export async function fetchApiJson<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path));
  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}
