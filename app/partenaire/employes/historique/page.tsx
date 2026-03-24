"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Boxes,
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
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { extractCollection, getPartnerNotifications } from "@/lib/api/partner";
import { toast } from "sonner";

/* ──────────────────────────── Types ──────────────────────────── */
interface HistoriqueEntry {
  id: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
}

/* ──────────────────────── Mock data ──────────────────────────── */
const mockHistorique: HistoriqueEntry[] = [];

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/dashboard" },
  { label: "Gestion de commande", icon: Package, href: "/partenaire/commandes" },
  { label: "Gestion de Stocks", icon: Boxes, href: "/partenaire/stocks" },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique", active: true },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
];

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireHistoriquePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entries, setEntries] = useState<HistoriqueEntry[]>(mockHistorique);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistorique = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPartnerNotifications(session.token, 100);
        const notifications = extractCollection(response.data.notifications);
        setEntries(
          notifications.map((notification) => {
            const created = notification.created_at ? new Date(notification.created_at) : null;
            return {
              id: notification.id,
              titre: notification.titre,
              description: notification.message,
              date: created ? created.toLocaleDateString("fr-FR") : "-",
              heure: created
                ? created.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                : "-",
            };
          }),
        );
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger l'historique.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistorique();
  }, []);

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
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
            href="/partenaire/deconnexion"
            className="mb-6 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Déconnexion
          </Link>
        </nav>
      </aside>

      {/* ───────────── MAIN AREA ──────────── */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-[260px]">
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
            <Link
              href="/partenaire/notifications"
              aria-label="Voir les notifications"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Notifications</span>
              <Bell className="h-5 w-5" />
            </Link>
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
            {isLoading ? (
              <div className="rounded-xl border border-gray-200 px-4 py-4 text-sm text-gray-500">Chargement de l'historique...</div>
            ) : entries.map((entry) => (
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

