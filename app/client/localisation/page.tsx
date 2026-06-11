"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getHistoriqueLocalisations,
  deleteLocalisation,
  deleteAllLocalisations,
  LocalisationSummary,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

export default function LocalisationListPage() {
  const router = useRouter();
  const [recherches, setRecherches] = useState<LocalisationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (!token || deletingId) return;
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await deleteLocalisation(token, id);
      setRecherches((prev) => prev.filter((r) => r.id !== id));
      toast.success("Localisation supprimée.");
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!token || deletingAll) return;
    setConfirmDeleteAll(false);
    setDeletingAll(true);
    try {
      await deleteAllLocalisations(token);
      setRecherches([]);
      toast.success("Toutes les localisations ont été supprimées.");
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
    } finally {
      setDeletingAll(false);
    }
  };

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
      {/* En-tête */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Mes localisations</h1>
        {recherches.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmDeleteAll(true)}
            disabled={deletingAll}
            className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition disabled:opacity-50"
          >
            <Trash2 size={13} />
            Tout supprimer
          </button>
        )}
      </div>

      {/* Message de rétention discret */}
      <p className="mb-5 text-[11px] text-gray-400 leading-relaxed">
        Les localisations enregistrées sont automatiquement supprimées après 12 mois.
      </p>

      {recherches.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Search size={28} className="text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-700">Aucune localisation pour l&apos;instant</p>
         
         
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
              <div key={r.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/client/localisation/${r.id}`)}
                  className="flex flex-1 items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left hover:border-[#00955F]/40 hover:shadow-sm transition"
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
                    </div>
                  </div>

                  <ChevronRight size={18} className="shrink-0 text-gray-300" />
                </button>

                {/* Bouton suppression individuelle */}
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(r.id)}
                  disabled={deletingId === r.id}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                  aria-label="Supprimer cette localisation"
                >
                  {deletingId === r.id
                    ? <span className="w-4 h-4 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                    : <Trash2 size={15} />
                  }
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal confirmation suppression individuelle */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold text-gray-900 mb-2">Supprimer cette localisation ?</p>
            <p className="text-sm text-gray-400 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(confirmDeleteId)}
                className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation tout supprimer */}
      {confirmDeleteAll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConfirmDeleteAll(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold text-gray-900 mb-2">Supprimer toutes les localisations ?</p>
            <p className="text-sm text-gray-400 mb-5">
              Les {recherches.length} localisation{recherches.length > 1 ? "s" : ""} seront définitivement supprimée{recherches.length > 1 ? "s" : ""}.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteAll(false)}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteAll()}
                disabled={deletingAll}
                className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-60"
              >
                {deletingAll ? "Suppression…" : "Tout supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
