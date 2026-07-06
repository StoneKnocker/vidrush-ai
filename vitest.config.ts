import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": "/home/stoneknocker/code/vidrush-ai/app",
      "@": "/home/stoneknocker/code/vidrush-ai/app",
    },
  },
  test: {
    environment: "node",
    include: ["app/**/*.test.ts"],
  },
});
