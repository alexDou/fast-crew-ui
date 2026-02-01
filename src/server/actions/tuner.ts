"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { routesBook } from "@/lib/routes-book";

export interface UploadActionResult {
  success: boolean;
  error?: string;
  data?: {
    id: number;
    media_path: string;
    status: string;
  };
}

export async function uploadAction(data: {
  file: File;
  enhance?: string;
}): Promise<UploadActionResult> {
  try {
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.enhance) {
      formData.append("enhance", data.enhance);
    }
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return redirect(routesBook.signin);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/poem-source`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.detail || "Upload failed"
      };
    }

    const result = await response.json();

    return {
      success: true,
      data: {
        id: result.id,
        media_path: result.media_path,
        status: result.status
      }
    };
  } catch (error) {
    console.error("Upload action error:", error);
    return {
      success: false,
      error: "An error occurred during upload"
    };
  }
}
