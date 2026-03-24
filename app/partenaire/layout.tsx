"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";
import { canAccessPartnerRoute } from "@/lib/auth/authorization";
import { toast } from "sonner";
import { SidebarProvider } from "./_sidebar-context";
import PartenaireSidebar from "@/components/partenaire/Sidebar";

export default function PartenaireLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPartenairePage =
    pathname === "/partenaire" ||
    pathname.startsWith("/partenaire/connexion") ||
    pathname.startsWith("/partenaire/inscription") ||
    pathname.startsWith("/partenaire/deconnexion");

  useEffect(() => {
    if (isPublicPartenairePage) {
      return;
    }

    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      clearAuthSession();
      router.replace("/partenaire/connexion");
      return;
    }

    if (!canAccessPartnerRoute(session, pathname)) {
      toast.error("Acces refuse: vous n'avez pas la permission requise.");
      router.replace("/partenaire/dashboard");
    }
  }, [isPublicPartenairePage, pathname, router]);

  if (isPublicPartenairePage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-white overflow-hidden">
        <PartenaireSidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
