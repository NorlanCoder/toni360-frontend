"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPatientProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

export default function AccueilClientPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Mr Vagelas");

  useEffect(() => {
    const syncProfile = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "patient" || !session.token) {
        clearAuthSession();
        router.replace("/client/connexion");
        return;
      }

      try {
        const response = await getPatientProfile(session.token);
        const patient = response.data.patient;
        const name = patient.nom_complet || `${patient.prenom ?? ""} ${patient.nom ?? ""}`.trim();
        if (name) {
          setDisplayName(name);
        }
      } catch (error: unknown) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearAuthSession();
          router.replace("/client/connexion");
        }
      }
    };

    void syncProfile();
  }, [router]);

  return (
    <>
      {/* Welcome */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Bienvenue, {displayName}
      </h1>

      {/* Hero card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ maxWidth: "750px", height: "420px" }}
      >
        <img
          src="/images/ph7.png"
          alt="Pharmacie"
          className="w-full h-full object-cover"
        />
        {/* Green gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,128,80,0.85) 0%, rgba(0,128,80,0.2) 50%, transparent 100%)",
          }}
        />
        {/* Text on image */}
        <div className="absolute bottom-8 left-8 right-8">
          <p className="text-white text-2xl font-bold leading-snug">
            Trouvez facilement votre médicament.
          </p>
        </div>
      </div>
    </>
  );
}
