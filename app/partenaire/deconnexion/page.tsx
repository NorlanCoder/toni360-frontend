"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutPartner } from "@/lib/api/auth";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

export default function PartenaireLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      const session = getAuthSession();

      try {
        if (session?.userType === "user" && session.token) {
          await logoutPartner(session.token);
        }
      } catch {
        // Continue local logout even if API logout fails.
      } finally {
        clearAuthSession();
        router.replace("/partenaire/connexion");
      }
    };

    void logout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-700">
      Déconnexion en cours...
    </div>
  );
}
