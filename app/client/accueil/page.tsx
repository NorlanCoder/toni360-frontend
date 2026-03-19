"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
    <section className="mx-auto w-full max-w-6xl px-3 py-2 sm:px-6 sm:py-4 lg:px-8">
      {/* Welcome */}
      <h1 className="mb-4 break-words text-xl font-bold leading-tight text-gray-900 sm:mb-6 sm:text-3xl lg:text-4xl">
        Bienvenue, {displayName}
      </h1>

      {/* Hero card */}
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-sm sm:rounded-3xl">
        <div className="relative aspect-[3/4] w-full sm:aspect-[16/10] lg:aspect-[16/9]">
          <Image
            src="/images/ph7.png"
            alt="Pharmacie"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 960px"
            className="object-cover"
          />
        </div>
        {/* Green gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,128,80,0.85) 0%, rgba(0,128,80,0.2) 50%, transparent 100%)",
          }}
        />
        {/* Text on image */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 md:p-8 lg:p-10">
          <p className="max-w-[20ch] text-base font-bold leading-snug text-white sm:max-w-3xl sm:text-2xl md:text-3xl">
            Trouvez facilement votre médicament.
          </p>
        </div>
      </div>
    </section>
  );
}
