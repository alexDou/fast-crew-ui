# Authentication Architecture

## Current State

The UI does not use Better Auth or a separate frontend auth database.

Authentication is split between the Next.js app and the FastAPI backend:

- FastAPI owns user identity, password verification, JWT issuance, refresh-token cookies, logout blacklisting, and email verification.
- Next.js owns server actions, route protection, and an app-side `access_token` cookie used when rendering protected pages.

## Main Files

### UI

- `src/server/api/auth.ts`
- `src/server/actions/auth.ts`
- `src/constants/api.ts`
- `src/components/signin-form/SigninForm.tsx`
- `src/components/register-form/RegisterForm.tsx`

### Backend

- `../fast-api/src/app/api/v1/login.py`
- `../fast-api/src/app/api/v1/logout.py`
- `../fast-api/src/app/api/v1/users.py`
- `../fast-api/src/app/core/security.py`

## Token Model

- Access token: returned by FastAPI in the login or refresh response body.
- Refresh token: set by FastAPI as an `httpOnly` cookie named `refresh_token`.
- UI session cookie: Next.js stores the access token in its own `httpOnly` cookie named `access_token`.

This means the browser can hold two auth cookies at the same time:

- `refresh_token` from FastAPI
- `access_token` from Next.js

## Sign-In Flow

1. The user submits the sign-in form in the UI.
2. `loginAction()` in `src/server/actions/auth.ts` calls `loginToAPI()` from `src/server/api/auth.ts`.
3. The UI posts credentials to `POST /api/v1/login` on FastAPI.
4. FastAPI validates the user, rejects unverified emails, returns an access token, and sets the `refresh_token` cookie.
5. The Next.js server action stores the returned access token in its own `access_token` cookie.
6. The client navigates to the authenticated area.

## Sign-Up And Verification

1. The UI validates reCAPTCHA in `registerAction()`.
2. The UI posts registration data to `POST /api/v1/user`.
3. FastAPI creates the user with `is_email_verified = false`.
4. FastAPI generates an email-verification token and sends the verification email.
5. The verification link hits `GET /api/v1/verify-email?token=...`.
6. FastAPI marks the user as verified and redirects back to `/signin`.

## Refresh Flow

1. The browser sends the FastAPI-managed `refresh_token` cookie.
2. The UI calls `POST /api/v1/refresh` through `refreshTokenFromAPI()`.
3. FastAPI validates the refresh token and returns a new access token.
4. The Next.js server layer can replace the `access_token` cookie with the new value.

## Logout Flow

1. `logoutAction()` reads the UI-managed `access_token` cookie.
2. The UI calls `POST /api/v1/logout` with the bearer token and the refresh cookie.
3. FastAPI blacklists both tokens and deletes the refresh cookie.
4. Next.js deletes its own `access_token` cookie.
5. The user is redirected to the public landing page.

## Route Protection

Protected pages call `getCurrentUser()` from `src/server/actions/auth.ts`.

- If the `access_token` cookie is missing, the user is redirected to sign-in.
- If `GET /api/v1/user/me` returns `401`, the user is redirected to sign-in.
- If the request succeeds, the page continues rendering with the current user data.

## API Base URL Convention

`NEXT_PUBLIC_API_URL` should be the backend origin, not an already-versioned API path.

Correct:

```env
NEXT_PUBLIC_API_URL="https://aisee.art"
```

The UI code already appends versioned endpoints like `/api/v1/login` and `/api/v1/user/me`.

## Important Constraints

- Do not add Better Auth-specific flows unless the app is intentionally migrated.
- Do not assume the frontend owns refresh-token rotation; FastAPI owns it.
- Any auth change must preserve the split-cookie model unless the whole auth design is being replaced.
