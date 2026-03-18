"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bell, Search, ShoppingCart, ChevronDown, Menu } from "lucide-react";
import PartenaireSidebar from "@/components/partenaire/Sidebar";

/* ──────────────────────────── Types ──────────────────────────── */
interface HistoriqueEntry {
  id: number;
  titre: string;
  description: string;
  date: string;
  heure: string;
}

/* ──────────────────────── Mock data ──────────────────────────── */
const mockHistorique: HistoriqueEntry[] = [
  {
    id: 1,
    titre: "L'adressse de la pharmacie a été mis à jour",
    description:
      "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullbh.................",
    date: "14-11-2024",
    heure: "15h0",
  },
  {
    id: 2,
    titre: "L'adressse de la pharmacie a été mis à jour",
    description:
      "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullbh.................",
    date: "14-11-2024",
    heure: "15h0",
  },
  {
    id: 3,
    titre: "L'adressse de la pharmacie a été mis à jour",
    description:
      "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullbh.................",
    date: "14-11-2024",
    heure: "15h0",
  },
  {
    id: 4,
    titre: "L'adressse de la pharmacie a été mis à jour",
    description:
      "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullbh.................",
    date: "14-11-2024",
    heure: "15h0",
  },
  {
    id: 5,
    titre: "L'adressse de la pharmacie a été mis à jour",
    description:
      "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullbh.................",
    date: "14-11-2024",
    heure: "15h0",
  },
  {
    id: 6,
    titre: "L'adressse de la pharmacie a été mis à jour",
    description:
      "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullbh.................",
    date: "14-11-2024",
    heure: "15h0",
  },
  {
    id: 7,
    titre: "L'adressse de la pharmacie a été mis à jour",
    description:
      "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullbh.................",
    date: "14-11-2024",
    heure: "15h0",
  },
];


/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireHistoriquePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

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
          {/* Dropdown filtre employé */}
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-gray-300 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Nom de l&apos;employé
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Liste historique */}
          <div className="flex flex-col gap-4">
            {mockHistorique.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 sm:gap-6 rounded-2xl px-4 sm:px-6 py-4 sm:py-5"
                style={{ backgroundColor: "#f0faf5" }}
              >
                {/* Icône logo */}
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <Image
                    src="/images/logo.png"
                    alt="Toni360"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                </div>

                {/* Texte */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-bold text-gray-900">
                    {entry.titre}
                  </p>
                  <p className="mt-1 truncate text-xs sm:text-sm text-gray-500">
                    {entry.description}
                  </p>
                </div>

                {/* Date & heure */}
                <span className="shrink-0 text-xs sm:text-sm font-medium text-gray-500">
                  {entry.date}&nbsp;&nbsp;{entry.heure}
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

