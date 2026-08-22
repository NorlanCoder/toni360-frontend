import type { AuthSession } from "@/lib/api/session";

type PermissionAction = "create" | "read" | "update" | "delete";

const ROLE_HOME_ROUTES: Record<string, string> = {};

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

  // Le tableau de bord est toujours accessible (chaque cartouche gere sa propre
  // restriction), donc il reste la destination par defaut apres connexion.
  if (!shouldRedirectAwayFromDashboard(session)) {
    return "/partenaire/dashboard";
  }

  const fallbacks: Array<{ path: string; module: string; action: PermissionAction }> = [
    { path: "/partenaire/commandes", module: "gestion_commandes", action: "read" },
    { path: "/partenaire/medicaments", module: "gestion_produits", action: "read" },
    { path: "/partenaire/stocks", module: "gestion_stocks", action: "read" },
    { path: "/partenaire/employes", module: "gestion_users", action: "read" },
    { path: "/partenaire/employes/historique", module: "gestion_historique", action: "read" },
  ];

  for (const candidate of fallbacks) {
    if (hasEffectivePermission(session, candidate.module, candidate.action)) {
      return candidate.path;
    }
  }

  if (canAccessNotifications(session)) {
    return "/partenaire/notifications";
  }

  return "/partenaire/deconnexion";
}

/**
 * Retourne true si ce rôle n'a pas accès au dashboard
 * et doit être redirigé vers sa page principale.
 */
export function shouldRedirectAwayFromDashboard(session: AuthSession | null): boolean {
  const roleCode = getSessionRoleCode(session);
  return Boolean(roleCode && ROLE_HOME_ROUTES[roleCode]);
}

function canAccessNotifications(session: AuthSession | null): boolean {
  return hasPermission(session, "gestion_notifications", "read");
}

// Le tableau de bord n'a pas d'entree ici : il reste toujours accessible,
// c'est chaque cartouche qui applique sa propre restriction (voir dashboard/page.tsx).
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

/**
 * Modules dont l'acces depend aussi de "Tableau de bord" (consultation_statistiques) :
 * leurs cartouches/pages s'appuient sur les compteurs du tableau de bord, donc si le
 * Pharmacien titulaire desactive "Tableau de bord" pour un role, ces modules doivent
 * redevenir inaccessibles meme si leur propre permission reste active.
 */
const DASHBOARD_DEPENDENT_MODULES = ["gestion_commandes", "gestion_stocks"];

/**
 * Comme hasPermission, mais applique en plus la dependance ci-dessus pour
 * gestion_commandes/gestion_stocks. A utiliser pour toute navigation/route liee
 * a ces deux modules (sidebar, cartouches dashboard, garde de route).
 */
export function hasEffectivePermission(
  session: AuthSession | null,
  moduleName: string,
  action: PermissionAction,
): boolean {
  if (!hasPermission(session, moduleName, action)) {
    return false;
  }

  if (DASHBOARD_DEPENDENT_MODULES.includes(moduleName.toLowerCase())) {
    return hasPermission(session, "consultation_statistiques", "read");
  }

  return true;
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
    pathname.startsWith("/partenaire/cgu")
  ) {
    return true;
  }

  const match = PARTNER_ROUTE_REQUIREMENTS.find((item) => pathname.startsWith(item.prefix));
  if (pathname.startsWith("/partenaire/notifications")) {
    return canAccessNotifications(session);
  }

  if (!match) {
    return true;
  }

  const [moduleName, action] = match.permission.split(":") as [string, PermissionAction];
  return hasEffectivePermission(session, moduleName, action);
}

export function filterPartnerNavigationByPermissions<T extends { href: string }>(
  session: AuthSession | null,
  items: T[],
): T[] {
  return items.filter((item) => {
    // Le tableau de bord reste toujours affiche dans la sidebar : desactiver
    // "Tableau de bord" ne fait plus disparaitre la page, seulement ses
    // cartouches dependantes (voir hasEffectivePermission).
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
      return hasEffectivePermission(session, "gestion_stocks", "read");
    }

    if (item.href.startsWith("/partenaire/commandes")) {
      return hasEffectivePermission(session, "gestion_commandes", "read");
    }

    if (item.href.startsWith("/partenaire/notifications")) {
      return canAccessNotifications(session);
    }

    return true;
  });
}
