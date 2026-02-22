import ky, { HTTPError } from "ky";

import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants/api";
import { env } from "@/env";

interface APITokens {
  access_token: string;
  token_type: string;
}

export interface APIUser {
  id: number;
  name: string;
  username: string;
  email: string;
  tier_id: number | null;
}

export async function loginToAPI(username: string, password: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const tokens = await ky
      .post(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.LOGIN}`, {
        body: formData,
        credentials: "include"
      })
      .json<APITokens>();

    return tokens.access_token;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

export async function registerToAPI(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<APIUser | null> {
  try {
    return await ky
      .post(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.USER}`, {
        json: data
      })
      .json<APIUser>();
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorBody = await error.response.json<{ detail?: string }>();
      throw new Error(errorBody.detail || ERROR_MESSAGES.REGISTRATION_FAILED);
    }
    console.error("Registration error:", error);
    throw error;
  }
}

export async function getUserFromAPI(accessToken: string): Promise<APIUser | null> {
  try {
    return await ky
      .get(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.USER_ME}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .json<APIUser>();
  } catch (error) {
    console.error("Fetch user error:", error);
    return null;
  }
}

export async function refreshTokenFromAPI(): Promise<string | null> {
  try {
    const tokens = await ky
      .post(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.REFRESH}`, {
        credentials: "include"
      })
      .json<APITokens>();

    return tokens.access_token;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

export async function logoutFromAPI(accessToken: string): Promise<boolean> {
  try {
    await ky.post(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.LOGOUT}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include"
    });

    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}
