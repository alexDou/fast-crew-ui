import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants/api";
import { routesBook } from "@/lib/routes-book";

let response: Response | null = null;

export async function GET(_: Request, { params }: { params: Promise<{ sourceId: string }> }) {
  const { sourceId } = await params;

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return redirect(routesBook.signin);
    }

    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.poems(sourceId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: ERROR_MESSAGES.FETCH_POEMS_FAILED }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.data || []);
  } catch (error) {
    console.error("Fetch poems error:", error);
    return NextResponse.json(
      { error: response?.statusText || ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: response?.status || 500 }
    );
  }
}
