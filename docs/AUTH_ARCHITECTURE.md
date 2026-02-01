# Authentication Architecture: Better Auth + FastAPI Backend (Stateless)

## Overview

Simple token-based authentication for Next.js 16 UI integrating with FastAPI backend. **No database needed on the UI side** - we just store JWT tokens in secure cookies and use them for API calls.

## Backend API Endpoints (FastAPI)

**Base URL**: `http://localhost:8000/api/v1`

### Authentication
- **POST `/login`** - Returns `access_token` + sets `refresh_token` cookie
- **POST `/refresh`** - Refresh expired access token
- **POST `/logout`** - Blacklist tokens

### User Management
- **POST `/user`** - Register new user (public)
- **GET `/user/me`** - Get current user (requires token)
- **GET `/user/{username}`** - Get user by username (requires token)
- **PATCH `/user/{username}`** - Update user (owner only)
- **DELETE `/user/{username}`** - Delete user (owner only)

### Token Details
- **Access Token**: 30 minutes expiry
- **Refresh Token**: 7 days expiry (HttpOnly cookie)
- **Algorithm**: HS256
- **Format**: JWT Bearer token

## Architecture: Stateless JWT Strategy

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Next.js UI    │         │   Better Auth    │         │   FastAPI       │
│   (Client)      │         │   (Stateless)    │         │   Backend       │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        │ 1. Login form             │                            │
        ├───────────────────────────▶│                            │
        │                            │ 2. POST /login            │
        │                            ├───────────────────────────▶│
        │                            │ 3. access_token           │
        │                            │◀───────────────────────────┤
        │                            │    + refresh_token cookie  │
        │ 4. Store tokens in        │                            │
        │    Better Auth cookies    │                            │
        │◀───────────────────────────┤                            │
        │                            │                            │
        │ 5. API request            │                            │
        │    (auto-attach token)    │                            │
        ├───────────────────────────▶│ 6. Forward with JWT       │
        │                            ├───────────────────────────▶│
        │                            │ 7. Response               │
        │ 8. Data                   │◀───────────────────────────┤
        │◀───────────────────────────┤                            │
```

## Implementation (No Database Required)

### 1. Install Better Auth

```bash
yarn add better-auth
```

**That's it!** No Prisma, no database adapters.

### 2. Better Auth Configuration (`src/lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth"
import { env } from "@/env"

export const auth = betterAuth({
  // NO database needed - using stateless JWT strategy
  session: {
    strategy: "jwt", // Stateless sessions
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  
  secret: env.AUTH_SECRET,
  
  // Custom credentials provider that talks to FastAPI
  plugins: [],
  
  // We'll use custom logic to authenticate against FastAPI
  // instead of Better Auth's built-in email/password
})
```

### 3. FastAPI Authentication Wrapper (`src/lib/fastapi-auth.ts`)

This is the core - it handles all FastAPI communication:

```typescript
import { env } from "@/env"

interface APITokens {
  access_token: string
  token_type: string
}

interface APIUser {
  id: number
  name: string
  username: string
  email: string
  profile_image_url: string
  tier_id: number | null
}

// Login to FastAPI and get tokens
export async function loginToFastAPI(
  username: string,
  password: string
): Promise<{ user: APIUser; accessToken: string } | null> {
  try {
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/login`, {
      method: "POST",
      body: formData,
      credentials: "include", // Include cookies for refresh_token
    })

    if (!response.ok) return null

    const tokens: APITokens = await response.json()

    // Get user info with the access token
    const user = await getUserFromFastAPI(tokens.access_token)
    if (!user) return null

    return {
      user,
      accessToken: tokens.access_token,
    }
  } catch (error) {
    console.error("FastAPI login error:", error)
    return null
  }
}

// Register new user
export async function registerToFastAPI(data: {
  name: string
  username: string
  email: string
  password: string
}): Promise<APIUser | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("FastAPI registration error:", error)
    return null
  }
}

// Get current user with access token
export async function getUserFromFastAPI(
  accessToken: string
): Promise<APIUser | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/user/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("FastAPI get user error:", error)
    return null
  }
}

// Refresh access token
export async function refreshTokenFromFastAPI(): Promise<string | null> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/refresh`, {
      method: "POST",
      credentials: "include", // Send refresh_token cookie
    })

    if (!response.ok) return null

    const tokens: APITokens = await response.json()
    return tokens.access_token
  } catch (error) {
    console.error("Token refresh error:", error)
    return null
  }
}

// Logout
export async function logoutFromFastAPI(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include", // Send refresh_token cookie
    })

    return response.ok
  } catch (error) {
    console.error("FastAPI logout error:", error)
    return false
  }
}
```

### 4. Better Auth API Route (`app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

