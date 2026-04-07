"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Clock, CheckCircle, ChevronDown } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { extractCollection, getPartnerCommandes } from "@/lib/api/partner";
import { toast } from "sonner";

type TabKey = "a-preparer" | "en-attente" | "recuperees";

interface Order {
  id: string;
  patient: { nom: string; prenom: string };
  montant: string;
  statut: string;
}

const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const years = Array.from({ length: 10 }, (_, i) => String(2020 + i));

function DateSelect({ label, className = "", defaultDay = "", defaultMonth = "", defaultYear = "" }: { label: string; className?: string; defaultDay?: string; defaultMonth?: string; defaultYear?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-base text-gray-700 font-medium">{label}</span>

      <div className="relative">
        <select
          aria-label="Jour"
          className="appearance-none w-[68px] rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          defaultValue={defaultDay}
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
          defaultValue={defaultMonth}
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
          defaultValue={defaultYear}
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

  const tabs: { key: TabKey; label: string; icon: React.ElementType; href: string }[] = [
    { key: "a-preparer", label: "A préparer", icon: Package, href: "/partenaire/commandes" },
    { key: "en-attente", label: "En attente", icon: Clock, href: "/partenaire/commandes/en-attente" },
    { key: "recuperees", label: "Récupérées", icon: CheckCircle, href: "/partenaire/commandes/recuperees" },
  ];

  const moneyFormat = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        maximumFractionDigits: 0,
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
            patient: { nom: commande.patient?.nom ?? "", prenom: commande.patient?.prenom ?? "" },
            montant: moneyFormat.format(commande.montant_total || 0),
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
  }, [moneyFormat]);

  return (
    <>
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-8 lg:px-24 py-6 lg:py-10">
          {(() => {
            const today = new Date();
            const from = new Date(today);
            from.setMonth(from.getMonth() - 6);
            const pad = (n: number) => String(n).padStart(2, "0");
            return (
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <DateSelect
                  label="Du"
                  defaultDay={pad(from.getDate())}
                  defaultMonth={pad(from.getMonth() + 1)}
                  defaultYear={String(from.getFullYear())}
                />
                <DateSelect
                  label="Au"
                  defaultDay={pad(today.getDate())}
                  defaultMonth={pad(today.getMonth() + 1)}
                  defaultYear={String(today.getFullYear())}
                />
              </div>
            );
          })()}

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
                    if (tab.key === "recuperees") e.preventDefault();
                    setActiveTab(tab.key);
                  }}
                  className={`flex items-center justify-center gap-2 whitespace-nowrap pb-3 px-6 text-sm sm:flex-1 sm:pb-4 sm:text-base lg:text-lg font-semibold transition-colors ${
                    isActive
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
                    Montant
                  </th>
                  <th className="px-8 py-5 text-right text-sm font-bold uppercase tracking-wider text-gray-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-emerald-50/60  transition-all cursor-pointer"
                    onClick={() => router.push(`/partenaire/commandes/${order.id}?from=recuperees`)}
                  >
                    <td className="px-8 py-6 text-base font-mono text-gray-700">
                      {order.id}
                    </td>
                    <td className="px-8 py-6 text-base font-semibold text-gray-900">
                      {order.patient.nom} {order.patient.prenom}
                    </td>
                    <td className="px-8 py-6 text-base text-gray-600">
                      {order.montant}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
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
