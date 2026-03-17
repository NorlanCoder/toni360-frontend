"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Plus, Trash2 } from "lucide-react";
import {
  annulerCommande,
  extractCollection,
  getCommandeQrCode,
  getClientCommandeCompteurs,
  getClientCommandes,
  suivreCommande,
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
  pharmacy: string;
  montant: number;
}

interface OrderQrState {
  orderId: string;
  orderNumber: string;
  code: string;
  imageUrl?: string | null;
  expiresAt?: string | null;
  pharmacyName?: string;
}

export default function ClientOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ClientOrderItem[]>([]);
  const [message, setMessage] = useState("");
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
  const [selectedQr, setSelectedQr] = useState<OrderQrState | null>(null);

  const token = useMemo(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") {
      return null;
    }
    return session.token;
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        clearAuthSession();
        return;
      }

      try {
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
          terminees: counterResponse.data.payee + counterResponse.data.prete,
          enAttente: counterResponse.data.en_cours,
          recuperees: counterResponse.data.recuperee,
        });

        const suivis = await Promise.all(
          mappedOrders.slice(0, 8).map(async (order) => {
            const suivi = await suivreCommande(token, order.id);
            const prochaineEtape = suivi.data.etapes.find((etape) => !etape.complete)?.label;
            return [order.id, prochaineEtape ?? suivi.data.commande.statut_label] as const;
          }),
        );

        setTimelineByOrder(Object.fromEntries(suivis));
      } catch (error) {
        if (error instanceof ApiError) {
          setMessage(error.message);
        }
      }
    };

    void load();
  }, [token]);

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
      return !["recuperee", "annulee", "payee", "prete"].includes(order.statusKey);
    }

    return ["payee", "prete", "annulee"].includes(order.statusKey);
  });

  const handleCancel = async (orderId: string) => {
    if (!token) {
      return;
    }

    try {
      await annulerCommande(token, orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "Annulée", statusKey: "annulee" } : order,
        ),
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    }
  };

  const handleValidatePendingOrder = (orderId: string) => {
    router.push(`/client/dashboard/cart/checkout?commande=${encodeURIComponent(orderId)}`);
  };

  const handleShowQr = async (order: ClientOrderItem) => {
    if (!token) {
      return;
    }

    try {
      setLoadingQrOrderId(order.id);
      setMessage("");
      const response = await getCommandeQrCode(token, order.id);

      setSelectedQr({
        orderId: order.id,
        orderNumber: response.data.commande?.numero ?? order.numero,
        code: response.data.qr_code.code,
        imageUrl: response.data.qr_code.image_url,
        expiresAt: response.data.qr_code.expires_at,
        pharmacyName: response.data.pharmacie?.nom,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    } finally {
      setLoadingQrOrderId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl rounded-3xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h1>

      {message && <p className="mb-4 text-sm text-red-500">{message}</p>}

      {/* Summary + Orders section */}
      <div className="rounded-3xl p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 transition hover:shadow-sm hover:border-[#008F4F] hover:bg-[#d8f5ea]">
          <div className="w-11 h-11 rounded-full bg-[#e8faf3] flex items-center justify-center">
            <CheckCircle2 className="text-[#008F4F]" size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commandes terminées</p>
            <p className="text-xl font-bold text-gray-900">{stats.terminees}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 transition hover:shadow-sm hover:border-[#008F4F] hover:bg-[#d8f5ea]">
          <div className="w-11 h-11 rounded-full bg-[#fff3e8] flex items-center justify-center">
            <Clock className="text-[#f97316]" size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commandes en attentes</p>
            <p className="text-xl font-bold text-gray-900">{stats.enAttente}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 transition hover:shadow-sm hover:border-[#008F4F] hover:bg-[#d8f5ea]">
          <div className="w-11 h-11 rounded-full bg-[#e8faf3] flex items-center justify-center">
            <MapPin className="text-[#008F4F]" size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commandes récupérées</p>
            <p className="text-xl font-bold text-gray-900">{stats.recuperees}</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/client/dashboard/cart")}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[#008F4F] font-semibold hover:bg-[#d8f5ea] transition"
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 mb-10 text-base text-gray-600">
        <div className="flex items-center gap-2">
          <span>Du</span>
          <div className="flex items-center gap-2">
            <select value={fromDay} onChange={(e) => setFromDay(e.target.value)} className="w-16 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>JJ</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={`du-j-${i + 1}`} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select value={fromMonth} onChange={(e) => setFromMonth(e.target.value)} className="w-16 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>MM</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={`du-m-${i + 1}`} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select value={fromYear} onChange={(e) => setFromYear(e.target.value)} className="w-24 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>AAAA</option>
              {[2024, 2025, 2026].map((year) => (
                <option key={`du-y-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Au</span>
          <div className="flex items-center gap-2">
            <select value={toDay} onChange={(e) => setToDay(e.target.value)} className="w-16 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>JJ</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={`au-j-${i + 1}`} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select value={toMonth} onChange={(e) => setToMonth(e.target.value)} className="w-16 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>MM</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={`au-m-${i + 1}`} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select value={toYear} onChange={(e) => setToYear(e.target.value)} className="w-24 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
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
      <div className="flex items-center gap-20 mb-8 text-lg font-semibold text-gray-600">
        {[
          { label: "Terminées", value: "Terminees" as const, icon: CheckCircle2 },
          { label: "En attente", value: "En attente" as const, icon: Clock },
          { label: "Récupérées", value: "Recuperees" as const, icon: MapPin },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.value
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
      <div className="bg-[#e8faf3] border-2 border-gray-300 rounded-2xl overflow-hidden">
        <div className="max-h-[420px] overflow-y-auto">
          {filteredOrders.map((order, index) => (
            <div
              key={`${order.id}-${index}`}
              className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-300 last:border-b-0"
            >
              <div>
                <p className="text-base font-bold text-gray-900">
                  Commande NO {order.numero}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Étape actuelle: {timelineByOrder[order.id] ?? order.status} ({order.pharmacy})
                </p>
                <div className="text-sm text-gray-400 mt-2">
                  {order.date} &nbsp; {order.time}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {activeTab === "En attente" ? (
                  <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-600 text-sm font-semibold">
                    En attente
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-[#dff1ea] text-[#1f8a5b] text-sm font-semibold">
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
                    onClick={() => handleValidatePendingOrder(order.id)}
                    className="px-4 py-1.5 rounded-full bg-[#dff1ea] text-[#1f8a5b] text-sm font-semibold"
                  >
                    Valider
                  </button>
                )}
                {["payee", "en_preparation", "prete"].includes(order.statusKey) && (
                  <button
                    onClick={() => handleShowQr(order)}
                    disabled={loadingQrOrderId === order.id}
                    className="px-4 py-1.5 rounded-full bg-white border border-[#1f8a5b] text-[#1f8a5b] text-sm font-semibold disabled:opacity-60"
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

      {selectedQr && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">QR de retrait</h2>
            <p className="mt-1 text-sm text-gray-600">Commande NO {selectedQr.orderNumber}</p>
            {selectedQr.pharmacyName && (
              <p className="text-sm text-gray-500">{selectedQr.pharmacyName}</p>
            )}

            <div className="mt-4 rounded-xl bg-[#e8faf3] p-4 text-center">
              {selectedQr.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedQr.imageUrl}
                  alt={`QR commande ${selectedQr.orderNumber}`}
                  className="mx-auto h-52 w-52 object-contain"
                />
              ) : (
                <p className="text-sm text-gray-600">Code: {selectedQr.code}</p>
              )}
              <p className="mt-3 text-xs text-gray-500 break-all">{selectedQr.code}</p>
              {selectedQr.expiresAt && (
                <p className="mt-1 text-xs text-gray-500">
                  Expire le {new Date(selectedQr.expiresAt).toLocaleString("fr-FR")}
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedQr(null)}
                className="px-4 py-2 rounded-full bg-[#dff1ea] text-[#1f8a5b] text-sm font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
