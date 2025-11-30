import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background/index.js"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        format: "es",
      },
    },
    emptyOutDir: false, // keep previous build files
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
