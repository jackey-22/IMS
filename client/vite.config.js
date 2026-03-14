import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiPort = process.env.IMS_API_PORT || process.env.PORT || "4000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true
      }
    }
  }
});
