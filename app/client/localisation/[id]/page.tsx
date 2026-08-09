"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Eye, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { getLocalisationDetail } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";
import PharmacieHeader from "@/components/client/PharmacieHeader";

interface PharmacieBloc {
  pharmacieId: string;
  pharmacieNom: string;
  pharmacieAdresse: string;
  pharmacieTelephone: string;
  pharmacieEmail: string;
  distanceKm: number;
  produits: Array<{
    id: string;
    nom: string;
    type: string;
    prix: number;
    qteDemandee: number;
    qteDispo: number;
    ordonnanceRequise: boolean;
  }>;
}

export default function LocalisationDetailPage() {
  return (
    <Suspense fallback={<div className="px-6 pb-8 flex-1" />}>
      <LocalisationDetailContent />
    </Suspense>
  );
}

function LocalisationDetailContent() {
  const router = useRouter();
  const params = useParams();
  const rechercheId = String(params.id);

  const [pharmacies, setPharmacies] = useState<PharmacieBloc[]>([]);
  const [criteres, setCriteres] = useState<string>("");
  const [dateLabel, setDateLabel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [ordonnanceUrl, setOrdonnanceUrl] = useState<string | null>(null);
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false);

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
        const res = await getLocalisationDetail(token, rechercheId);
        const recherche = res.data.recherche;

        // Date
        const d = new Date(recherche.created_at ?? recherche.date);
        setDateLabel(
          d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) +
            " à " +
            d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        );

        // Critères
        const produitsCriteres = recherche.criteres?.produits ?? [];
        setCriteres(produitsCriteres.map((p) => `${p.terme} (x${p.quantite})`).join(", ") || "—");

        // N'afficher que les produits réellement commandés (commande annulée liée),
        // pas l'ensemble des résultats de la recherche d'origine.
        const commandeAnnulee = (recherche.commandes ?? []).find(
          (c) => String(c.statut ?? "").toUpperCase() === "ANNULEE"
        );
        const map = new Map<string, PharmacieBloc>();
        if (commandeAnnulee) {
          const pid = commandeAnnulee.pharmacie?.id ?? commandeAnnulee.id;
          map.set(pid, {
            pharmacieId: pid,
            pharmacieNom: commandeAnnulee.pharmacie?.nom ?? "Pharmacie",
            pharmacieAdresse: [commandeAnnulee.pharmacie?.adresse, commandeAnnulee.pharmacie?.ville].filter(Boolean).join(", "),
            pharmacieTelephone: commandeAnnulee.pharmacie?.telephone ?? "",
            pharmacieEmail: commandeAnnulee.pharmacie?.email ?? "",
            distanceKm: 0,
            produits: (commandeAnnulee.produits ?? []).map((pc, idx) => ({
              id: `${pid}-${idx}`,
              nom: pc.produit?.nom ?? "Produit",
              type: [pc.produit?.forme, pc.produit?.dosage].filter(Boolean).join(" ") || "Produit",
              prix: Number(pc.prix_unitaire ?? 0),
              qteDemandee: Number(pc.quantite ?? 0),
              qteDispo: Number(pc.quantite ?? 0),
              ordonnanceRequise: Boolean(pc.ordonnance_requise),
            })),
          });

          const produitAvecOrdonnance = (commandeAnnulee.produits ?? []).find((pc) => pc.ordonnance?.fichier_url);
          setOrdonnanceUrl(produitAvecOrdonnance?.ordonnance?.fichier_url ?? null);
        }

        setPharmacies(Array.from(map.values()).sort((a, b) => a.distanceKm - b.distanceKm));
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 401) {
            clearAuthSession();
            router.replace("/client/connexion");
          } else {
            toast.error(error.message);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token, rechercheId, router]);

  const formatPrice = (v: number) =>
    Math.round(Number(v))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="w-8 h-8 rounded-full border-2 border-[#00955F] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-3 pb-6 sm:px-6 sm:pb-8">

      {/* Retour */}
      <button
        type="button"
        onClick={() => router.push("/client/localisation")}
        className="flex items-center gap-2 mb-4 text-sm font-medium text-[#00955F] hover:underline"
      >
        <ArrowLeft size={16} />
        Retour aux localisations
      </button>

      {/* Titre */}
      <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl">Détail de la localisation</h1>
      <p className="mb-5 text-sm text-gray-400">{dateLabel}</p>

     

      {pharmacies.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-base font-semibold text-gray-700">Aucune pharmacie trouvée</p>
          <p className="text-sm text-gray-400">Cette recherche n&apos;a pas retourné de résultats.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {pharmacies.map((ph) => {
            const total = ph.produits.reduce((sum, p) => sum + p.prix * p.qteDemandee, 0);

            return (
              <div key={ph.pharmacieId}>
                {/* Header pharmacie */}
                <PharmacieHeader
                  nom={ph.pharmacieNom}
                  adresse={ph.pharmacieAdresse}
                  telephone={ph.pharmacieTelephone}
                  email={ph.pharmacieEmail}
                  distanceKm={ph.distanceKm}
                  className="rounded-t-2xl px-6 py-6"
                />

                {/* Table produits — même design que commande */}
                <div className="rounded-b-2xl overflow-hidden bg-white border border-t-0 border-gray-200">
                  <div className="hidden sm:grid sm:grid-cols-[3fr_2fr_2fr_2fr] gap-2 px-6 py-3 text-base font-bold text-[#B5B5B5] border-b border-[#66666680]">
                    <span>Nom du produit</span>
                    <span className="text-left">Qté</span>
                    <span>P.U</span>
                    <span>Total</span>
                  </div>

                  {ph.produits.map((item, idx) => (
                    <div
                      key={item.id}
                      className={idx < ph.produits.length - 1 ? "border-b border-[#66666680]" : ""}
                    >
                      <div className="flex flex-col gap-2 px-6 py-4 sm:grid sm:grid-cols-[3fr_2fr_2fr_2fr] sm:items-center sm:gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            {item.nom}
                            {item.ordonnanceRequise && (
                              <span className="relative group/ordo shrink-0">
                                <FileText size={15} className="text-red-500" />
                                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/ordo:block whitespace-nowrap rounded bg-red-500 px-2 py-1 text-xs text-white z-10">
                                  Ordonnance requise
                                </span>
                              </span>
                            )}
                          </p>
                          {item.type && item.type !== "Produit" && (
                            <p className="text-xs text-gray-400">{item.type}</p>
                          )}
                        </div>

                        <span className="text-sm text-gray-700 sm:text-left">
                          <span className="sm:hidden text-gray-400 mr-1">Qté :</span>
                          {item.qteDemandee}
                        </span>

                        <span className="text-sm text-gray-700 whitespace-nowrap">
                          <span className="sm:hidden text-gray-400 mr-1">P.U :</span>
                          {formatPrice(item.prix)} FCFA
                        </span>

                        <span className="text-sm text-gray-700 whitespace-nowrap">
                          <span className="sm:hidden text-gray-400 mr-1">Total :</span>
                          {formatPrice(item.prix * item.qteDemandee)} FCFA
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Total pharmacie */}
                  <div className="flex items-center justify-between bg-[#D7EFDA] px-6 py-5">
                    <span className="text-lg md:text-2xl font-bold text-gray-900">Montant estimé</span>
                    <span className="text-lg md:text-2xl font-bold text-gray-900">
                      {formatPrice(total)} FCFA
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ordonnance soumise */}
      {ordonnanceUrl && (() => {
        const isPdf = ordonnanceUrl.toLowerCase().includes(".pdf") || ordonnanceUrl.toLowerCase().includes("pdf");
        return (
          <div className="mt-5 flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-700">Ordonnance soumise :</p>
            <div className="flex items-center gap-3 rounded-xl border border-toni-green-dark-2/30 bg-green-50 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  if (isPdf) {
                    window.open(ordonnanceUrl, "_blank", "noopener,noreferrer");
                  } else {
                    setShowOrdonnanceModal(true);
                  }
                }}
                className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center hover:opacity-80 transition"
                title="Prévisualiser"
              >
                {!isPdf ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ordonnanceUrl} alt="aperçu" className="w-full h-full object-cover" />
                ) : (
                  <FileText size={22} className="text-toni-green-dark-2" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{isPdf ? "Ordonnance.pdf" : "Ordonnance"}</p>
                <p className="text-xs text-gray-400">Déjà soumise</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isPdf) {
                    window.open(ordonnanceUrl, "_blank", "noopener,noreferrer");
                  } else {
                    setShowOrdonnanceModal(true);
                  }
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-toni-green-dark-2 transition shrink-0"
                title={isPdf ? "Ouvrir dans un nouvel onglet" : "Prévisualiser"}
              >
                <Eye size={16} />
              </button>
            </div>

            {showOrdonnanceModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                onClick={() => setShowOrdonnanceModal(false)}
              >
                <div
                  className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-1 pb-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">Ordonnance soumise</p>
                    <button
                      type="button"
                      onClick={() => setShowOrdonnanceModal(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-center pt-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ordonnanceUrl} alt="Ordonnance" className="max-h-[70vh] w-auto rounded-lg object-contain" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </section>
  );
}
