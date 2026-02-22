import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

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

    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/poems/${sourceId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch poems" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.data || []);
  } catch (error) {
    console.error("Fetch poems error:", error);
    return NextResponse.json(
      { error: response?.statusText || "Internal erver error" },
      { status: response?.status || 500 }
    );
  }
}
