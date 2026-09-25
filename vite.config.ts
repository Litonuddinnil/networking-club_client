import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Use relative asset paths so the built SPA can be served from any
  // sub-path (e.g. behind a reverse proxy, on a custom domain, etc.).
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Forward /api/** to the local Express server (server/index.ts) so
      // dev logs match the browser console. Use the env var
      // VITE_API_PROXY_TARGET to point at a remote deployment when needed
      // (e.g. VITE_API_PROXY_TARGET=https://networking-club-server.onrender.com).
      "/api": {
        target: process.env.VITE_API_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Keep the bundle warning at the recommended 1.5 MB ceiling.
    chunkSizeWarningLimit: 1500,
  },
});
