import type { AuthSession } from "@/lib/api/session";

type PermissionAction = "create" | "read" | "update" | "delete";

/** Rôles dont le dashboard leur est masqué — redirigés vers leur page principale. */
const ROLE_HOME_ROUTES: Record<string, string> = {
  RESPONSABLE_STOCKS:    "/partenaire/medicaments",
  RESPONSABLE_COMMANDES: "/partenaire/commandes",
};

function getSessionRoleCode(session: AuthSession | null): string | null {
  if (!session?.profile) return null;
  const profile = session.profile as { role?: { code?: string } | null };
  return profile?.role?.code ?? null;
}

/**
 * Retourne la page d'accueil après connexion selon le rôle.
 * Par défaut : /partenaire/dashboard
 */
export function getPartnerHomeRoute(session: AuthSession | null): string {
  const roleCode = getSessionRoleCode(session);
  if (roleCode && ROLE_HOME_ROUTES[roleCode]) {
    return ROLE_HOME_ROUTES[roleCode];
  }
  return "/partenaire/dashboard";
}

/**
 * Retourne true si ce rôle n'a pas accès au dashboard
 * et doit être redirigé vers sa page principale.
 */
export function shouldRedirectAwayFromDashboard(session: AuthSession | null): boolean {
  const roleCode = getSessionRoleCode(session);
  return Boolean(roleCode && ROLE_HOME_ROUTES[roleCode]);
}

const PARTNER_ROUTE_REQUIREMENTS: Array<{ prefix: string; permission: string }> = [
  { prefix: "/partenaire/employes/historique", permission: "gestion_historique:read" },
  { prefix: "/partenaire/employes/ajouter", permission: "gestion_users:create" },
  { prefix: "/partenaire/employes", permission: "gestion_users:read" },
  { prefix: "/partenaire/medicaments/incoherences", permission: "gestion_produits:read" },
  { prefix: "/partenaire/medicaments/ajouter", permission: "gestion_produits:create" },
  { prefix: "/partenaire/medicaments", permission: "gestion_produits:read" },
  { prefix: "/partenaire/stocks", permission: "gestion_stocks:read" },
  { prefix: "/partenaire/commandes", permission: "gestion_commandes:read" },
];

function getPermissions(session: AuthSession | null): string[] {
  if (!session?.permissions || !Array.isArray(session.permissions)) {
    return [];
  }

  return session.permissions;
}

export function hasPermission(
  session: AuthSession | null,
  moduleName: string,
  action: PermissionAction,
): boolean {
  const permissions = getPermissions(session);
  if (permissions.includes("*")) {
    return true;
  }

  return permissions.includes(`${moduleName.toLowerCase()}:${action}`);
}

export function canAccessPartnerRoute(session: AuthSession | null, pathname: string): boolean {
  if (!session || session.userType !== "user") {
    return false;
  }

  if (
    pathname === "/partenaire" ||
    pathname.startsWith("/partenaire/connexion") ||
    pathname.startsWith("/partenaire/inscription") ||
    pathname.startsWith("/partenaire/deconnexion") ||
    pathname.startsWith("/partenaire/dashboard")
  ) {
    return true;
  }

  const match = PARTNER_ROUTE_REQUIREMENTS.find((item) => pathname.startsWith(item.prefix));
  if (!match) {
    return true;
  }

  const [moduleName, action] = match.permission.split(":") as [string, PermissionAction];
  return hasPermission(session, moduleName, action);
}

export function filterPartnerNavigationByPermissions<T extends { href: string }>(
  session: AuthSession | null,
  items: T[],
): T[] {
  return items.filter((item) => {
    if (item.href.startsWith("/partenaire/dashboard")) {
      return !shouldRedirectAwayFromDashboard(session);
    }

    if (item.href === "/partenaire/employes/historique") {
      return hasPermission(session, "gestion_historique", "read");
    }

    if (item.href.startsWith("/partenaire/employes")) {
      return hasPermission(session, "gestion_users", "read");
    }

    if (item.href.startsWith("/partenaire/medicaments")) {
      return hasPermission(session, "gestion_produits", "read");
    }

    if (item.href.startsWith("/partenaire/stocks")) {
      return hasPermission(session, "gestion_stocks", "read");
    }

    if (item.href.startsWith("/partenaire/commandes")) {
      return hasPermission(session, "gestion_commandes", "read");
    }

    return true;
  });
}
