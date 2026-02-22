"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants/api";
import { routesBook } from "@/lib/routes-book";

import type { APIUser } from "@/server/api/auth";
import { loginToAPI, logoutFromAPI, registerToAPI } from "@/server/api/auth";

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export async function loginAction(username: string, password: string): Promise<AuthActionResult> {
  try {
    const accessToken = await loginToAPI(username, password);

    if (!accessToken) {
      return {
        success: false,
        error: ERROR_MESSAGES.INVALID_CREDENTIALS
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 30,
      path: "/"
    });

    return {
      success: true
    };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: ERROR_MESSAGES.LOGIN_ERROR
    };
  }
}

export async function registerAction(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  try {
    await registerToAPI(data);

    return {
      success: true
    };
  } catch (err) {
    const error = err as Error;
    console.error("Register action error:", error);
    return {
      success: false,
      error: error.message || ERROR_MESSAGES.REGISTRATION_ERROR
    };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (accessToken) {
      await logoutFromAPI(accessToken);
    }

    cookieStore.delete("access_token");
  } catch (error) {
    console.error("Logout action error:", error);
  }

  redirect("/");
}

export async function getCurrentUser(): Promise<APIUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return redirect(routesBook.signin);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.USER_ME}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    });

    if (!response.ok) {
      if (response.status === 401) {
        return redirect(routesBook.signin);
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
