"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Clock, CheckCircle, ChevronDown } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import { extractCollection, getPartnerCommandes, PartnerCommande } from "@/lib/api/partner";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";

/* ──────────────────────────── Types ──────────────────────────── */
type TabKey = "a-preparer" | "en-attente" | "recuperees";

interface Order {
  id: string;
  patient: { nom: string; prenom: string };
  date: string;
  statut: string;
}

const A_PREPARER_STATUTS = new Set([
  // "EN_ATTENTE_ORDONNANCE",
  // "ORDONNANCE_EN_VERIFICATION",
  // "ORDONNANCE_VALIDEE",
  // "ORDONNANCE_REJETEE",
  // "EN_ATTENTE_PAIEMENT",
  "PAYEE",
  "EN_PREPARATION",
  "EN_COURS",
]);


/* ──────────────────────── Helpers ────────────────────────────── */
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const years = Array.from({ length: 10 }, (_, i) => String(2020 + i));

function DateSelect({
  label,
  className = "",
  day = "",
  month = "",
  year = "",
  onDayChange,
  onMonthChange,
  onYearChange,
}: {
  label: string;
  className?: string;
  day?: string;
  month?: string;
  year?: string;
  onDayChange?: (v: string) => void;
  onMonthChange?: (v: string) => void;
  onYearChange?: (v: string) => void;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-base text-gray-700 font-medium">{label}</span>

      {/* JJ */}
      <div className="relative">
        <select
          aria-label="Jour"
          className="appearance-none w-[68px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          value={day}
          onChange={(e) => onDayChange?.(e.target.value)}
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
          value={month}
          onChange={(e) => onMonthChange?.(e.target.value)}
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
          value={year}
          onChange={(e) => onYearChange?.(e.target.value)}
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [fromDay, setFromDay] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return String(d.getDate()).padStart(2, "0");
  });
  const [fromMonth, setFromMonth] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return String(d.getMonth() + 1).padStart(2, "0");
  });
  const [fromYear, setFromYear] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return String(d.getFullYear());
  });
  const [toDay, setToDay] = useState<string>(() => String(new Date().getDate()).padStart(2, "0"));
  const [toMonth, setToMonth] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, "0"));
  const [toYear, setToYear] = useState<string>(() => String(new Date().getFullYear()));

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
            patient: { nom: commande.patient?.nom ?? "", prenom: commande.patient?.prenom ?? "" },
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

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (order.date === "-") return true;
        const parts = order.date.split("/");
        if (parts.length !== 3) return true;
        const [dd, mm, yyyy] = parts;
        const orderDate = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
        if (fromDay && fromMonth && fromYear) {
          const fromDate = new Date(`${fromYear}-${fromMonth}-${fromDay}T00:00:00`);
          if (orderDate < fromDate) return false;
        }
        if (toDay && toMonth && toYear) {
          const toDate = new Date(`${toYear}-${toMonth}-${toDay}T23:59:59`);
          if (orderDate > toDate) return false;
        }
        return true;
      }),
    [orders, fromDay, fromMonth, fromYear, toDay, toMonth, toYear],
  );

  return (
    <>
      {/* ─── CONTENT ─── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 lg:px-24 py-6 lg:py-10">
        {/* Date filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <DateSelect
            label="Du"
            day={fromDay}
            month={fromMonth}
            year={fromYear}
            onDayChange={setFromDay}
            onMonthChange={setFromMonth}
            onYearChange={setFromYear}
            className="w-full sm:w-auto"
          />
          <DateSelect
            label="Au"
            day={toDay}
            month={toMonth}
            year={toYear}
            onDayChange={setToDay}
            onMonthChange={setToMonth}
            onYearChange={setToYear}
            className="w-full sm:w-auto"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto max-w-full">
          <div className="flex w-max sm:w-full">
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
                  className={`flex items-center justify-center gap-2 whitespace-nowrap pb-3 px-6 text-sm sm:flex-1 sm:pb-4 sm:text-base lg:text-lg font-semibold transition-colors ${isActive
                      ? "border-b-4 border-emerald-600 text-emerald-700"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          {isLoading ? (
            <div className="px-8 py-8 text-sm text-gray-500">Chargement des commandes...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-8 py-8 text-sm text-gray-500">Aucune commande à préparer.</div>
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
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-emerald-50/60 transition-all cursor-pointer"
                    onClick={() => router.push(`/partenaire/commandes/${order.id}`)}
                  >
                    <td className="px-8 py-6 text-base font-mono text-gray-700">
                      {order.id}
                    </td>
                    <td className="px-8 py-6 text-base font-semibold text-gray-900">
                      {order.patient.nom} {order.patient.prenom}
                    </td>
                    <td className="px-8 py-6 text-base text-gray-600">
                      {order.date}
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
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
    </>
  );
}