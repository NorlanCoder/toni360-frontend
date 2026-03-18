"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bell, Search, ShoppingCart, Package, Clock, CheckCircle, ChevronDown, Menu } from "lucide-react";
import PartenaireSidebar from "@/components/partenaire/Sidebar";

type TabKey = "a-preparer" | "en-attente" | "recuperees";

interface Order {
  id: string;
  patient: string;
  montant: string;
  statut: string;
}

const mockOrders: Order[] = Array.from({ length: 7 }, () => ({
  id: "527785445666",
  patient: "Djibril Mohamed",
  montant: "10 000 XOF",
  statut: "Récupérée",
}));

const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const years = Array.from({ length: 10 }, (_, i) => String(2020 + i));

function DateSelect({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-base text-gray-700 font-medium">{label}</span>

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

export default function PartenaireRecupereesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("recuperees");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const tabs: { key: TabKey; label: string; icon: React.ElementType; href: string }[] = [
    { key: "a-preparer", label: "A préparer", icon: Package, href: "/partenaire/commandes" },
    { key: "en-attente", label: "En attente", icon: Clock, href: "/partenaire/commandes/en-attente" },
    { key: "recuperees", label: "Récupérées", icon: CheckCircle, href: "/partenaire/commandes/recuperees" },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <PartenaireSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between px-8 pt-16 pb-6 border-b-2 border-gray-300">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="flex shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="relative flex-1 max-w-xl ml-10">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un médicament..."
              className="w-full pl-5 pr-12 py-3.5 rounded-full border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-gray-700"
            />
            <button className="absolute right-0 top-0 bottom-0 px-4 bg-toni-green-dark-2 rounded-r-full flex items-center justify-center text-white hover:bg-toni-green-dark transition">
              <Search size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 -translate-x-12">
            <Link
              href="#"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-toni-green-dark-2 text-toni-green-dark-2 text-base font-semibold hover:bg-toni-green-light transition"
            >
              <Bell size={16} />
              Notifications
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-toni-green-dark-2 text-toni-green-dark-2 text-base font-semibold hover:bg-toni-green-light transition"
            >
              <ShoppingCart size={16} />
              Mon Panier
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-24 py-6 lg:py-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DateSelect label="Du" />
            <DateSelect label="Au" />
          </div>

          <div className="mb-6 flex gap-0 border-b border-gray-200">
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
                {mockOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-emerald-50/60 hover:border-l-4 hover:border-l-emerald-500 transition-all cursor-pointer"
                    onClick={() => window.location.href = `/partenaire/commandes/${order.id}?from=recuperees`}
                  >
                    <td className="px-8 py-6 text-base font-mono text-gray-700">
                      {order.id}
                    </td>
                    <td className="px-8 py-6 text-base font-semibold text-gray-900">
                      {order.patient}
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
          </div>
        </main>
      </div>
    </div>
  );
}
