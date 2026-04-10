import { API_BASE_URL } from "./config";
import { ApiError, extractApiErrorMessage } from "./errors";
import { clearAuthSession, getAuthSession, redirectToLoginBySession } from "./session";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: BodyInit | null;
  token?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15000;

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body = null, token, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("La requete a expire. Veuillez reessayer.", 0);
    }

    throw new ApiError("Erreur reseau. Verifiez votre connexion puis reessayez.", 0);
  }

  clearTimeout(timeoutId);

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // const session = getAuthSession();
      // clearAuthSession();
      // redirectToLoginBySession(session);
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
