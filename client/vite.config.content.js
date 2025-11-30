import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
    optimizeDeps: {
    include: ["docx"]
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.jsx"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        format: "iife",
      },
    },
    emptyOutDir: false, 
    target: "esnext",
  },
  resolve: {
    alias: {
      "@config": resolve(__dirname, "src/config/index.js"),
      "@services": resolve(__dirname, "src/services"),
      "@gemini": resolve(__dirname, "src/serviceWorker/backgroundWorker/gemini"),
      "@userDB": resolve(__dirname, "src/serviceWorker/backgroundWorker/users/userDb.js"),
      "@userHelper": resolve(__dirname, "src/serviceWorker/backgroundWorker/users/usersHelper.js")
    }
  },
});
