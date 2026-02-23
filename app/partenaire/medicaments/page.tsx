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
  Upload,
  Menu,
} from "lucide-react";

/* ──────────────────────────── Types ──────────────────────────── */
type FilterKey = "tous" | "disponible" | "au-seuil" | "indisponible" | "desactives";

interface Medicine {
  id: number;
  nom: string;
  prix: string;
  statut: "Disponible" | "Au seuil" | "Indisponible" | "Désactivé";
}

/* ──────────────────────── Mock data ──────────────────────────── */
const mockMedicines: Medicine[] = [
  { id: 1, nom: "Paracétamol", prix: "10 000 XOF FCFA", statut: "Disponible" },
  { id: 2, nom: "Paracétamol", prix: "10 000 XOF FCFA", statut: "Disponible" },
  { id: 3, nom: "Paracétamol", prix: "10 000 XOF FCFA", statut: "Au seuil" },
  { id: 4, nom: "Paracétamol", prix: "10 000 XOF FCFA", statut: "Indisponible" },
  { id: 5, nom: "Paracétamol", prix: "10 000 XOF FCFA", statut: "Disponible" },
  { id: 6, nom: "Paracétamol", prix: "10 000 XOF FCFA", statut: "Désactivé" },
  { id: 7, nom: "Paracétamol", prix: "10 000 XOF FCFA", statut: "Disponible" },
];

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/commandes", active: true },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
];

/* ──────────────────────── Helpers ────────────────────────────── */
const statusStyles: Record<Medicine["statut"], string> = {
  Disponible: "bg-emerald-100 text-emerald-700",
  "Au seuil": "bg-amber-50 text-amber-600",
  Indisponible: "bg-red-100 text-red-500",
  Désactivé: "bg-gray-200 text-gray-500",
};

const filterMap: Record<FilterKey, Medicine["statut"] | null> = {
  tous: null,
  disponible: "Disponible",
  "au-seuil": "Au seuil",
  indisponible: "Indisponible",
  desactives: "Désactivé",
};

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireMedicamentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("tous");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "tous", label: "Tous" },
    { key: "disponible", label: "Disponible" },
    { key: "au-seuil", label: "Au seuil" },
    { key: "indisponible", label: "Indisponible" },
    { key: "desactives", label: "Désactivés" },
  ];

  const filteredMedicines =
    activeFilter === "tous"
      ? mockMedicines
      : mockMedicines.filter((m) => m.statut === filterMap[activeFilter]);

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
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
          {/* Action bar */}
          <div className="mb-6 flex items-center gap-2 sm:gap-4">
            <Link
              href="/partenaire/medicaments/ajouter"
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-bold text-white transition-colors hover:bg-emerald-800"
            >
              <Image
                src="/fluent.svg"
                alt="Ajouter"
                width={24}
                height={24}
              />
              Ajouter un médicament
            </Link>
            <button
              type="button"
              aria-label="Importer"
              className="flex items-center justify-center rounded-lg border border-gray-300 p-2 sm:p-3 text-emerald-700 transition-colors hover:bg-gray-50"
            >
              <Image src="/images/dossier.svg" alt="Importer" width={24} height={24} />
            </button>
            <button
              type="button"
              aria-label="Exporter"
              className="flex items-center justify-center rounded-lg border border-gray-300 p-2 sm:p-3 text-emerald-700 transition-colors hover:bg-gray-50"
            >
              <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="mb-6 flex flex-wrap gap-x-2 sm:gap-x-6 lg:gap-x-20 gap-y-3">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`rounded-full border border-emerald-600 px-4 sm:px-10 lg:px-24 py-2 text-sm sm:text-base font-bold transition-colors ${
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
                  <th className="px-3 sm:px-8 py-3 sm:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Médicament
                  </th>
                  <th className="px-3 sm:px-8 py-3 sm:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Prix unitaire
                  </th>
                  <th className="px-3 sm:px-8 py-3 sm:py-5 text-right text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => (
                  <tr
                    key={med.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-3 sm:px-8 py-3 sm:py-6">
                      <Link
                        href={`/partenaire/medicaments/${med.id}`}
                        className="text-sm sm:text-base text-gray-700"
                      >
                        {med.nom}
                      </Link>
                    </td>
                    <td className="px-3 sm:px-8 py-3 sm:py-6">
                      <Link
                        href={`/partenaire/medicaments/${med.id}`}
                        className="text-sm sm:text-base text-gray-700"
                      >
                        {med.prix}
                      </Link>
                    </td>
                    <td className="px-3 sm:px-8 py-3 sm:py-6 text-right">
                      <Link href={`/partenaire/medicaments/${med.id}`}>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[med.statut]}`}
                        >
                          {med.statut}
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
