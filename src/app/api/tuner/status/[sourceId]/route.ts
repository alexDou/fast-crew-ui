import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import ky, { HTTPError } from "ky";

import { API_ENDPOINTS, ERROR_MESSAGES, PROCESSING_FAILURE_REASONS } from "@/constants/api";
import { env } from "@/env";

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
      .get(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.poemSourceStatus(sourceId)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .json();

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorBody = await error.response
        .json<{ detail?: string }>()
        .catch(() => ({ detail: "" }));
      const detail = (errorBody.detail || "").trim().toLowerCase();

      if (detail === PROCESSING_FAILURE_REASONS.INDISTINCT_CONTENT) {
        return NextResponse.json({
          ready: true,
          status: "error",
          poem_source_id: Number(sourceId),
          message: PROCESSING_FAILURE_REASONS.INDISTINCT_CONTENT
        });
      }

      return NextResponse.json(
        { error: ERROR_MESSAGES.CHECK_STATUS_FAILED },
        { status: error.response.status }
      );
    }
    console.error("Status check error:", error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
