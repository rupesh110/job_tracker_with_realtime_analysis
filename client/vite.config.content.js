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
      },
      output: {
        entryFileNames: "assets/[name].js",
        format: "iife",
      },
    },
    emptyOutDir: false, // don't delete dist so background build files stay
    target: "esnext",
  },
});
