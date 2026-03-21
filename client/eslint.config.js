import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
    },
    plugins: {
      react: pluginReact,
    },
    extends: [
      js.configs.recommended,        
      pluginReact.configs.flat.recommended, 
    ],
    rules: {
    },
  }
]);
