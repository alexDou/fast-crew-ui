"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ky, { HTTPError } from "ky";

import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants/api";
import { env } from "@/env";

import { routesBook } from "@/lib/routes-book";

import type { APIUser } from "@/server/api/auth";
import {
  loginToAPI,
  logoutFromAPI,
  registerToAPI,
  resendVerificationToAPI
} from "@/server/api/auth";

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

interface RecaptchaVerificationResponse {
  success: boolean;
}

async function verifyRecaptchaToken(token: string): Promise<boolean> {
  const recaptchaSecretKey = env.RECAPTCHA_SECRET_KEY;

  if (!recaptchaSecretKey) {
    console.error("Missing RECAPTCHA_SECRET_KEY environment variable");
    return false;
  }

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        secret: recaptchaSecretKey,
        response: token
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as RecaptchaVerificationResponse;
    return data.success;
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return false;
  }
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
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 30,
      path: "/"
    });

    return {
      success: true
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : ERROR_MESSAGES.LOGIN_ERROR;
    return {
      success: false,
      error: message
    };
  }
}

export async function registerAction(data: {
  name: string;
  username: string;
  email: string;
  captchaToken: string;
  password: string;
}): Promise<AuthActionResult> {
  try {
    const isCaptchaValid = await verifyRecaptchaToken(data.captchaToken);

    if (!isCaptchaValid) {
      return {
        success: false,
        error: ERROR_MESSAGES.CAPTCHA_VALIDATION_FAILED
      };
    }

    await registerToAPI({
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password
    });

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

export async function resendVerificationAction(identifier: string): Promise<AuthActionResult> {
  try {
    await resendVerificationToAPI(identifier);
    return { success: true };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      error: error.message || "Unable to resend verification email"
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

  redirect(routesBook.main);
}

export async function getCurrentUser(): Promise<APIUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return redirect(routesBook.signin);
    }

    return await ky
      .get(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.USER_ME}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store"
      })
      .json<APIUser>();
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 401) {
      return redirect(routesBook.signin);
    }
    console.error("Get current user error:", error);
    return null;
  }
}
