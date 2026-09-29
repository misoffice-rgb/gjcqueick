import { defineConfig } from "vite";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendOrigin = env.VITE_BACKEND_ORIGIN || "http://localhost:8000";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      allowedHosts: [
        "kenisha-uncanny-uncivilly.ngrok-free.dev",
        "expert-remarkably-mustang.ngrok-free.app",
        "7d64-103-152-217-60.ngrok-free.app",
        ".ngrok-free.dev",
        ".ngrok-free.app",
      ],
      proxy: {
        "/api": {
          target: backendOrigin,
          changeOrigin: true,
        },
        "/ws": {
          target: backendOrigin,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