### 5. Auth Client (`src/lib/auth-client.ts`)

```typescript
"use client"

import { createAuthClient } from "better-auth/react"
import { env } from "@/env"

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SITE_URL,
})

// Custom hooks for FastAPI auth
export { useSession } from "better-auth/react"
```

### 6. Server Actions for Auth (`src/actions/auth.ts`)

```typescript
"use server"

import { loginToFastAPI, registerToFastAPI, logoutFromFastAPI } from "@/lib/fastapi-auth"
import { cookies } from "next/headers"

export async function loginAction(username: string, password: string) {
  const result = await loginToFastAPI(username, password)
  
  if (!result) {
    return { success: false, error: "Invalid credentials" }
  }

  // Store access token in httpOnly cookie
  const cookieStore = await cookies()
  cookieStore.set("access_token", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 30, // 30 minutes
  })

  return {
    success: true,
    user: result.user,
  }
}

export async function registerAction(data: {
  name: string
  username: string
  email: string
  password: string
}) {
  const user = await registerToFastAPI(data)
  
  if (!user) {
    return { success: false, error: "Registration failed" }
  }

  return { success: true, user }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value

  if (accessToken) {
    await logoutFromFastAPI(accessToken)
  }

  cookieStore.delete("access_token")
  return { success: true }
}
```

### 7. API Helper with Auto Token Injection (`src/lib/api-with-auth.ts`)

```typescript
import { cookies } from "next/headers"
import { get, post, put, del } from "@/lib/api"
import { refreshTokenFromFastAPI } from "@/lib/fastapi-auth"

// Helper to get access token and auto-refresh if needed
async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get("access_token")?.value

  if (!accessToken) {
    // Try to refresh
    const newToken = await refreshTokenFromFastAPI()
    if (newToken) {
      cookieStore.set("access_token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 30,
      })
      return newToken
    }
    return null
  }

  return accessToken
}

// Wrapper functions with auth
export async function getWithAuth<T>(url: string, config?: any): Promise<T> {
  const token = await getAccessToken()
  if (!token) throw new Error("Not authenticated")

  return get<T>(url, {
    ...config,
    headers: {
      ...config?.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function postWithAuth<T, B = unknown>(
  url: string,
  body?: B,
  config?: any
): Promise<T> {
  const token = await getAccessToken()
  if (!token) throw new Error("Not authenticated")

  return post<T, B>(url, body, {
    ...config,
    headers: {
      ...config?.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

// Similar for putWithAuth, delWithAuth...
```

### 8. Middleware for Route Protection (`proxy.ts`)

```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
```

## Environment Variables

```env
# FastAPI Backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth (for cookie signing)
AUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Token Management Strategy

### Access Token
- **Stored**: HttpOnly cookie (`access_token`)
- **Lifetime**: 30 minutes
- **Usage**: Attached to every FastAPI request

### Refresh Token
- **Stored**: FastAPI sets it as HttpOnly cookie (`refresh_token`)
- **Lifetime**: 7 days
- **Usage**: Automatically sent to `/api/v1/refresh` when access token expires

### Auto-Refresh Flow

```typescript
// In API helper
if (response.status === 401) {
  // Token expired, try refresh
  const newToken = await refreshTokenFromFastAPI()
  if (newToken) {
    // Retry request with new token
    return retryWithToken(newToken)
  }
  // Refresh failed, redirect to login
  redirect("/login")
}
```

## What We DON'T Need

- ❌ **Prisma** - No database on UI side
- ❌ **Database Adapters** - Stateless JWT only
- ❌ **User Tables** - FastAPI is source of truth
- ❌ **Session Tables** - JWT in cookies is the session
- ❌ **Migration Scripts** - No schema to manage

## What We DO Need

- ✅ **Better Auth** - For auth utilities and helpers
- ✅ **Cookies** - To store JWT tokens securely
- ✅ **Server Actions** - For login/logout logic
- ✅ **Middleware** - For route protection

## Advantages

1. **Simple**: No database setup on frontend
2. **Stateless**: JWT tokens contain all session info
3. **Scalable**: Works perfectly with serverless/edge
4. **Single Source of Truth**: FastAPI manages users
5. **Secure**: HttpOnly cookies, CSRF protection
6. **Fast**: No database queries on frontend

## Next Steps

1. Install Better Auth: `yarn add better-auth`
2. Create `src/lib/fastapi-auth.ts` with API wrappers
3. Create `src/actions/auth.ts` with server actions
4. Build login/register forms
5. Add middleware for route protection
6. Test token refresh flow
7. Handle error states (401, expired tokens)

Ready to start implementation?
