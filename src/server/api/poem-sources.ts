import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";

import ky from "ky";

import { API_ENDPOINTS } from "@/constants/api";
import { env } from "@/env";

import { routesBook } from "@/lib/routes-book";

import type { PoemSourceReadType, PoemType } from "@/types";

export async function getPoemSources(): Promise<PoemSourceReadType[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return redirect(routesBook.signin);
  }

  const response = await ky
    .get(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.POEM_SOURCES}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .json<{ data?: PoemSourceReadType[] }>();

  return response.data || [];
}

export async function getPoemsBySourceId(sourceId: string): Promise<PoemType[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return redirect(routesBook.signin);
  }

  const data = await ky
    .get(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.poems(sourceId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .json<{ data?: PoemType[] }>();

  return data.data || [];
}

export async function getPoemsBySourceId(sourceId: string): Promise<PoemType[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return redirect(routesBook.signin);
  }

  const data = await ky
    .get(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.poems(sourceId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .json<{ data?: PoemType[] }>();

  return data.data || [];
}
