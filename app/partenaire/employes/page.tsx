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
  ChevronDown,
  Menu,
} from "lucide-react";

/* ──────────────────────────── Types ──────────────────────────── */
type FilterKey = "tous" | "disponible" | "au-seuil" | "indisponible" | "desactives";

interface Employee {
  id: number;
  nom: string;
  role: "Pharmacien" | "Assistant pharmacien";
  statut: "Actif" | "Désactivé" | "Inactif";
}

/* ──────────────────────── Mock data ──────────────────────────── */
const mockEmployees: Employee[] = [
  { id: 1, nom: "Luc ASSOGBA", role: "Pharmacien", statut: "Actif" },
  { id: 2, nom: "Luc ASSOGBA", role: "Assistant pharmacien", statut: "Désactivé" },
  { id: 3, nom: "Luc ASSOGBA", role: "Pharmacien", statut: "Actif" },
  { id: 4, nom: "Luc ASSOGBA", role: "Pharmacien", statut: "Actif" },
  { id: 5, nom: "Luc ASSOGBA", role: "Assistant pharmacien", statut: "Inactif" },
  { id: 6, nom: "Luc ASSOGBA", role: "Assistant pharmacien", statut: "Désactivé" },
  { id: 7, nom: "Luc ASSOGBA", role: "Assistant pharmacien", statut: "Désactivé" },
  { id: 8, nom: "Luc ASSOGBA", role: "Assistant pharmacien", statut: "Inactif" },
];

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/commandes" },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes", active: true },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
];

/* ──────────────────────── Helpers ────────────────────────────── */
const statusStyles: Record<Employee["statut"], string> = {
  Actif: "bg-emerald-100 text-emerald-700",
  Désactivé: "bg-gray-400 text-white",
  Inactif: "bg-red-200 text-red-600",
};

const filterMap: Record<FilterKey, Employee["statut"] | null> = {
  tous: null,
  disponible: "Actif",
  "au-seuil": "Inactif",
  indisponible: "Désactivé",
  desactives: "Désactivé",
};

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireEmployesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("tous");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "tous", label: "Tous" },
    { key: "disponible", label: "Disponible" },
    { key: "au-seuil", label: "Au seuil" },
    { key: "indisponible", label: "Indisponible" },
    { key: "desactives", label: "Désactivés" },
  ];

  const filteredEmployees =
    activeFilter === "tous"
      ? mockEmployees
      : mockEmployees.filter((e) => e.statut === filterMap[activeFilter]);

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
          <div className="relative min-w-0 flex-1 max-w-lg">
            <Search className="absolute left-3 sm:left-5 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médicament"
              className="w-full rounded-full border-0 bg-emerald-50/60 py-2 sm:py-3 pl-9 sm:pl-14 pr-3 sm:pr-4 text-sm sm:text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
          {/* Action bar */}
          <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4">
            <Link
              href="/partenaire/employes/ajouter"
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-bold text-white transition-colors hover:bg-emerald-800"
            >
              <Image
                src="/fluent.svg"
                alt="Ajouter"
                width={24}
                height={24}
              />
              Ajouter un employé
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-gray-300 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Gérer les permissions
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="mb-6 flex flex-wrap gap-2 sm:gap-x-4 lg:gap-x-8 gap-y-2 sm:gap-y-3">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`rounded-full border border-emerald-600 px-3 sm:px-6 lg:px-10 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base font-bold transition-colors ${
                    isActive
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-[520px] w-full table-auto text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Nom
                  </th>
                  <th className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Rôle
                  </th>
                  <th className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-5 text-right text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, index) => (
                  <tr
                    key={emp.id}
                    className={`border-b border-gray-200 last:border-b-0 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6">
                      <Link
                        href={`/partenaire/employes/${emp.id}`}
                        className="text-xs sm:text-sm md:text-base text-gray-700"
                      >
                        {emp.nom}
                      </Link>
                    </td>
                    <td className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6">
                      <Link
                        href={`/partenaire/employes/${emp.id}`}
                        className="text-xs sm:text-sm md:text-base text-gray-700"
                      >
                        {emp.role}
                      </Link>
                    </td>
                    <td className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6 text-right">
                      <Link href={`/partenaire/employes/${emp.id}`}>
                        <span
                          className={`inline-block rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold ${statusStyles[emp.statut]}`}
                        >
                          {emp.statut}
                        </span>
                      </Link>
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

