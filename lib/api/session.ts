const AUTH_SESSION_KEY = "toni360.auth.session";

export type AuthUserType = "patient" | "user";

export interface AuthSession {
  userType: AuthUserType;
  token: string;
  tokenType: string;
  profile: unknown;
  permissions?: string[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveAuthSession(session: AuthSession): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      (parsed.userType !== "patient" && parsed.userType !== "user") ||
      typeof parsed.token !== "string" ||
      parsed.token.trim() === "" ||
      typeof parsed.tokenType !== "string" ||
      parsed.tokenType.trim() === ""
    ) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }

    return parsed as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function clearAuthSession(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function redirectToLoginBySession(session: AuthSession | null): void {
  if (!isBrowser()) {
    return;
  }

  if (session?.userType === "user") {
    window.location.replace("/partenaire/connexion");
    return;
  }

  window.location.replace("/client/connexion");
}
