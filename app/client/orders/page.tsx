"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  annulerCommande,
  extractCollection,
  getCommande,
  getCommandeQrCode,
  getClientCommandeCompteurs,
  getClientCommandes,
  initierCommandePaiement,
} from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

interface ClientOrderItem {
  id: string;
  numero: string;
  date: string;
  time: string;
  status: string;
  statusKey: string;
  pharmacy: string;
  montant: number;
}

interface OrderQrState {
  orderId: string;
  orderNumber: string;
  code: string;
  imageUrl?: string | null;
  imageDataUrl?: string | null;
  expiresAt?: string | null;
  pharmacyName?: string;
}

const PENDING_PATIENT_STATUSES = new Set([
  "en_attente_ordonnance",
  "ordonnance_en_verification",
  "ordonnance_rejetee",
]);

const TERMINATED_PATIENT_STATUSES = new Set([
  "en_attente_paiement",
  "payee",
  "en_preparation",
  "prete",
  "annulee",
]);

const QR_VISIBLE_PATIENT_STATUSES = new Set([
  "en_attente_paiement",
  "payee",
  "en_preparation",
  "prete",
]);

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveQrImageSrc(imageDataUrl?: string | null, imageUrl?: string | null): string | null {
  if (imageDataUrl) {
    return imageDataUrl;
  }

  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("/")) {
    return `${API_ORIGIN}${imageUrl}`;
  }

  try {
    const parsed = new URL(imageUrl);
    const apiOrigin = new URL(API_ORIGIN);

    if (
      parsed.hostname === "localhost"
      && parsed.port === ""
      && parsed.pathname.startsWith("/storage/")
    ) {
      return `${apiOrigin.origin}${parsed.pathname}`;
    }
  } catch {
    return imageUrl;
  }

  return imageUrl;
}

