export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export const FRONTEND_APP_ENV =
  process.env.NEXT_PUBLIC_APP_ENV ?? "local";

export const FRONTEND_ENABLE_MOCKS =
  process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true";

export const FRONTEND_ENABLE_DEBUG =
  process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true";
