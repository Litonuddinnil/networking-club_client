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
      "/api": {
        target: "https://networking-club-server.onrender.com",
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
