"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Pill,
  History,
  HelpCircle,
  LogOut,
  Bell,
  User,
  Search,
  Package,
  Clock,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

/* ──────────────────────────── Types ──────────────────────────── */
type TabKey = "a-preparer" | "en-attente" | "recuperees";

interface Order {
  id: string;
  patient: string;
  date: string;
  statut: string;
}

/* ──────────────────────── Mock data ──────────────────────────── */
const mockOrders: Order[] = Array.from({ length: 7 }, () => ({
  id: "527785445666",
  patient: "Djibril Mohamed",
  date: "20-09-2024",
  statut: "À préparer",
}));

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/dashboard", active: true },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
];

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
  const [activeTab, setActiveTab] = useState<TabKey>("a-preparer");

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "a-preparer", label: "A préparer", icon: Package },
    { key: "en-attente", label: "En attente", icon: Clock },
    { key: "recuperees", label: "Récupérées", icon: CheckCircle },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* ───────────── SIDEBAR ───────────── */}
      <aside className="flex w-[260px] flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex h-20 items-center px-5">
          <Link href="/partenaire/dashboard" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Toni 360°"
              width={180}
              height={56}
              priority
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 pt-4" aria-label="Navigation partenaire">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-4 text-base font-medium transition-colors ${
                  item.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-6 w-6 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Déconnexion */}
          <Link
            href="#"
            className="mb-6 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Déconnexion
          </Link>
        </nav>
      </aside>

      {/* ───────────── MAIN AREA ──────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── HEADER ─── */}
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8">
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
            <button
              type="button"
              aria-label="Voir les notifications"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-6 py-3 text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Notifications
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Accéder à mon compte"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-6 py-3 text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Mon Compte
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-20 py-10">
          {/* Date filters */}
          <div className="mb-6 flex flex-wrap items-center">
            <div className="flex items-center gap-2 pr-[32rem]">
              <DateSelect label="Du" />
            </div>
            <div className="flex items-center gap-2 pl-[32rem]">
              <DateSelect label="Au" />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-0 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 pb-5 px-44 text-lg font-semibold transition-colors ${
                    isActive
                      ? "border-b-4 border-emerald-600 text-emerald-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-7 w-7" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full table-auto text-base">
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
                {mockOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/40 transition-colors"
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
          </div>
        </main>
      </div>
    </div>
  );
}