export const API_ENDPOINTS = {
  LOGIN: "/api/v1/login",
  LOGOUT: "/api/v1/logout",
  REFRESH: "/api/v1/refresh",
  USER: "/api/v1/user",
  USER_ME: "/api/v1/user/me",
  POEM_SOURCE: "/api/v1/poem-source",
  POEM_SOURCES: "/api/v1/poem-sources",
  poems: (sourceId: number | string) => `/api/v1/poems/${sourceId}`,
  poemSourceStatus: (sourceId: number | string) => `/api/v1/poem-source/${sourceId}/ready`
} as const;

export const BFF_ENDPOINTS = {
  tunerStatus: (sourceId: number) => `/api/tuner/status/${sourceId}`,
  tunerPoems: (sourceId: number) => `/api/tuner/poems/${sourceId}`
} as const;

export const API_TIMEOUT = 10_000;

export const ERROR_MESSAGES = {
  UNKNOWN: "Unknown error",
  UPLOAD_FAILED: "Upload failed",
  UPLOAD_ERROR: "An error occurred during upload",
  FETCH_STATUS_FAILED: "Failed to fetch status",
  FETCH_POEMS_FAILED: "Failed to fetch poems",
  INVALID_CREDENTIALS: "Invalid username or password",
  LOGIN_ERROR: "An error occurred during login",
  REGISTRATION_FAILED: "Registration failed",
  REGISTRATION_ERROR: "An error occurred during registration",
  CHECK_STATUS_FAILED: "Failed to check status",
  INTERNAL_SERVER_ERROR: "Internal server error"
} as const;
