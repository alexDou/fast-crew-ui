import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    ".agents/**",
    ".vscode/**",
    ".tasks/**",
    ".dev/**",
    "build/**",
    "next-env.d.ts",
    "eslint.config.mjs"
  ]),
  {
    settings: {
      tailwindcss: {
        callees: ["clsx", "cn", "cva"],
        classRegex: "^(?:class|className)$"
      }
    }
  }
]);
