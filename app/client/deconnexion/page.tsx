"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutPatient } from "@/lib/api/auth";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

export default function ClientLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      const session = getAuthSession();

      try {
        if (session?.userType === "patient" && session.token) {
          await logoutPatient(session.token);
        }
      } catch {
        // Continue local logout even if API logout fails.
      } finally {
        clearAuthSession();
        router.replace("/client/connexion");
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