export default function ClientOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ClientOrderItem[]>([]);
  const [timelineByOrder, setTimelineByOrder] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({ terminees: 0, enAttente: 0, recuperees: 0 });
  const [fromDay, setFromDay] = useState("");
  const [fromMonth, setFromMonth] = useState("");
  const [fromYear, setFromYear] = useState("");
  const [toDay, setToDay] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [toYear, setToYear] = useState("");
  const [activeTab, setActiveTab] = useState<"Terminees" | "En attente" | "Recuperees">(
    "Terminees"
  );
  const [loadingQrOrderId, setLoadingQrOrderId] = useState<string | null>(null);
  const [validatingOrderId, setValidatingOrderId] = useState<string | null>(null);
  const [selectedQr, setSelectedQr] = useState<OrderQrState | null>(null);

  const token = useMemo(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") {
      return null;
    }
    return session.token;
  }, []);

  const resolvePaymentPhone = (): string => {
    const session = getAuthSession();
    const rawPhone = session && typeof session.profile === "object" && session.profile
      ? String((session.profile as { telephone?: unknown }).telephone ?? "")
      : "";

    const digits = rawPhone.replace(/\D/g, "");
    const last8 = digits.length >= 8 ? digits.slice(-8) : "";
    return last8 || "97000000";
  };

  const loadOrders = useCallback(async () => {
    if (!token) {
      clearAuthSession();
      return;
    }

    const [ordersResponse, counterResponse] = await Promise.all([
      getClientCommandes(token),
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
        pharmacy: order.pharmacie?.nom ?? "Pharmacie",
        montant: order.montant_total,
      };
    });

    setOrders(mappedOrders);
    setStats({
      terminees:
        counterResponse.data.en_attente_paiement
        + counterResponse.data.payee
        + counterResponse.data.en_preparation
        + counterResponse.data.prete
        + counterResponse.data.annulee,
      enAttente:
        counterResponse.data.en_attente_ordonnance
        + counterResponse.data.ordonnance_en_verification
        + counterResponse.data.ordonnance_rejetee,
      recuperees: counterResponse.data.recuperee,
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

    return TERMINATED_PATIENT_STATUSES.has(order.statusKey);
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
      await initierCommandePaiement(token, order.id, "MTN", resolvePaymentPhone());

      // Optimistic UI: après une validation réussie, rendre l'action QR immédiatement visible.
      setOrders((prev) =>
        prev.map((entry) =>
          entry.id === order.id
            ? { ...entry, status: "Paiement effectué", statusKey: "payee" }
            : entry,
        ),
      );

      try {
        const qrResponse = await getCommandeQrCode(token, order.id);
        setSelectedQr({
          orderId: order.id,
          orderNumber: qrResponse.data.commande?.numero ?? order.numero,
          code: qrResponse.data.qr_code.code,
          imageUrl: qrResponse.data.qr_code.image_url,
          imageDataUrl: qrResponse.data.qr_code.image_data_url,
          expiresAt: qrResponse.data.qr_code.expires_at,
          pharmacyName: qrResponse.data.pharmacie?.nom,
        });
      } catch {
        // Le QR pourra toujours être récupéré via le bouton "Voir QR".
      }

      try {
        await loadOrders();
      } catch {
        // Fallback UI si le refresh est temporairement throttlé.
        setOrders((prev) =>
          prev.map((entry) =>
            entry.id === order.id
              ? { ...entry, status: "Paiement effectué", statusKey: "payee" }
              : entry,
          ),
        );
      }
      setActiveTab("Terminees");
      toast.success(`Commande ${order.numero} validée. Le QR code est disponible.`);
    } catch (error) {
      if (error instanceof ApiError) {
        const fallbackToCheckout =
          error.status === 400
          && /ordonnance|vérification|verification/i.test(error.message);

        if (fallbackToCheckout) {
          router.push(`/client/dashboard/cart/checkout?commande=${encodeURIComponent(order.id)}`);
          return;
        }

        toast.error(error.message);
      }
    } finally {
      setValidatingOrderId(null);
    }
  };

  const handleShowQr = async (order: ClientOrderItem) => {
    if (!token) {
      return;
    }

    if (order.statusKey === "en_attente_paiement") {
      try {
        setLoadingQrOrderId(order.id);
        await initierCommandePaiement(token, order.id, "MTN", resolvePaymentPhone());
        setOrders((prev) =>
          prev.map((entry) =>
            entry.id === order.id
              ? { ...entry, status: "Paiement effectué", statusKey: "payee" }
              : entry,
          ),
        );
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        setLoadingQrOrderId(null);
        return;
      } finally {
        setLoadingQrOrderId(null);
      }
    }

    router.push(`/client/orders/${order.id}/qrcode`);
  };

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
                <CheckCircle2 className="text-white"  />
              </div>
              <div>
                <p className="text-sm md:text-base text-[#383838] ">Commandes terminées</p>
                <h1 className="text-xl md:text-[32px] font-semibold text-[#383838]">{stats.terminees}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#66666680] bg-white px-4 py-3 transition  sm:px-5 sm:py-4">
              <div className="w-14 h-14 rounded-full bg-[#FF3D00] flex items-center justify-center">
                <img src="/images/recuperer.svg" alt="En attente" className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm md:text-base text-[#383838]">Commandes en attentes</p>
                <h1 className="text-xl md:text-[32px] font-bold text-[#383838]">{stats.enAttente}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[#66666680] bg-white px-4 py-3 transition  sm:px-5 sm:py-4">
              <div className="w-14 h-14 rounded-full bg-[#00955F] flex items-center justify-center">
                <img src="/images/preparer.svg" alt="Récupérées" className="w-6 h-6" />
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
          <div className="mb-8 flex justify-between gap-3 text-sm text-gray-600 sm:mb-10 sm:gap-4 sm:text-base">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm md:text-xl">Du</span>
              <div className="flex flex-wrap items-center gap-2">
                <select value={fromDay} onChange={(e) => setFromDay(e.target.value)} className=" rounded-full border border-black bg-white px-1 py-1 text-center text-sm md:text-xl focus:outline-none ">
                  <option>JJ</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={`du-j-${i + 1}`} value={i + 1}>
                      {String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} className=" rounded-full border border-black bg-white px-1 py-1 text-center text-sm md:text-xl focus:outline-none ">
                  <option>MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={`du-m-${i + 1}`} value={i + 1}>
                      {String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select value={fromYear} onChange={(e) => setFromYear(e.target.value)} className=" rounded-full border border-black bg-white px-1 py-1 text-center text-sm md:text-xl focus:outline-none ">
                  <option>AAAA</option>
                  {[2024, 2025, 2026].map((year) => (
                    <option key={`du-y-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span>Au</span>
              <div className="flex flex-wrap items-center gap-2">
                <select value={toDay} onChange={(e) => setToDay(e.target.value)} className="rounded-full border border-black bg-white px-1 py-1 text-center text-sm md:text-xl focus:outline-none ">
                  <option>JJ</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={`au-j-${i + 1}`} value={i + 1}>
                      {String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select value={toMonth} onChange={(e) => setToMonth(e.target.value)} className="rounded-full border border-black bg-white px-1 py-1 text-center text-sm md:text-xl focus:outline-none ">
                  <option>MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={`au-m-${i + 1}`} value={i + 1}>
                      {String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select value={toYear} onChange={(e) => setToYear(e.target.value)} className="rounded-full border border-black bg-white px-1 py-1 text-center text-sm md:text-xl focus:outline-none ">
                  <option>AAAA</option>
                  {[2024, 2025, 2026].map((year) => (
                    <option key={`au-y-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-4 overflow-x-auto pb-2 w-full font-semibold text-gray-600  sm:text-lg">
            {[
              { label: "Terminées", value: "Terminees" as const, icon: CheckCircle2 },
              { label: "En attente", value: "En attente" as const, icon: Clock },
              { label: "Récupérées", value: "Recuperees" as const, icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`shrink-0 border-b-2 pb-2 md:text-xl text-lg transition-colors flex items-center gap-2 ${activeTab === tab.value
                    ? "border-[#008F4F] text-[#008F4F]"
                    : "border-transparent hover:text-gray-900"
                  }`}
              >
                <tab.icon size={16} />
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
                      Étape actuelle: {timelineByOrder[order.id] ?? order.status} ({order.pharmacy})
                    </p>
                    <div className="mt-2 text-base text-[#282828] italic ">
                      {order.date} &nbsp; {order.time}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:justify-end">
                    {activeTab === "En attente" ? (
                      <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 sm:px-4 sm:text-sm">
                        En attente
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#dff1ea] px-3 py-1.5 text-xs font-semibold text-[#1f8a5b] sm:px-4 sm:text-sm">
                        {activeTab === "Recuperees" ? "Récupérée" : "Terminée"}
                      </span>
                    )}
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="text-red-500 hover:text-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                    {activeTab === "En attente" && (
                      <button
                        onClick={() => void handleValidatePendingOrder(order)}
                        disabled={validatingOrderId === order.id}
                        className="rounded-full bg-[#dff1ea] px-3 py-1.5 text-xs font-semibold text-[#1f8a5b] sm:px-4 sm:text-sm"
                      >
                        {validatingOrderId === order.id ? "Validation..." : "Valider"}
                      </button>
                    )}
                    {QR_VISIBLE_PATIENT_STATUSES.has(order.statusKey) && (
                      <button
                        onClick={() => handleShowQr(order)}
                        disabled={loadingQrOrderId === order.id}
                        className="rounded-full border border-[#1f8a5b] bg-white px-3 py-1.5 text-xs font-semibold text-[#1f8a5b] disabled:opacity-60 sm:px-4 sm:text-sm"
                      >
                        {loadingQrOrderId === order.id ? "Chargement..." : "Voir QR"}
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
