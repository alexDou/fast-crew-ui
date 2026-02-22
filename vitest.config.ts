import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/layouts": path.resolve(__dirname, "./src/components/layouts"),
      "@/widgets": path.resolve(__dirname, "./src/components/widgets"),
      "@/ui": path.resolve(__dirname, "./src/components/ui"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/data": path.resolve(__dirname, "./src/data"),
      "@/schemas": path.resolve(__dirname, "./src/schemas"),
      "@/stores": path.resolve(__dirname, "./src/stores"),
      "@/styles": path.resolve(__dirname, "./src/styles"),
      "@/constants": path.resolve(__dirname, "./src/constants"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/providers": path.resolve(__dirname, "./src/providers"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/server": path.resolve(__dirname, "./src/server")
    }
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
