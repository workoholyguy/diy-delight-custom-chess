import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isNetlify = Boolean(process.env.NETLIFY);

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: isNetlify ? "dist" : "../server/public",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
      },
    },
  },
});
