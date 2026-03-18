"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bell, Search, ShoppingCart, ChevronDown, Menu } from "lucide-react";
import PartenaireSidebar from "@/components/partenaire/Sidebar";

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
  const [search, setSearch] = useState("");

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
      <PartenaireSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ───────────── MAIN AREA ──────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── HEADER ─── */}
        <header className="flex items-center justify-between px-8 pt-16 pb-6 border-b-2 border-gray-300">
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

          {/* Actions */}
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

