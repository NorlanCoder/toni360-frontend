"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Eye, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  annulerCommande,
  extractCollection,
  getClientCommandeCompteurs,
  getClientCommandes,
  mettreEnAttenteCommande,
  validerCommande,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

interface ClientOrderItem {
  id: string;
  numero: string;
  date: string;
  time: string;
  status: string;
  statusKey: string;
  etat_ordonnance: string;
  pharmacy: string;
  montant: number;
}

const PENDING_PATIENT_STATUSES = new Set([
  "en_attente_ordonnance",
  "ordonnance_rejetee",
  "en_attente_client",
]);

const IN_PROGRESS_PATIENT_STATUSES = new Set([
  "ordonnance_en_verification",
  "ordonnance_validee",
  "en_attente_paiement",
  "en_cours",
  "payee",
  "en_preparation",
  "prete",
]);

const TERMINATED_PATIENT_STATUSES = new Set([
  "annulee",
  "expiree",
]);

const QR_VISIBLE_PATIENT_STATUSES = new Set([
  "en_cours",
  "payee",
  "en_preparation",
  "prete",
]);

export default function ClientOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ClientOrdersContent />
    </Suspense>
  );
}

function ClientOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<ClientOrderItem[]>([]);
  const [timelineByOrder, setTimelineByOrder] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({ terminees: 0, enAttente: 0, recuperees: 0, enCours: 0, pretes: 0, annulees: 0 });
  const _today = new Date();
  const _from30 = new Date(_today);
  _from30.setMonth(_today.getMonth() - 3);

  const [fromDay, setFromDay] = useState(String(_from30.getDate()));
  const [fromMonth, setFromMonth] = useState(String(_from30.getMonth() + 1));
  const [fromYear, setFromYear] = useState(String(_from30.getFullYear()));
  const [toDay, setToDay] = useState(String(_today.getDate()));
  const [toMonth, setToMonth] = useState(String(_today.getMonth() + 1));
  const [toYear, setToYear] = useState(String(_today.getFullYear()));

  const initTab = useMemo((): "En attente" | "En cours" | "Recuperees" => {
    const tab = searchParams.get("tab");
    if (tab === "en_cours" || tab === "prete") return "En cours";
    if (tab === "recuperees") return "Recuperees";
    return "En attente";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<"En attente" | "En cours" | "Recuperees">(initTab);
  const [loadingQrOrderId] = useState<string | null>(null);
  const [validatingOrderId, setValidatingOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = useMemo(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") {
      return null;
    }
    return session.token;
  }, []);


  const loadOrders = useCallback(async () => {
    if (!token) {
      clearAuthSession();
      return;
    }

    const [ordersResponse, counterResponse] = await Promise.all([
      getClientCommandes(token, undefined, 200),
      getClientCommandeCompteurs(token),
    ]);

    const mappedOrders = extractCollection(ordersResponse.data).map((order) => {
      const createdAt = order.created_at ? new Date(order.created_at) : new Date();
      return {
        id: order.id,
        numero: order.numero_commande,
        date: createdAt.toLocaleDateString("fr-FR"),
        time: createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        status: order.statut_label,
        statusKey: String(order.statut ?? "").toLowerCase(),
        etat_ordonnance: order.etat_ordonnance ?? "non_requise",
        pharmacy: order.pharmacie?.nom ?? "Pharmacie",
        montant: order.montant_total,
      };
    });

    setOrders(mappedOrders);
    setStats({
      terminees: counterResponse.data.total_terminee ?? 0,
      enAttente: counterResponse.data.total_en_attente ?? 0,
      recuperees: counterResponse.data.total_recuperee ?? 0,
      enCours: counterResponse.data.total_en_cours ?? 0,
      pretes: counterResponse.data.total_prete ?? 0,
      annulees: counterResponse.data.total_annulee ?? 0,
    });

    setTimelineByOrder(
      Object.fromEntries(mappedOrders.map((order) => [order.id, order.status] as const)),
    );
  }, [token]);

  useEffect(() => {
    const load = async () => {
      try {
        await loadOrders();
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [loadOrders]);

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(`${order.date.split("/").reverse().join("-")}T00:00:00`);
    const fromDate = fromDay && fromMonth && fromYear
      ? new Date(`${fromYear}-${fromMonth.padStart(2, "0")}-${fromDay.padStart(2, "0")}T00:00:00`)
      : null;
    const toDate = toDay && toMonth && toYear
      ? new Date(`${toYear}-${toMonth.padStart(2, "0")}-${toDay.padStart(2, "0")}T23:59:59`)
      : null;

    if (fromDate && orderDate < fromDate) {
      return false;
    }

    if (toDate && orderDate > toDate) {
      return false;
    }

    if (activeTab === "Recuperees") {
      return order.statusKey === "recuperee";
    }

    if (activeTab === "En attente") {
      return PENDING_PATIENT_STATUSES.has(order.statusKey);
    }

    if (activeTab === "En cours") {
      return IN_PROGRESS_PATIENT_STATUSES.has(order.statusKey);
    }

    return false;
  });

  const handleCancel = async (orderId: string) => {
    if (!token) {
      return;
    }

    const targetOrder = orders.find((order) => order.id === orderId);
    const isRecuperee = targetOrder?.statusKey === "recuperee";

    try {
      await annulerCommande(token, orderId);

      if (isRecuperee) {
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
        setStats((prev) => ({
          ...prev,
          recuperees: Math.max(0, prev.recuperees - 1),
        }));
        toast.success("Commande retirée de l'historique.");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "Annulée", statusKey: "annulee" } : order,
        ),
      );
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    }
  };

  const handleValidatePendingOrder = async (order: ClientOrderItem) => {
    if (!token) {
      return;
    }

    setValidatingOrderId(order.id);
    try {
      await validerCommande(token, order.id);

      setOrders((prev) =>
        prev.map((entry) =>
          entry.id === order.id
            ? { ...entry, status: "En cours de traitement", statusKey: "en_cours" }
            : entry,
        ),
      );

      try {
        await loadOrders();
      } catch {
        // ignore
      }
      setActiveTab("En cours");
      toast.success(`Commande ${order.numero} validée. La pharmacie va prendre en charge votre commande.`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setValidatingOrderId(null);
    }
  };

  const handleMettreEnAttente = async (order: ClientOrderItem) => {
    if (!token) {
      return;
    }

    try {
      await mettreEnAttenteCommande(token, order.id);
      setOrders((prev) =>
        prev.map((entry) =>
          entry.id === order.id
            ? { ...entry, status: "En attente (client)", statusKey: "en_attente_client" }
            : entry,
        ),
      );
      toast.success("Commande mise en attente. Vous pourrez la valider plus tard.");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    }
  };

  const handleShowQr = async (order: ClientOrderItem) => {
    if (!token) {
      return;
    }

    router.push(`/client/orders/${order.id}/qrcode`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#00955F] border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500">Chargement des commandes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-5xl rounded-3xl px-3 py-4 sm:px-4 sm:py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Mes commandes</h1>

        {/* Summary + Orders section */}
        <div className="rounded-3xl p-0 sm:p-2">
          {/* Summary cards */}
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mb-10 lg:grid-cols-3 lg:gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-[#66666680] bg-white px-4 py-3 transition -sm sm:px-5 sm:py-4">
              <div className="w-14 h-14 rounded-full bg-[#004B2F] flex items-center justify-center">
                <img src="/images/recuperer.svg" alt="Terminées" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm md:text-base text-[#383838] ">Commandes terminées</p>
                <h1 className="text-xl md:text-[32px] font-semibold text-[#383838]">{stats.terminees}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#66666680] bg-white px-4 py-3 transition  sm:px-5 sm:py-4">
              <div className="w-14 h-14 rounded-full bg-[#FF3D00] flex items-center justify-center">
                <img src="/images/preparer.svg" alt="En attente" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm md:text-base text-[#383838]">Commandes en attentes</p>
                <h1 className="text-xl md:text-[32px] font-bold text-[#383838]">{stats.enAttente}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#66666680] bg-white px-4 py-3 transition  sm:px-5 sm:py-4">
              <div className="w-14 h-14 rounded-full bg-[#00955F] flex items-center justify-center">
                <img src="/images/location.svg" alt="Récupérées" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm md:text-base text-[#383838]">Commandes récupérées</p>
                <h1 className="text-xl md:text-[32px] font-bold text-[#383838]">{stats.recuperees}</h1>
              </div>
            </div>
            
            {/* <button
              onClick={() => router.push("/client/dashboard/cart")}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#66666680] bg-white px-4 py-3 font-semibold text-[#008F4F] transition hover:bg-[#d8f5ea]"
            >
              <Plus size={18} />
              Ajouter
            </button> */}
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Du */}
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-700 font-medium">Du</span>
              <div className="relative">
                <select
                  aria-label="Jour"
                  value={fromDay}
                  onChange={(e) => setFromDay(e.target.value)}
                  className="appearance-none w-[68px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">JJ</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={`du-j-${i + 1}`} value={i + 1}>{String(i + 1).padStart(2, "0")}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  aria-label="Mois"
                  value={fromMonth}
                  onChange={(e) => setFromMonth(e.target.value)}
                  className="appearance-none w-[72px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={`du-m-${i + 1}`} value={i + 1}>{String(i + 1).padStart(2, "0")}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  aria-label="Année"
                  value={fromYear}
                  onChange={(e) => setFromYear(e.target.value)}
                  className="appearance-none w-[88px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">AAAA</option>
                  {[2024, 2025, 2026].map((year) => (
                    <option key={`du-y-${year}`} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
            {/* Au */}
            <div className="flex items-center gap-2">
              <span className="text-base text-gray-700 font-medium">Au</span>
              <div className="relative">
                <select
                  aria-label="Jour"
                  value={toDay}
                  onChange={(e) => setToDay(e.target.value)}
                  className="appearance-none w-[68px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">JJ</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={`au-j-${i + 1}`} value={i + 1}>{String(i + 1).padStart(2, "0")}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  aria-label="Mois"
                  value={toMonth}
                  onChange={(e) => setToMonth(e.target.value)}
                  className="appearance-none w-[72px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={`au-m-${i + 1}`} value={i + 1}>{String(i + 1).padStart(2, "0")}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  aria-label="Année"
                  value={toYear}
                  onChange={(e) => setToYear(e.target.value)}
                  className="appearance-none w-[88px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">AAAA</option>
                  {[2024, 2025, 2026].map((year) => (
                    <option key={`au-y-${year}`} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-4 overflow-x-auto pb-2 w-full font-semibold text-gray-600  sm:text-lg">
            {[
              { label: "En attente", value: "En attente" as const, img: "/images/attente.svg" },
              { label: "En cours", value: "En cours" as const, icon: Loader2 },
              { label: "Récupérées", value: "Recuperees" as const, img: "/images/location-2.svg" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`shrink-0 border-b-2 pb-2 md:text-xl text-lg transition-colors flex items-center gap-2 ${activeTab === tab.value
                    ? "border-[#008F4F] text-[#008F4F]"
                    : "border-transparent hover:text-gray-900"
                  }`}
              >
                {"img" in tab ? (
                  <img src={tab.img} alt={tab.label} className="w-5 h-5" />
                ) : (
                  <tab.icon size={16} />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders list */}
          <div className="   overflow-hidden">
            <div className="">
              {filteredOrders.map((order, index) => (
                <div
                  key={`${order.id}-${index}`}
                  className="flex flex-col gap-3 border-b-2 border-[#666666] px-4 py-4 last:border-b-0 sm:px-6 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-base md:text-xl font-bold text-gray-900">
                      Commande NO {order.numero}
                    </p>
                    <p className="mt-1 text-base text-gray-500">
                      Votre commande a été localisée à la pharmacie  {timelineByOrder[order.id] ?? order.status} {order.pharmacy}
                    </p>
                    <div className="mt-2 text-base text-[#282828] italic ">
                      {order.date} &nbsp; {order.time}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:justify-end">
                    {/* Badge de statut */}
                    {/* {activeTab === "En attente" && (
                      <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-600 sm:px-4 sm:text-sm">
                        En attente
                      </span>
                    )} */}
                    {/* Badge ordonnance manquante — uniquement EN_ATTENTE_CLIENT sans ordonnance */}
                    {activeTab === "En attente" && order.statusKey === "en_attente_client" && order.etat_ordonnance === "en_attente" && (
                      <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 sm:px-4 sm:text-sm">
                        Ordonnance manquante
                      </span>
                    )}
                    {activeTab === "En cours" && (
                      <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-600 sm:px-4 sm:text-sm">
                        En cours
                      </span>
                    )}
                    {order.statusKey === "prete" && (
                      <span className="rounded-full bg-teal-100 px-3 py-1.5 text-xs font-semibold text-teal-600 sm:px-4 sm:text-sm">
                        Prête
                      </span>
                    )}
                    {activeTab === "Recuperees" && (
                      <span className="rounded-full bg-[#dff1ea] px-3 py-1.5 text-xs font-semibold text-[#1f8a5b] sm:px-4 sm:text-sm">
                        Récupérée
                      </span>
                    )}
                    {order.statusKey === "recuperee" && activeTab !== "Recuperees" && (
                      <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 sm:px-4 sm:text-sm">
                        Terminée
                      </span>
                    )}

                   

                    {/* Bouton mettre en attente — uniquement sur EN_ATTENTE_ORDONNANCE ou EN_ATTENTE_PAIEMENT */}
                    {activeTab === "En attente" && (order.statusKey === "en_attente_ordonnance" || order.statusKey === "en_attente_paiement") && (
                      <button
                        onClick={() => void handleMettreEnAttente(order)}
                        className="rounded-full border border-orange-400 bg-white px-3 py-1.5 text-xs font-semibold text-orange-500 sm:px-4 sm:text-sm"
                      >
                        Mettre en attente
                      </button>
                    )}

                    {/* Bouton valider — sur EN_ATTENTE_PAIEMENT ou EN_ATTENTE_CLIENT */}
                    {/* Si ordonnance manquante → "Voir" (redirige vers le détail) */}
                    {activeTab === "En attente" && (order.statusKey === "en_attente_paiement" || order.statusKey === "en_attente_client") && (
                      order.etat_ordonnance === "en_attente" ? (
                        // <button
                        //   onClick={() => router.push(`/client/orders/${order.id}`)}
                        //   className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-600 sm:px-4 sm:text-sm"
                        // >
                        //   Voir
                        // </button>
                        ""
                      ) : (
                        <button
                          onClick={() => void handleValidatePendingOrder(order)}
                          disabled={validatingOrderId === order.id}
                          className="rounded-full bg-[#dff1ea] px-3 py-1.5 text-xs font-semibold text-[#1f8a5b] sm:px-4 sm:text-sm disabled:opacity-60"
                        >
                          {validatingOrderId === order.id ? "Validation..." : "Valider"}
                        </button>
                      )
                    )}

                    {/* Bouton voir QR — masqué pour Terminées */}
                    {order.statusKey !== "recuperee" && QR_VISIBLE_PATIENT_STATUSES.has(order.statusKey) && (
                      <button
                        onClick={() => handleShowQr(order)}
                        disabled={loadingQrOrderId === order.id}
                        className="rounded-full border border-[#1f8a5b] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f8a5b] disabled:opacity-60 sm:px-4 sm:text-sm"
                      >
                        {loadingQrOrderId === order.id ? "Chargement..." : "Voir QR"}
                      </button>
                    )}

                    {/* Bouton voir détail — toujours visible */}
                    <Link
                      href={`/client/orders/${order.id}`}
                      className="flex items-center gap-1 rounded-full  bg-white  text-xs font-semibold text-gray-600 hover:bg-gray-50  sm:text-sm"
                    >
                      <Eye size={18} />
                      
                    </Link>

                     {/* Bouton supprimer — masqué pour Terminées */}
                    {order.statusKey !== "recuperee" && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="text-red-500 hover:text-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="px-6 py-8 text-sm text-gray-500">Aucune commande pour ce filtre.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

