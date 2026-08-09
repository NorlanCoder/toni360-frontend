"use client";

import Link from "next/link";
import { Bell, Menu, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebarContext } from "@/app/partenaire/_sidebar-context";
import { useHeaderSearch } from "@/app/partenaire/_header-search-context";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/api/session";
import { getPartnerNotificationCount } from "@/lib/api/partner";

const noopSubscribe = () => () => {};

// Hydratation-safe : `false` pendant le rendu serveur, `true` une fois monté côté client.
function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export default function PartenaireHeader() {
  const { setOpen } = useSidebarContext();
  const { showSearch, searchQuery, setSearchQuery, searchPlaceholder } = useHeaderSearch();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isCommandesPage = pathname.startsWith("/partenaire/commandes");
  const visibleSearch = isCommandesPage || showSearch;

  useEffect(() => {
    if (visibleSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [visibleSearch]);

  const session = useMemo(() => getAuthSession(), []);
  const profile = session?.profile as { prenom?: string; nom?: string } | null;
  const displayName = profile?.nom || profile?.prenom || "";
  const showWelcome = pathname === "/partenaire/dashboard";
  const [notifCount, setNotifCount] = useState(0);
  const router = useRouter();

  // Évite d'afficher "Bienvenue" sans nom pendant l'hydratation côté client
  // (la session est lue depuis le localStorage, indisponible côté serveur).
  const mounted = useMounted();

  useEffect(() => {
    if (!session?.token) return;
    const token = session.token;

    const fetchCount = async () => {
      try {
        const res = await getPartnerNotificationCount(token);
        setNotifCount(res.data.non_lues ?? res.data.total_non_lues ?? 0);
      } catch {
        // silently ignore
      }
    };

    void fetchCount();
    const id = setInterval(() => void fetchCount(), 60_000);
    return () => clearInterval(id);
  }, [session?.token]);

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

      {/* Welcome / Search slot */}
      <div className="min-w-0 flex-1">
        {visibleSearch ? (
          <div className="relative flex max-w-xl items-center">
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchQuery("");
                }
              }}
              placeholder={searchPlaceholder}
              className="h-12 w-full rounded-full bg-gray-100 py-3 pl-4 pr-14 text-base text-gray-700 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-toni-green-dark-2"
            />
            <button
              type="button"
              aria-label="Lancer la recherche"
              className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full bg-toni-green-dark-2 text-white"
            >
              <Search size={18} />
            </button>
          </div>
        ) : (
          showWelcome && (
            <h1 className="truncate text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-3xl">
              Bienvenue
              {!mounted ? (
                <>
                  ,{" "}
                  <span className="inline-block h-[1em] w-28 animate-pulse rounded-md bg-gray-200 align-middle sm:w-36" />
                </>
              ) : displayName ? (
                `, Dr. ${displayName}`
              ) : null}
            </h1>
          )
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          href="/partenaire/notifications"
          aria-label="Voir les notifications"
          className="flex items-center gap-2 rounded-full border-2 border-toni-green-dark-2 px-3 sm:px-5 py-2 text-sm sm:text-base font-bold text-toni-green-dark-2 transition hover:bg-[#E6F6F0]"
        >
          <Bell className="h-5 w-5" />
          <span className="hidden sm:inline">Notifications</span>
          {notifCount > 0 && (
            <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
              {notifCount > 99 ? "99+" : notifCount}
            </span>
          )}
        </Link>
        <Link
          href="/partenaire/profil"
          aria-label="Accéder à mon compte"
          className="flex items-center gap-2 rounded-full border-2 border-toni-green-dark-2 px-3 sm:px-5 py-2 text-sm sm:text-base font-bold text-toni-green-dark-2 transition hover:bg-[#E6F6F0]"
        >
          <User className="h-5 w-5" />
          <span className="hidden sm:inline">Mon Compte</span>
        </Link>
      </div>
    </header>
  );
}
