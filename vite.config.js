import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.jsx"),
        //background: resolve(__dirname, "src/serviceWorker/background.js")
      },
      output: {
        entryFileNames: "assets/[name].js",
        format: "iife"
      }
    }
  }
});
