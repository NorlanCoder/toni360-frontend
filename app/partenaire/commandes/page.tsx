"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, Search, Package, Clock, CheckCircle, ChevronDown, Menu } from "lucide-react";
import PartenaireSidebar from "@/components/partenaire/Sidebar";
import { getAuthSession } from "@/lib/api/session";
import { extractCollection, getPartnerCommandes, PartnerCommande } from "@/lib/api/partner";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";

/* ──────────────────────────── Types ──────────────────────────── */
type TabKey = "a-preparer" | "en-attente" | "recuperees";

interface Order {
  id: string;
  patient: string;
  date: string;
  statut: string;
}

const A_PREPARER_STATUTS = new Set([
  "EN_ATTENTE_ORDONNANCE",
  "ORDONNANCE_EN_VERIFICATION",
  "ORDONNANCE_VALIDEE",
  "ORDONNANCE_REJETEE",
  "EN_ATTENTE_PAIEMENT",
  "PAYEE",
  "EN_PREPARATION",
]);


/* ──────────────────────── Helpers ────────────────────────────── */
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const years = Array.from({ length: 10 }, (_, i) => String(2020 + i));

function DateSelect({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-base text-gray-700 font-medium">{label}</span>

      {/* JJ */}
      <div className="relative">
        <select
          aria-label="Jour"
          className="appearance-none w-[68px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          defaultValue=""
        >
          <option value="" disabled>JJ</option>
          {days.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
      </div>

      {/* MM */}
      <div className="relative">
        <select
          aria-label="Mois"
          className="appearance-none w-[72px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          defaultValue=""
        >
          <option value="" disabled>MM</option>
          {months.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
      </div>

      {/* AAAA */}
      <div className="relative">
        <select
          aria-label="Année"
          className="appearance-none w-[88px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          defaultValue=""
        >
          <option value="" disabled>AAAA</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
      </div>
    </div>
  );
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("a-preparer");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs: { key: TabKey; label: string; icon: React.ElementType; href: string }[] = [
    { key: "a-preparer", label: "A préparer", icon: Package, href: "/partenaire/commandes" },
    { key: "en-attente", label: "En attente", icon: Clock, href: "/partenaire/commandes/en-attente" },
    { key: "recuperees", label: "Récupérées", icon: CheckCircle, href: "/partenaire/commandes/recuperees" },
  ];

  const formatDate = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [],
  );

  useEffect(() => {
    const loadOrders = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPartnerCommandes(session.token, { per_page: 200 });
        const allCommandes = extractCollection(response.data);
        const combined: PartnerCommande[] = allCommandes.filter((commande) => A_PREPARER_STATUTS.has(commande.statut));

        combined.sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0;
          const db = b.created_at ? new Date(b.created_at).getTime() : 0;
          return db - da;
        });

        setOrders(
          combined.map((commande) => ({
            id: commande.id,
            patient: commande.patient?.nom_complet ?? "Patient inconnu",
            date: commande.created_at
              ? formatDate.format(new Date(commande.created_at))
              : "-",
            statut: commande.statut_label || "À préparer",
          })),
        );
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger les commandes.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();

    const intervalId = setInterval(() => {
      void loadOrders();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [formatDate]);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <PartenaireSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ───────────── MAIN AREA ──────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── HEADER ─── */}
        <header className="flex h-20 lg:h-24 shrink-0 items-center gap-3 justify-between border-b border-gray-200 bg-white px-4 md:px-8">
          {/* Hamburger (mobile) */}
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="flex shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médicament"
              className="w-full rounded-full border-0 bg-emerald-50/60 py-3 pl-14 pr-4 text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/partenaire/notifications"
              aria-label="Voir les notifications"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Notifications</span>
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              href="/partenaire/profil"
              aria-label="Accéder à mon compte"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Mon Compte</span>
              <User className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-24 py-6 lg:py-10">
          {/* Date filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DateSelect label="Du" />
            <DateSelect label="Au" />
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-0 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  onClick={(e) => {
                    if (tab.key === "a-preparer") e.preventDefault();
                    setActiveTab(tab.key);
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap pb-4 px-2 text-sm sm:text-base lg:text-lg font-semibold transition-colors ${
                    isActive
                      ? "border-b-4 border-emerald-600 text-emerald-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-7 w-7" />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            {isLoading ? (
              <div className="px-8 py-8 text-sm text-gray-500">Chargement des commandes...</div>
            ) : (
            <table className="min-w-[520px] w-full table-auto text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider text-gray-600">
                    ID de commande
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider text-gray-600">
                    Patient
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider text-gray-600">
                    Date
                  </th>
                  <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider text-gray-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-emerald-50/60 hover:border-l-4 hover:border-l-emerald-500 transition-all cursor-pointer"
                    onClick={() => router.push(`/partenaire/commandes/${order.id}`)}
                  >
                    <td className="px-8 py-6 text-base font-mono text-gray-700">
                      {order.id}
                    </td>
                    <td className="px-8 py-6 text-base font-semibold text-gray-900">
                      {order.patient}
                    </td>
                    <td className="px-8 py-6 text-base text-gray-600">
                      {order.date}
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-block rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">
                        {order.statut}
                      </span>
                    </td>
                  </tr>
                  ))}
              </tbody>
            </table>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}