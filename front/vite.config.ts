import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  // base:'/Kalhyge-prod/',
  // base: import.meta.env.VITE_BASE_URl,

  build: {
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
    },
  },
  server: {
    host: true,
    watch: {
      usePolling: true,
    },
  },
});
