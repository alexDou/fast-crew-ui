import ky, { type Options } from "ky";

import { API_TIMEOUT } from "@/constants/api";
import { env } from "@/env";

function normalizeUrl(url: string): string {
  return url.startsWith("/") ? url.slice(1) : url;
}

// FIXME: Set your API base URL and global headers
export const api = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  timeout: API_TIMEOUT,
  headers: {
    Accept: "application/json"
  },
  hooks: {
    beforeRequest: [
      // FIXME: Inject your auth token/header if required
      // ({ request }) => {
      //   const token = getToken();
      //   if (token) request.headers.set("Authorization", `Bearer ${token}`);
      // }
    ]
  }
});

type Cfg = Options;

export const get = async <T>(url: string, config?: Cfg) =>
  api.get(normalizeUrl(url), config).json<T>();

export const post = async <T, B = unknown>(url: string, body?: B, config?: Cfg) =>
  api.post(normalizeUrl(url), { ...config, json: body }).json<T>();

export const put = async <T, B = unknown>(url: string, body?: B, config?: Cfg) =>
  api.put(normalizeUrl(url), { ...config, json: body }).json<T>();

export const del = async <T>(url: string, config?: Cfg) =>
  api.delete(normalizeUrl(url), config).json<T>();
