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
  Menu,
} from "lucide-react";

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/commandes", active: true },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
];

/* ──────────────────── Mock data ─────────────────────────────── */
const orderInfo = {
  id: "CMD 254-656",
  patient: "Franck Aissi",
  telephone: "+229 01 00 00 00 00",
  commandeeLe: "12-25-2024 à 10h00",
  recupereeLe: "12-25-2024 à 10h00",
  modeRecuperation: "Récupération en pharmacie (présentation physique)",
};

const orderItems = Array.from({ length: 5 }, () => ({
  medicament: "Paracétamol 500 mg",
  qte: "02",
  pu: "100 XOF CFA",
  total: "1000 XOF CFA",
}));

const montantTotal = "50 000 XOF";

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireCommandeRecupereeDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* ───────────── MOBILE OVERLAY ───────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ───────────── SIDEBAR ───────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:relative lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center px-5">
          <Link href="/partenaire/commandes" className="flex items-center gap-2">
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
        <header className="flex h-16 lg:h-20 shrink-0 items-center gap-3 justify-between border-b border-gray-200 bg-white px-4 md:px-8">
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
            <button
              type="button"
              aria-label="Voir les notifications"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Notifications</span>
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Accéder à mon compte"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Mon Compte</span>
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-12 lg:py-20">
          {/* Page title */}
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            Détails de la commande{" "}
            <span className="font-normal text-gray-500">{orderInfo.id}</span>
          </h1>

          {/* ─── Info Card ─── */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-0">
              {/* Left column */}
              <div className="flex-1 space-y-1">
                <p className="text-sm text-gray-500">
                  Patient : <span className="font-semibold text-gray-900">{orderInfo.patient}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Téléphone : <span className="font-semibold text-gray-900">{orderInfo.telephone}</span>
                </p>
              </div>

              {/* Center column */}
              <div className="flex-1 space-y-1">
                <p className="text-sm text-gray-500">
                  Commandée le : <span className="font-semibold text-gray-900">{orderInfo.commandeeLe}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Récupérée  le : <span className="font-semibold text-gray-900">{orderInfo.recupereeLe}</span>
                </p>
              </div>

              {/* Right column — payment method */}
              <div className="flex flex-col items-center lg:items-end lg:border-l lg:border-gray-200 lg:pl-6">
                <span className="mb-1 text-xs text-gray-400">Méthode de paiement</span>
                <Image
                  src="/images/momo.jpg"
                  alt="MoMo from MTN"
                  width={100}
                  height={48}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Mode de récupération */}
            <p className="mt-4 text-sm text-emerald-700 font-medium">
              Mode de récupération :{" "}
              <span className="font-normal text-gray-700">{orderInfo.modeRecuperation}</span>
            </p>
          </div>

          {/* ─── Medications Table ─── */}
          <div className="overflow-x-auto rounded-lg bg-white">
            <table className="min-w-[520px] w-full table-auto text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600">
                    Médicament
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600">
                    Qte
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600">
                    P.U.
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 last:border-b-0"
                  >
                    <td className="px-4 sm:px-12 py-4 text-sm sm:text-base text-gray-700">
                      {item.medicament}
                    </td>
                    <td className="px-4 sm:px-12 py-4 text-sm sm:text-base text-gray-700">
                      {item.qte}
                    </td>
                    <td className="px-4 sm:px-12 py-4 text-sm sm:text-base text-gray-700">
                      {item.pu}
                    </td>
                    <td className="px-4 sm:px-12 py-4 text-right text-sm sm:text-base text-gray-700">
                      {item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ─── Total Row ─── */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 px-6 py-5">
            <span className="text-xl font-bold text-gray-900">Montant total</span>
            <span className="text-xl font-bold text-gray-900">{montantTotal}</span>
          </div>
        </main>
      </div>
    </div>
  );
}

