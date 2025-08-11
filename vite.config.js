import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: "public/manifest.json", dest: "." },
        { src: "src/serviceWorker/background.js", dest: "." } // copy background as-is
      ]
    })
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      // Only bundle the React content script
      input: {
        content: resolve(__dirname, "src/content.jsx")
      },
      output: {
        entryFileNames: "assets/[name].js",
        format: "es" // bundle content script as ES module
      }
    }
  }
});
