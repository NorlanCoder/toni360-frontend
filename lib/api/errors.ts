export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function extractApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const maybePayload = payload as {
    message?: unknown;
    errors?: Record<string, unknown>;
  };

  if (typeof maybePayload.message === "string" && maybePayload.message.trim()) {
    return maybePayload.message;
  }

  if (maybePayload.errors && typeof maybePayload.errors === "object") {
    const firstError = Object.values(maybePayload.errors)[0];
    if (Array.isArray(firstError) && typeof firstError[0] === "string") {
      return firstError[0];
    }
    if (typeof firstError === "string") {
      return firstError;
    }
  }

  return fallback;
}
