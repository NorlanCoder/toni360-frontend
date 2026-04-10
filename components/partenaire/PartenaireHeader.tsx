"use client";

import Link from "next/link";
import { Bell, Menu, User } from "lucide-react";
import { useSidebarContext } from "@/app/partenaire/_sidebar-context";
import { useMemo } from "react";
import { getAuthSession } from "@/lib/api/session";

export default function PartenaireHeader() {
  const { setOpen } = useSidebarContext();
  const session = useMemo(() => getAuthSession(), []);
  const profile = session?.profile as { prenom?: string; nom?: string } | null;
  const displayName = profile?.prenom || profile?.nom || "";

  return (
    <header className="flex h-20 lg:h-24 shrink-0 items-center gap-3 justify-between  bg-white px-4 md:px-8">
      {/* Hamburger (mobile) */}
      <button
        type="button"
        aria-label="Ouvrir le menu"
        className="flex shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Welcome */}
      <div className="min-w-0 flex-1">
        <p className="text-base sm:text-xl font-semibold text-gray-800 truncate">
          Bienvenu{displayName ? `, ${displayName}` : ""} 👋
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          href="/partenaire/notifications"
          aria-label="Voir les notifications"
          className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-5 py-2  text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          <span className="hidden sm:inline">Notifications</span>
          <Bell className="h-5 w-5" />
        </Link>
        <Link
          href="/partenaire/profil"
          aria-label="Accéder à mon compte"
          className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-5 py-2  text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          <span className="hidden sm:inline">Mon Compte</span>
          <User className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
