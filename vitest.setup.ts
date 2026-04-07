import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import "@testing-library/jest-dom/vitest";

function loadEnvFile(fileName: string) {
  const filePath = path.resolve(__dirname, fileName);
  if (!existsSync(filePath)) {
    return;
  }

  const fileContent = readFileSync(filePath, "utf8");

  for (const line of fileContent.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    let value = trimmedLine.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

loadEnvFile(".env.test");
loadEnvFile(".env");

const mutableProcessEnv = process.env as Record<string, string | undefined>;

mutableProcessEnv.NODE_ENV ??= "test";
process.env.NEXT_PUBLIC_NODE_ENV ??= "test";
process.env.AUTH_SECRET ??= "test-auth-secret-value-with-32-chars";
process.env.NEXT_PUBLIC_SITE_URL ??= "http://localhost:3000";
process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:8000";
process.env.NEXT_PUBLIC_GITHUB_URL ??= "https://github.com/aisee-art/aisee";
