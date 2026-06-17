/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isTest = process.env.VITEST;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: isTest ? [] : [react()],
  esbuild: isTest ? { jsx: "automatic" } : undefined,
  server: {
    host: "0.0.0.0",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
  },
});
