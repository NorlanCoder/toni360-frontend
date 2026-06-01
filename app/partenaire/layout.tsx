"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";
import { canAccessPartnerRoute, getPartnerHomeRoute, shouldRedirectAwayFromDashboard } from "@/lib/auth/authorization";
import { toast } from "sonner";
import { SidebarProvider } from "./_sidebar-context";
import { HeaderSearchProvider } from "./_header-search-context";
import PartenaireSidebar from "@/components/partenaire/Sidebar";
import PartenaireHeader from "@/components/partenaire/PartenaireHeader";
import { useIdleTimeout } from "@/lib/useIdleTimeout";

export default function PartenaireLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublicPartenairePage =
    pathname === "/partenaire" ||
    pathname.startsWith("/partenaire/connexion") ||
    pathname.startsWith("/partenaire/inscription") ||
    pathname.startsWith("/partenaire/deconnexion") ||
    pathname.startsWith("/partenaire/cgu") ||
    pathname.startsWith("/partenaire/privacy") ||
    pathname.startsWith("/partenaire/contacts") ||
    pathname.startsWith("/partenaire/faq") ||
    pathname.startsWith("/partenaire/about");

  if (isPublicPartenairePage) {
    return <>{children}</>;
  }

  return <PartenaireLayoutInner>{children}</PartenaireLayoutInner>;
}

function PartenaireLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      clearAuthSession();
      router.replace("/partenaire/connexion");
      return;
    }

    // Redirige les rôles sans dashboard vers leur page principale
    if (pathname.startsWith("/partenaire/dashboard") && shouldRedirectAwayFromDashboard(session)) {
      router.replace(getPartnerHomeRoute(session));
      return;
    }

    if (!canAccessPartnerRoute(session, pathname)) {
      toast.error(`Accès refusé (${pathname}) : permission insuffisante.`);
      router.replace("/partenaire/dashboard");
    }
  }, [pathname, router]);

  // Déconnexion automatique après 15 minutes d'inactivité
  useIdleTimeout(() => {
    clearAuthSession();
    toast.warning("Session expirée. Veuillez vous reconnecter.");
    router.replace("/partenaire/connexion");
  });

  return (
    <SidebarProvider>
      <HeaderSearchProvider>
        <div className="flex h-screen bg-white overflow-hidden">
          <PartenaireSidebar />
          <div className="flex flex-1 flex-col min-w-0 bg-[#F8FFFC]">
            <div className="sticky top-0 z-10">
              <PartenaireHeader />
            </div>
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </HeaderSearchProvider>
    </SidebarProvider>
  );
}
