"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bell, Search, ShoppingCart, Upload, Menu } from "lucide-react";
import PartenaireSidebar from "@/components/partenaire/Sidebar";

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
  const [search, setSearch] = useState("");

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
