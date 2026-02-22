import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import ky, { HTTPError } from "ky";

import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants/api";

import { routesBook } from "@/lib/routes-book";

export async function GET(_: Request, { params }: { params: Promise<{ sourceId: string }> }) {
  const { sourceId } = await params;

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return redirect(routesBook.signin);
    }

    const data = await ky
      .get(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.poems(sourceId)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .json<{ data?: unknown[] }>();

    return NextResponse.json(data.data || []);
  } catch (error) {
    if (error instanceof HTTPError) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.FETCH_POEMS_FAILED },
        { status: error.response.status }
      );
    }
    console.error("Fetch poems error:", error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
