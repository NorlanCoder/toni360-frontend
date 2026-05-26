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

/**
 * Sauvegarde la session d'authentification.
 * - rememberMe = true  → localStorage  (persiste après fermeture du navigateur)
 * - rememberMe = false → sessionStorage (effacé à la fermeture de l'onglet)
 */
export function saveAuthSession(session: AuthSession, rememberMe = false): void {
  if (!isBrowser()) {
    return;
  }

  const storage = rememberMe ? localStorage : sessionStorage;
  // Nettoyer l'autre stockage pour éviter les doublons
  const otherStorage = rememberMe ? sessionStorage : localStorage;
  otherStorage.removeItem(AUTH_SESSION_KEY);

  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  // Vérifier localStorage en priorité (remember me activé), puis sessionStorage
  const raw = localStorage.getItem(AUTH_SESSION_KEY) ?? sessionStorage.getItem(AUTH_SESSION_KEY);
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
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }

    return parsed as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function clearAuthSession(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
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
