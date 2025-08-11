import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/serviceWorker/background.js"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        format: "es",
      },
    },
    emptyOutDir: false, // keep previous build files
    target: "esnext",
  },
});
