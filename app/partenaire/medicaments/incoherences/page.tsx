"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import {
  extractCollection,
  getPartnerIncoherences,
  fusionnerPartnerIncoherence,
  proposerPartnerIncoherence,
  type PartnerIncoherence,
  type ProduitSuggestion,
} from "@/lib/api/partner";
import { formatNumberFr } from "@/lib/formatNumber";
import { toast } from "sonner";
import { X } from "lucide-react";

/* ──────────────────── Helpers ─────────────────────── */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function scorePercent(score: number): string {
  return `${Math.round(score)}%`;
}

/* ═══════════════════════ PAGE ═══════════════════════ */
export default function PartenaireIncoherencesPage() {
  const router = useRouter();
  const [incoherences, setIncoherences] = useState<PartnerIncoherence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* Detail modal (ouvert directement depuis la liste) */
  const [selected, setSelected] = useState<PartnerIncoherence | null>(null);
  const [fusingId, setFusingId] = useState<string | null>(null);
  const [isProposing, setIsProposing] = useState(false);

  /* ── Load list ── */
  const loadData = useCallback(async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      toast.error("Session partenaire invalide.");
      setIsLoading(false);
      return;
    }
    try {
      const res = await getPartnerIncoherences(session.token, { per_page: 100 });
      setIncoherences(extractCollection(res.data).filter((inc) => inc.statut !== "FUSIONNE"));
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Impossible de charger les incohérences.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    void loadData();
  }, [loadData]);

  /* ── Fusionner ── */
  const handleFusionner = async (incoherenceId: string, produitId: string) => {
    const session = getAuthSession();
    if (!session?.token) return;

    setFusingId(produitId);
    try {
      await fusionnerPartnerIncoherence(session.token, incoherenceId, produitId);
      toast.success("Incohérence fusionnée avec succès !");
      const remainingIncoherences = incoherences.filter((inc) => inc.id !== incoherenceId);
      setIncoherences(remainingIncoherences);
      setSelected(null);

      if (remainingIncoherences.length === 0) {
        router.push("/partenaire/medicaments");
      }
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la fusion.");
    } finally {
      setFusingId(null);
    }
  };

  const handleProposer = async (incoherenceId: string) => {
    const session = getAuthSession();
    if (!session?.token || !selected) return;

    setIsProposing(true);
    try {
      const res = await proposerPartnerIncoherence(session.token, incoherenceId);
      toast.success(res.message ?? "Proposition envoyée à l'administrateur.");

      const updated = res.data;
      if (updated) {
        setSelected(updated);
        setIncoherences((prev) => prev.map((inc) => (inc.id === updated.id ? updated : inc)));
      }
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la proposition.");
    } finally {
      setIsProposing(false);
    }
  };

  return (
    <>
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
        {/* Header */}
        <Link
          href="/partenaire/medicaments"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-toni-green-dark-2 hover:underline mb-6"
        >
          ← Retour aux médicaments
        </Link>
        <h1 className="mb-6 text-xl sm:text-2xl font-bold text-gray-900">
          Normalisation des médicaments
        </h1>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          {isLoading ? (
            <div className="px-6 py-8 text-sm text-gray-500">Chargement...</div>
          ) : incoherences.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              Aucune incohérence trouvée.
            </div>
          ) : (
            <table className="min-w-[640px] w-full table-auto text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 sm:px-6 py-4 text-left text-sm font-bold text-gray-800 w-2/5">
                    Médicament
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-sm font-bold text-gray-800 w-1/5">
                    % Similitude
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-sm font-bold text-gray-800">
                    Justification
                  </th>
                </tr>
              </thead>
              <tbody>
                {incoherences.map((inc) => {
                  const best = inc.suggestions?.[0] ?? null;
                  return (
                    <tr key={inc.id} className="border-b border-gray-200 last:border-b-0">
                      {/* Médicament */}
                      <td className="px-4 sm:px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {inc.nom_saisi}
                        </p>
                        {best && (
                          <>
                            <div className="my-1.5 border-t border-gray-200" />
                            <p className="text-sm text-gray-500">
                              {best.nom}{best.dosage ? ` ${best.dosage}` : ""}
                            </p>
                          </>
                        )}
                      </td>

                      {/* % Similitude */}
                      <td className="px-4 sm:px-6 py-4 font-medium text-gray-700">
                        {scorePercent(inc.meilleure_similitude)}
                      </td>

                      {/* Justification */}
                      <td className="px-4 sm:px-6 py-4">
                        <p className="mb-2 text-sm text-gray-500 line-clamp-2">
                          {best
                            ? `Correspondance avec « ${best.nom} » ${best.forme ? ` (${best.forme})` : ""}`
                            : "Aucun produit correspondant trouvé"}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelected(inc)}
                          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                        >
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ═══════════════ DETAIL MODAL ═══════════════ */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !fusingId && setSelected(null)}
          />

          <div className="relative z-10 mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {selected.nom_saisi}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  {selected.forme_saisie ?? "—"} · Qté : <span className="font-bold text-gray-700">{formatNumberFr(selected.quantite)}</span> · {formatDate(selected.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="ml-4 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {/* Statut + méta */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: `${selected.statut_color}20`,
                    color: selected.statut_color,
                  }}
                >
                  {selected.statut_label}
                </span>
                <span className="text-sm text-gray-500">
                  Similitude max :{" "}
                  <span className="font-medium text-gray-800">
                    {scorePercent(selected.meilleure_similitude)}
                  </span>
                </span>
                {selected.prix_unitaire != null && (
                  <span className="text-sm text-gray-500">
                    Prix :{" "}
                    <span className="font-bold text-gray-800">
                      {formatNumberFr(selected.prix_unitaire)} FCFA
                    </span>
                  </span>
                )}
              </div>

              {/* Produit fusionné */}
              {selected.produit_fusionne && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                  <span className="font-medium text-emerald-700">Fusionné avec :</span>{" "}
                  <span className="text-emerald-800">{selected.produit_fusionne.nom}</span>
                  {selected.produit_fusionne.code_produit && (
                    <span className="ml-2 text-xs text-emerald-600">
                      ({selected.produit_fusionne.code_produit})
                    </span>
                  )}
                </div>
              )}

              {/* Commentaire admin */}
              {selected.commentaire_admin && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  <span className="font-medium text-gray-500">Commentaire admin : </span>
                  {selected.commentaire_admin}
                </div>
              )}

              {/* Suggestions */}
              {selected.suggestions && selected.suggestions.length > 0 ? (
                <div>
                  <h3 className="mb-3 text-sm font-bold text-gray-700">
                    Choisir le produit avec lequel fusionner ({selected.suggestions.length}) :
                  </h3>
                  <div className="space-y-2">
                    {selected.suggestions.map((s: ProduitSuggestion, idx: number) => (
                      <div
                        key={s.produit_id ?? idx}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-800">{s.nom}</p>
                          <p className="text-xs text-gray-400">
                            {s.forme ?? "—"} · {s.dosage ?? "—"}
                          </p>
                        </div>
                        <div className="ml-3 flex shrink-0 items-center gap-3">
                          <span className="text-sm font-semibold text-gray-600">
                            {scorePercent(s.score)}
                          </span>
                          {selected.statut === "EN_ATTENTE" && s.produit_id && (
                            <button
                              type="button"
                              disabled={fusingId !== null || isProposing}
                              onClick={() => handleFusionner(selected.id, s.produit_id!)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {fusingId === s.produit_id ? "..." : "Fusionner"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucune suggestion disponible.</p>
              )}

              {selected.statut === "EN_ATTENTE" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-medium text-blue-700">Validation admin :</span>{" "}
                      <span className="text-blue-800">
                        proposer le médicament saisi « {selected.nom_saisi} »
                      </span>
                      {selected.propose_at && (
                        <span className="ml-2 text-xs text-blue-600">
                          (proposé le {formatDate(selected.propose_at)})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={isProposing || !!selected.propose_at || fusingId !== null}
                      onClick={() => handleProposer(selected.id)}
                      className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                    >
                      {isProposing ? "..." : selected.propose_at ? "Déjà proposé" : "Proposer ce médicament"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
