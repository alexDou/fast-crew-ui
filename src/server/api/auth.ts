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

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.LOGIN}`, {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    if (!response.ok) return null;

    const tokens: APITokens = await response.json();
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
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.USER}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || ERROR_MESSAGES.REGISTRATION_FAILED);
    }

    return await response.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function getUserFromAPI(accessToken: string): Promise<APIUser | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.USER_ME}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Fetch user error:", error);
    return null;
  }
}

export async function refreshTokenFromAPI(): Promise<string | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.REFRESH}`, {
      method: "POST",
      credentials: "include"
    });

    if (!response.ok) return null;

    const tokens: APITokens = await response.json();
    return tokens.access_token;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

export async function logoutFromAPI(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.LOGOUT}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include"
    });

    return response.ok;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}
