import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    open: true, // Automatically open browser on server start
    proxy: {
      "/api": {
        // Use VITE_API_URL from .env, fallback to localhost:3001
        // Extract the base URL (without /api path) for the proxy target
        target:
          process.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
          "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
