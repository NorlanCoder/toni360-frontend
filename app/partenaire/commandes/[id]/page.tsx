"use client";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import {
  getPartnerCommande,
  livrerPartnerCommande,
  marquerPartnerCommandePrete,
  notifierPartnerPatient,
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
  ordonnance_requise?: boolean;
  ordonnance_fournie?: boolean;
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

const READY_ALLOWED_STATUSES = new Set([
  "EN_ATTENTE_PAIEMENT",
  "EN_COURS",
  "PAYEE",
  "EN_PREPARATION",
]);

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

  // Loader indépendant par bouton
  const [submittingNotif, setSubmittingNotif] = useState(false);
  const [submittingReady, setSubmittingReady] = useState(false);
  const [submittingRecuperer, setSubmittingRecuperer] = useState(false);

  const fromSection = searchParams.get("from");
  const [statut, setStatut] = useState<OrderStatus>(
    fromSection === "recuperees" ? "recuperee" : "a-preparer"
  );

  useEffect(() => {
    const toViewStatus = (s: string): OrderStatus => {
      if (s === "RECUPEREE") return "recuperee";
      if (s === "PRETE") return "prete";
      return "a-preparer";
    };

    const mapToOrderDetail = (commande: PartnerCommande): OrderDetail => {
      const createdAt = commande.created_at ? new Date(commande.created_at) : null;
      const firstOrdonnanceUrl =
        commande.produits.find((p) => p.ordonnance?.fichier_url)?.ordonnance?.fichier_url ?? null;
      const pieceJointe = firstOrdonnanceUrl
        ? (firstOrdonnanceUrl.split("/").pop() ?? null)
        : null;

      return {
        id: commande.id,
        cmdRef: commande.numero_commande,
        patient: commande.patient?.nom_complet ?? "Patient inconnu",
        telephone: commande.patient?.telephone ?? "-",
        date: createdAt ? createdAt.toLocaleDateString("fr-FR") : "-",
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
          ordonnance_requise: !!produit.ordonnance_requise,
          ordonnance_fournie: !!produit.ordonnance?.fichier_url,
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

  /* ── Handlers ── */
  const handleDemanderOrdonnance = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }
    setSubmittingNotif(true);
    try {
      await notifierPartnerPatient(
        session.token,
        id,
        "Votre commande nécessite une ordonnance. Merci de la fournir pour continuer."
      );
      toast.success("Notification envoyée au patient.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Impossible d'envoyer la notification.");
    } finally {
      setSubmittingNotif(false);
    }
  };

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
    setSubmittingReady(true);
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
      setSubmittingReady(false);
    }
  };

  const handleRecuperer = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }
    setSubmittingRecuperer(true);
    try {
      const recupResponse = await livrerPartnerCommande(session.token, id);
      setBackendStatus(recupResponse.data.commande.statut);
      setStatut("recuperee");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Impossible de marquer la commande récupérée.");
    } finally {
      setSubmittingRecuperer(false);
    }
  };

  /* ── Early returns ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Chargement de la commande...
      </div>
    );
  }

  if (!order) {
    return <div className="p-6 text-sm text-red-600">Commande introuvable.</div>;
  }

  /* ── Computed flags ── */
  const canMarkReady = READY_ALLOWED_STATUSES.has(backendStatus);
  const canForceRecuperer = new Set(["PRETE", "PAYEE", "EN_PREPARATION", "EN_COURS"]).has(backendStatus);
  const notifDisabled = submittingNotif;

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <>
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">
            Commande #{order.cmdRef}
          </h1>
          <p className="text-xs text-gray-500">Détail de la commande</p>
        </div>
      </header>

      <main className="mx-auto px-4 py-6 sm:px-6 flex flex-col gap-6">
        <div className="max-w-4xl w-full mx-auto flex flex-col gap-6">

          {/* ── Info card ── */}
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500">
                Patient : <span className="font-bold text-gray-900">{order.patient}</span>
              </p>
              <p className="text-sm text-gray-500">
                Téléphone : <span className="font-semibold text-gray-800">{order.telephone}</span>
              </p>
            </div>
            <div className="text-sm text-gray-500 text-center">
              Commandée le :{" "}
              <span className="font-semibold text-gray-800">
                {order.date} à {order.heure}
              </span>
            </div>
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
            <div className="flex items-center justify-end gap-3">
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
          <div>
            <div className="overflow-x-auto rounded-t-lg border border-gray-200 bg-white">
              <table className="min-w-[520px] w-full table-auto text-sm lg:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Médicament</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Qte</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">P.U.</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="px-6 py-5 text-gray-800">
                        <span className="inline-flex items-center gap-2">
                          {item.ordonnance_requise && (
                            <span className="group relative inline-flex items-center shrink-0">
                              <FileText
                                className={`h-4 w-4 ${
                                  item.ordonnance_fournie ? "text-emerald-500" : "text-amber-500"
                                }`}
                              />
                              <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {item.ordonnance_fournie ? "Ordonnance fournie" : "Ordonnance requise"}
                                <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                              </span>
                            </span>
                          )}
                          <span>{item.medicament}</span>
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-600">{String(item.qte).padStart(2, "0")}</td>
                      <td className="px-6 py-5 text-gray-600">{formatPrice(item.pu)}</td>
                      <td className="px-6 py-5 text-gray-800 font-medium">{formatPrice(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* ── Montant total ── */}
            <div className="flex items-center justify-between rounded-b-lg border border-t-0 border-gray-200 bg-emerald-200 px-6 py-5">
              <span className="text-lg font-bold text-gray-800">Montant total</span>
              <span className="text-2xl font-extrabold text-gray-900">{formatTotal(order.montantTotal)}</span>
            </div>
          </div>

          {/* ── Boutons d'action ── */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {statut === "recuperee" ? (
              <button
                type="button"
                disabled
                className="flex-1 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white cursor-default opacity-80"
              >
                Commande récupérée
              </button>
            ) : statut === "prete" ? (
              <>
                <button
                  type="button"
                  disabled
                  className="flex-1 rounded-full bg-gray-50 border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-400 cursor-default"
                >
                  En attente de récupération
                </button>
                <button
                  type="button"
                  onClick={handleRecuperer}
                  disabled={submittingRecuperer}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 border-2 border-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-700 hover:border-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submittingRecuperer && <Loader2 className="h-4 w-4 animate-spin" />}
                  Récupérée
                </button>
              </>
            ) : (
              <>
                {/* Demander ordonnance — gris pill */}
                <button
                  type="button"
                  onClick={handleDemanderOrdonnance}
                  disabled={notifDisabled}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-colors ${
                    notifDisabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {submittingNotif && <Loader2 className="h-4 w-4 animate-spin" />}
                  Demander ordonnance
                </button>

                {/* Prête — vert outline */}
                <button
                  type="button"
                  onClick={handleReady}
                  disabled={submittingReady || !canMarkReady}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 px-6 py-3 text-base font-semibold transition-colors ${
                    !submittingReady && canMarkReady
                      ? "border-emerald-600 text-emerald-600 bg-white hover:bg-emerald-50"
                      : "border-gray-300 text-gray-400 bg-white cursor-not-allowed"
                  }`}
                >
                  {submittingReady && <Loader2 className="h-4 w-4 animate-spin" />}
                  Prête
                </button>

                {/* Récupérée — vert plein */}
                <button
                  type="button"
                  onClick={handleRecuperer}
                  disabled={!canForceRecuperer || submittingRecuperer}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white transition-colors ${
                    canForceRecuperer && !submittingRecuperer
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {submittingRecuperer && <Loader2 className="h-4 w-4 animate-spin" />}
                  Récupérée
                </button>
              </>
            )}
          </div>

        </div>
      </main>
    </>
  );
}
