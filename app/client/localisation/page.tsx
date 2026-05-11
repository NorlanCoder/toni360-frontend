"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, Search } from "lucide-react";
import { getHistoriqueLocalisations, LocalisationSummary } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

export default function LocalisationListPage() {
  const router = useRouter();
  const [recherches, setRecherches] = useState<LocalisationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = useMemo(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") return null;
    return session.token;
  }, []);

  useEffect(() => {
    if (!token) {
      clearAuthSession();
      router.replace("/client/connexion");
      return;
    }
    const load = async () => {
      try {
        const res = await getHistoriqueLocalisations(token);
        setRecherches(res.data?.data ?? []);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearAuthSession();
          router.replace("/client/connexion");
        }
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [token, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#00955F] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Chargement des localisations…</p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-3 pb-6 sm:px-6 sm:pb-8">
      <h1 className="mb-5 text-xl font-bold text-gray-900 sm:text-2xl">Mes localisations</h1>

      {recherches.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Search size={28} className="text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-700">Aucune localisation pour l&apos;instant</p>
          <p className="text-sm text-gray-400 max-w-xs">
            Rendez-vous dans votre panier et cliquez sur &quot;Localiser&quot; pour trouver des pharmacies proches.
          </p>
          <button
            type="button"
            onClick={() => router.push("/client/dashboard/cart")}
            className="mt-2 rounded-full bg-[#00955F] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#007a4e] transition"
          >
            Aller au panier
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recherches.map((r) => {
            const nomsReels = Array.from(
              new Set((r.resultats ?? []).map((res) => res.produit?.nom).filter(Boolean) as string[])
            );
            const MAX_VISIBLE = 3;
            const visibles = nomsReels.slice(0, MAX_VISIBLE).join(", ");
            const reste = nomsReels.length - MAX_VISIBLE;
            const nomsProduits = nomsReels.length === 0
              ? "Aucun produit trouvé"
              : reste > 0 ? `${visibles} +${reste} autre${reste > 1 ? "s" : ""}` : visibles;
            const nbPharmacies = Array.from(new Set(r.resultats?.map((res) => res.pharmacie_id) ?? [])).length;
            const date = new Date(r.created_at ?? r.date);
            const dateLabel = date.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
            const heureLabel = date.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => router.push(`/client/localisation/${r.id}`)}
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left hover:border-[#00955F]/40 hover:shadow-sm transition"
              >
                {/* Icône */}
                <div className="shrink-0 w-11 h-11 rounded-full bg-[#E8F7F1] flex items-center justify-center">
                  <MapPin size={20} className="text-[#00955F]" />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {nomsProduits || "Recherche sans nom"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {dateLabel} à {heureLabel}
                    </span>
                    {nbPharmacies > 0 && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-500">
                          {nbPharmacies} pharmacie{nbPharmacies > 1 ? "s" : ""} trouvée{nbPharmacies > 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                    <span className="text-gray-300">·</span>
                    {/* <span className={`text-xs font-medium ${r.statut === "en_cours" ? "text-[#00955F]" : "text-gray-400"}`}>
                      {r.statut === "en_cours" ? "Résultats disponibles" : r.statut}
                    </span> */}
                  </div>
                </div>

                <ChevronRight size={18} className="shrink-0 text-gray-300" />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
