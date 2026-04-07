"use client";

import Link from "next/link";
import { Bell, Menu, Search, User } from "lucide-react";
import { useSidebarContext } from "@/app/partenaire/_sidebar-context";

export default function PartenaireHeader() {
  const { setOpen } = useSidebarContext();

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
