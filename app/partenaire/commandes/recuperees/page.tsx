"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Clock, CheckCircle, ChevronDown } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { extractCollection, getPartnerCommandes } from "@/lib/api/partner";
import { useHeaderSearch } from "@/app/partenaire/_header-search-context";
import { toast } from "sonner";

type TabKey = "a-preparer" | "en-attente" | "recuperees";

function getStatusBadgeStyle(statut: string): React.CSSProperties {
  const s = statut.toLowerCase();
  if (s.includes("attente"))
    return { backgroundColor: "#FFF4C7", color: "#B8A659" };
  if (s.includes("récupérée") || s.includes("recuperee"))
    return { backgroundColor: "#D1FAE5", color: "#065F46" };
  if (s.includes("prête") || s.includes("prete"))
    return { backgroundColor: "#FEF3C7", color: "#D97706" };
  return { backgroundColor: "#FFF4C7", color: "#B8A659" };
}

interface Order {
  id: string;
  numero_commande: string;
  patient: { nom: string; prenom: string };
  montant: string;
  date: string;
  statut: string;
}

const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const years = Array.from({ length: 10 }, (_, i) => String(2020 + i));

function DateSelect({ label, className = "", day = "", month = "", year = "", onDayChange, onMonthChange, onYearChange }: { label: string; className?: string; day?: string; month?: string; year?: string; onDayChange?: (v: string) => void; onMonthChange?: (v: string) => void; onYearChange?: (v: string) => void }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-base text-gray-700 font-medium">{label}</span>

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

export default function PartenaireRecupereesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("recuperees");
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

  const tabs: { key: TabKey; label: string; img: string; href: string }[] = [
    { key: "a-preparer", label: "A préparer", img: "/preparer_vert.svg", href: "/partenaire/commandes" },
    { key: "en-attente", label: "En attente", img: "/images/localiser.svg", href: "/partenaire/commandes/en-attente" },
    { key: "recuperees", label: "Récupérées", img: "/images/terminee.svg", href: "/partenaire/commandes/recuperees" },
  ];

  const moneyFormat = useMemo(
    () => ({
      format: (value: number) =>
        new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " FCFA",
    }),
    [],
  );

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
        const response = await getPartnerCommandes(session.token, { statut: "RECUPEREE", per_page: 100 });
        const commandes = extractCollection(response.data);

        setOrders(
          commandes.map((commande) => ({
            id: commande.id,
            numero_commande: commande.numero_commande ?? commande.id,
            patient: { nom: commande.patient?.nom ?? "", prenom: commande.patient?.prenom ?? "" },
            montant: moneyFormat.format(commande.montant_total || 0),
            date: commande.created_at ? formatDate.format(new Date(commande.created_at)) : "-",
            statut: commande.statut_label || "Récupérée",
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
  }, [moneyFormat, formatDate]);

  const { searchQuery } = useHeaderSearch();

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      if (q) {
        const matchSearch =
          order.numero_commande.toLowerCase().includes(q) ||
          order.patient.nom.toLowerCase().includes(q) ||
          order.patient.prenom.toLowerCase().includes(q);
        if (!matchSearch) return false;
      }
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
    });
  }, [orders, searchQuery, fromDay, fromMonth, fromYear, toDay, toMonth, toYear]);

  return (
    <>
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
            />
            <DateSelect
              label="Au"
              day={toDay}
              month={toMonth}
              year={toYear}
              onDayChange={setToDay}
              onMonthChange={setToMonth}
              onYearChange={setToYear}
            />
          </div>

          <div className="mb-6 border-b border-gray-200 overflow-x-auto max-w-full">
            <div className="flex w-max sm:w-full">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  onClick={(e) => {
                    if (tab.key === "recuperees") e.preventDefault();
                    setActiveTab(tab.key);
                  }}
                  className={`flex items-center justify-center gap-2 whitespace-nowrap pb-3 px-6 text-sm sm:flex-1 sm:pb-4 sm:text-base lg:text-lg font-semibold transition-colors ${
                    isActive
                      ? "border-b-4 border-emerald-600 text-emerald-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <img src={tab.img} alt={tab.label} className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
            </div>
          </div>

          {isLoading ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <div className="px-8 py-8 text-sm text-gray-500">Chargement des commandes...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex items-center justify-center min-h-[calc(100vh-320px)]">
              <div className="flex flex-col items-center justify-center">
                <CheckCircle size={120} className="text-gray-400 mb-8" />
                <p className="text-2xl text-gray-500 text-center">Aucune commande récupérée</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
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
                    Montant
                  </th>
                  <th className="px-8 py-5 text-right text-sm font-bold uppercase tracking-wider text-gray-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-emerald-50/60  transition-all cursor-pointer"
                    onClick={() => router.push(`/partenaire/commandes/${order.id}?from=recuperees`)}
                  >
                    <td className="px-8 py-6 text-base font-mono text-gray-700">
                      {order.numero_commande}
                    </td>
                    <td className="px-8 py-6 text-base font-semibold text-gray-900">
                      {order.patient.nom} {order.patient.prenom}
                    </td>
                    <td className="px-8 py-6 text-base text-gray-600">
                      {order.montant}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-block rounded-full px-3 py-1 text-sm font-semibold" style={getStatusBadgeStyle(order.statut)}>
                        {order.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </main>
    </>
  );
}
