"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ky, { HTTPError } from "ky";

import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants/api";

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

    const result = await ky
      .post(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.POEM_SOURCE}`, {
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .json<{ id: number; media_path: string; status: string }>();

    return {
      success: true,
      data: {
        id: result.id,
        media_path: result.media_path,
        status: result.status
      }
    };
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorBody = await error.response.json<{ detail?: string }>();
      return {
        success: false,
        error: errorBody.detail || ERROR_MESSAGES.UPLOAD_FAILED
      };
    }
    console.error("Upload action error:", error);
    return {
      success: false,
      error: ERROR_MESSAGES.UPLOAD_ERROR
    };
  }
}
