import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@/components", replacement: path.resolve(__dirname, "./src/components") },
      { find: "@/layouts", replacement: path.resolve(__dirname, "./src/components/layouts") },
      { find: "@/widgets", replacement: path.resolve(__dirname, "./src/components/widgets") },
      { find: "@/ui", replacement: path.resolve(__dirname, "./src/components/ui") },
      { find: "@/hooks", replacement: path.resolve(__dirname, "./src/hooks") },
      { find: "@/data", replacement: path.resolve(__dirname, "./src/data") },
      { find: "@/schemas", replacement: path.resolve(__dirname, "./src/schemas") },
      { find: "@/stores", replacement: path.resolve(__dirname, "./src/stores") },
      { find: "@/styles", replacement: path.resolve(__dirname, "./src/styles") },
      { find: "@/constants", replacement: path.resolve(__dirname, "./src/constants") },
      { find: "@/lib", replacement: path.resolve(__dirname, "./src/lib") },
      { find: "@/providers", replacement: path.resolve(__dirname, "./src/providers") },
      { find: "@/types", replacement: path.resolve(__dirname, "./src/types") },
      { find: "@/utils", replacement: path.resolve(__dirname, "./src/utils") },
      { find: "@/server", replacement: path.resolve(__dirname, "./src/server") },
      { find: "@", replacement: path.resolve(__dirname, "./src") }
    ]
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/**/__tests__/**",
        "src/types/**",
        "src/styles/**"
      ]
    }
  }
});
