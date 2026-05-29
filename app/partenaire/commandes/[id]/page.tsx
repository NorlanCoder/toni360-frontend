"use client";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import {
  getPartnerCommande,
  livrerPartnerCommande,
  marquerPartnerCommandePrete,
  preparerPartnerCommande,
  PartnerCommande,
} from "@/lib/api/partner";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";

/* ──────────────────────────── Types ──────────────────────────── */
type OrderStatus = "a-preparer" | "prete" | "recuperee";

interface OrderItem {
  medicament: string;
  qte: number;
  pu: number;
  total: number;
}

interface OrderDetail {
  id: string;
  cmdRef: string;
  patient: string;
  telephone: string;
  date: string;
  heure: string;
  paiement: "momo" | "visa" | "cash";
  pieceJointe: string | null;
  pieceJointeUrl: string | null;
  items: OrderItem[];
  montantTotal: number;
  statut: OrderStatus;
}

const READY_ALLOWED_STATUSES = new Set(["EN_ATTENTE_PAIEMENT", "EN_COURS", "PAYEE", "EN_PREPARATION"]);


/* ──────────────────── Format helpers ────────────────────────── */
function formatPrice(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function formatTotal(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromSection = searchParams.get("from");
  const [statut, setStatut] = useState<OrderStatus>(fromSection === "recuperees" ? "recuperee" : "a-preparer");

  useEffect(() => {
    const toViewStatus = (statutCommande: string): OrderStatus => {
      if (statutCommande === "RECUPEREE") {
        return "recuperee";
      }
      if (statutCommande === "PRETE") {
        return "prete";
      }
      return "a-preparer";
    };

    const mapToOrderDetail = (commande: PartnerCommande): OrderDetail => {
      const createdAt = commande.created_at ? new Date(commande.created_at) : null;
      const firstOrdonnanceUrl = commande.produits.find((p) => p.ordonnance?.fichier_url)?.ordonnance?.fichier_url ?? null;
      const pieceJointe = firstOrdonnanceUrl ? firstOrdonnanceUrl.split("/").pop() ?? null : null;

      return {
        id: commande.id,
        cmdRef: commande.numero_commande,
        patient: commande.patient?.nom_complet ?? "Patient inconnu",
        telephone: commande.patient?.telephone ?? "-",
        date: createdAt
          ? createdAt.toLocaleDateString("fr-FR")
          : "-",
        heure: createdAt
          ? createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
          : "-",
        paiement: "momo",
        pieceJointe,
        pieceJointeUrl: firstOrdonnanceUrl,
        items: commande.produits.map((produit) => ({
          medicament: produit.produit?.nom ?? "Médicament",
          qte: produit.quantite ?? 0,
          pu: produit.prix_unitaire ?? 0,
          total: produit.prix_total ?? 0,
        })),
        montantTotal: commande.montant_total ?? 0,
        statut: toViewStatus(commande.statut),
      };
    };

    const loadOrder = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token || !id) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPartnerCommande(session.token, id);
        const commande = response.data.commande;
        setOrder(mapToOrderDetail(commande));
        setBackendStatus(commande.statut);
        setStatut(fromSection === "recuperees" ? "recuperee" : toViewStatus(commande.statut));
              } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger la commande.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrder();
  }, [fromSection, id]);

  const handleReady = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    if (!READY_ALLOWED_STATUSES.has(backendStatus)) {
      toast.error("Cette commande ne peut pas encore être marquée prête.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (backendStatus !== "EN_PREPARATION") {
        const prepResponse = await preparerPartnerCommande(session.token, id);
        setBackendStatus(prepResponse.data.commande.statut);
      }

      const readyResponse = await marquerPartnerCommandePrete(session.token, id);
      setBackendStatus(readyResponse.data.commande.statut);
      setStatut("prete");
          } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Impossible de marquer la commande prête.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecuperer = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    setIsSubmitting(true);
    try {
      const recupResponse = await livrerPartnerCommande(session.token, id);
      setBackendStatus(recupResponse.data.commande.statut);
      setStatut("recuperee");
          } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Impossible de marquer la commande récupérée.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Chargement des détails de la commande...</div>;
  }

  if (!order) {
    return <div className="p-6 text-sm text-red-600">Commande introuvable.</div>;
  }

  const canMarkReady = READY_ALLOWED_STATUSES.has(backendStatus);

  return (
    <>
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10 bg-emerald-50">
          {/* Back + Title */}
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-gray-500 hover:text-emerald-700 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Détails de la commande{" "}
              <span className="font-normal ">{order.cmdRef}</span>
            </h1>
          </div>

          {/* ────── WRAPPER largeur commune ────── */}
          <div className="max-w-4xl">

          {/* ── Info card ── */}
          <div className="mb-4 rounded-xl border border-gray-200 bg-white px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Patient info */}
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500">
                Patient : <span className="font-bold text-gray-900">{order.patient}</span>
              </p>
              <p className="text-sm text-gray-500">
                Téléphone : <span className="font-semibold text-gray-800">{order.telephone}</span>
              </p>
            </div>

            {/* Date */}
            <div className="text-sm text-gray-500 text-center">
              Commandée le :{" "}
              <span className="font-semibold text-gray-800">
                {order.date} à {order.heure}
              </span>
            </div>

            {/* Paiement */}
            <div className="flex flex-col items-end gap-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Méthode de paiement</p>
              {order.paiement === "momo" && (
                <div className="flex items-center gap-2 rounded-lg p-1 bg-white">
                  <Image
                    src="/images/momo.jpg"
                    alt="MoMo from MTN"
                    width={120}
                    height={72}
                    className="object-contain h-10 rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Pièce jointe ── */}
          {order.pieceJointe && (
            <div className="mb-6 flex items-center justify-end gap-3">
              <span className="text-sm text-gray-500">Pièce jointe :</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                <span className="text-sm text-gray-700 font-medium truncate max-w-[160px]">
                  {order.pieceJointe}
                </span>
                <button
                  onClick={() => router.push(`/partenaire/commandes/${order.id}/ordonnance`)}
                  aria-label="Voir l'ordonnance"
                  className="flex items-center justify-center rounded-full bg-emerald-600 p-1.5 text-white hover:bg-emerald-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Tableau médicaments ── */}
          <div className="overflow-x-auto rounded-t-lg border border-gray-200 bg-white">
            <table className="min-w-[520px] w-full table-auto text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Médicament</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Qte</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">P.U.</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="px-6 py-5 text-gray-800">{item.medicament}</td>
                    <td className="px-6 py-5 text-gray-600">{String(item.qte).padStart(2, "0")}</td>
                    <td className="px-6 py-5 text-gray-600">{formatPrice(item.pu)}</td>
                    <td className="px-6 py-5 text-right text-gray-800 font-medium">{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Montant total ── */}
          <div className="flex items-center justify-between rounded-b-lg border border-t-0 border-gray-200 bg-emerald-200 px-6 py-5 mb-8">
            <span className="text-lg font-bold text-gray-800">Montant total</span>
            <span className="text-2xl font-extrabold text-gray-900">{formatTotal(order.montantTotal)}</span>
          </div>

          </div>{/* fin wrapper max-w-4xl */}

          {/* ── Boutons d'action ── */}
          <div className="max-w-4xl flex flex-wrap items-center gap-4">
            {statut === "recuperee" ? (
              <button
                type="button"
                disabled
                className="w-full rounded-full bg-emerald-600 px-12 py-3 text-base font-semibold text-white cursor-default opacity-80"
              >
                Commande récupérée
              </button>
            ) : statut === "prete" ? (
              <>
                <button
                  type="button"
                  disabled
                  className="w-full rounded-full bg-emerald-50 border-2 border-emerald-400 px-12 py-3 text-base font-semibold text-emerald-700 cursor-default"
                >
                  En attente d&apos;être récupérée
                </button>
                <button
                  type="button"
                  onClick={handleRecuperer}
                  disabled={isSubmitting}
                  className="w-full rounded-full border-2 border-emerald-600 bg-emerald-600 px-12 py-3 text-base font-semibold text-white hover:bg-emerald-700 hover:border-emerald-700 transition-colors"
                >
                  {isSubmitting ? "Traitement..." : "Récupérer"}
                </button>
              </>
            ) : (
              <>
                

                <button
                  type="button"
                  onClick={handleReady}
                  disabled={isSubmitting || !canMarkReady}
                  className={`w-full rounded-full border-2 px-12 py-3 text-base font-semibold transition-colors ${
                    canMarkReady
                      ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700"
                      : "border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "Traitement..." : "Prête"}
                </button>
              </>
            )}
          </div>
        </main>
    </>
  
  );
}

