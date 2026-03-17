import { API_BASE_URL } from "./config";
import { ApiError, extractApiErrorMessage } from "./errors";
import { clearAuthSession, getAuthSession, redirectToLoginBySession } from "./session";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: BodyInit | null;
  token?: string;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body = null, token, headers = {} } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const session = getAuthSession();
      clearAuthSession();
      redirectToLoginBySession(session);
    }

    const message = extractApiErrorMessage(payload, "Une erreur est survenue.");
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export function buildJsonRequest(body: unknown): { body: string; headers: Record<string, string> } {
  return {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };
}
