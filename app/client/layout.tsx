"use client";

import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  HelpCircle,
  Home,
  ListOrdered,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { getProductSuggestions } from "@/lib/api/client";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";
import { PiListChecks } from "react-icons/pi";


const navItems = [
  { label: "Accueil", href: "/client/accueil", icon: Home },
  { label: "Mon compte", href: "/client/profil", icon: User },
  { label: "Mes commandes", href: "/client/orders", icon: PiListChecks },
  { label: "Notifications", href: "/client/notifications", icon: Bell },
  { label: "Mon Panier", href: "/client/dashboard/cart", icon: ShoppingCart },
  { label: "Centre d'aide", href: "/faq", icon: HelpCircle },
  { label: "Déconnexion", href: "/client/deconnexion", icon: LogOut },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicClientPage =
    pathname.startsWith("/client/connexion") || pathname.startsWith("/client/inscription");

  useEffect(() => {
    if (isPublicClientPage) {
      return;
    }

    const session = getAuthSession();
    if (!session || session.userType !== "patient" || !session.token) {
      clearAuthSession();
      router.replace("/client/connexion");
    }
  }, [isPublicClientPage, router]);

  useEffect(() => {
    if (isPublicClientPage) {
      return;
    }

    const term = search.trim();
    if (!term) {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    const session = getAuthSession();
    if (!session || session.userType !== "patient" || !session.token) {
      return;
    }

    let active = true;
    const timeout = setTimeout(async () => {
      try {
        const response = await getProductSuggestions(session.token, term);
        if (!active) {
          return;
        }
        setSuggestions(response.data.suggestions);
        setShowSuggestions(response.data.suggestions.length > 0);
        setActiveSuggestionIndex(-1);
      } catch {
        if (!active) {
          return;
        }
        setSuggestions([]);
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [isPublicClientPage, search]);

  if (isPublicClientPage) {
    return <>{children}</>;
  }

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = search.trim();
    if (!term) {
      return;
    }

    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    router.push(`/client/dashboard/cart?q=${encodeURIComponent(term)}&auto=1`);
  };

  const handleSuggestionClick = (value: string) => {
    setSearch(value);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    router.push(`/client/dashboard/cart?q=${encodeURIComponent(value)}&auto=1`);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
      event.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestionIndex]);
      return;
    }

    if (event.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white font-sans lg:flex-row">

      {/* ── Drawer mobile (slide depuis la gauche) ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panneau */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col justify-between shadow-xl">
            {/* En-tête drawer */}
            <div>
              <div className="flex items-center justify-between px-5 pt-6 pb-8">
                <Link href="/" aria-label="Accueil" onClick={() => setMobileMenuOpen(false)}>
                  <Image src="/images/logo.png" alt="Toni360" width={120} height={60} />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                  aria-label="Fermer le menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-0.5">
                {navItems.map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        active
                          ? "bg-[#E6F6F0] text-toni-green-dark-2 font-bold"
                          : "text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer drawer */}
            <div className="px-5 pb-6 text-xs text-toni-green-dark-2 leading-relaxed">
              <Link href="/client/help/privacy" className="hover:underline block" onClick={() => setMobileMenuOpen(false)}>
                Politiques de confidentialité,
              </Link>
              <Link href="/client/help/return-policy" className="hover:underline block" onClick={() => setMobileMenuOpen(false)}>
                Conditions générales de retour,
              </Link>
              <Link href="/client/contact" className="hover:underline block" onClick={() => setMobileMenuOpen(false)}>
                Contactez-nous
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ── Sidebar desktop ── */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-gray-200 bg-white lg:flex h-screen overflow-y-auto">
        <div>
          <div className="mb-10 mt-7 px-5">
            <Link href="/" aria-label="Accueil">
              <Image src="/images/logo.png" alt="Toni360" width={140} height={70} />
            </Link>
          </div>

          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2 text-xl transition-colors ${
                    active
                      ? "bg-[#E6F6F0] text-toni-green-dark-2 font-bold"
                      : "text-gray-600  hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-5 pb-6 text-xs text-toni-green-dark-2 leading-relaxed">
          <Link href="/client/help/privacy" className="hover:underline block">Politiques de confidentialité,</Link>
          <Link href="/client/help/return-policy" className="hover:underline block">Conditions générales de retour,</Link>
          <Link href="/client/contact" className="hover:underline block">Contactez-nous</Link>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className=" border-gray-200 bg-white px-4 py-3 lg:px-8 lg:pt-8 lg:pb-4">

          {/* Barre mobile : hamburger | logo centré | icônes */}
          <div className="flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-gray-700"
              aria-label="Ouvrir le menu"
            >
              <Menu size={24} />
            </button>

            <Link href="/" aria-label="Accueil">
              <Image src="/images/logo.png" alt="Toni360" width={100} height={50} priority />
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/client/notifications" aria-label="Notifications" className="text-toni-green-dark-2">
                <Bell size={22} />
              </Link>
              <Link href="/client/dashboard/cart" aria-label="Panier" className="text-toni-green-dark-2">
                <ShoppingCart size={22} />
              </Link>
            </div>
          </div>

          {/* Barre desktop : recherche + boutons */}
          <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Search — clic redirige vers la page de recherche */}
            <form
              className="relative w-full lg:max-w-xs"
              onSubmit={(e) => {
                e.preventDefault();
                const term = search.trim();
                router.push(`/client/recherche${term ? `?q=${encodeURIComponent(term)}` : ""}`);
              }}
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => router.push(`/client/recherche${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`)}
                placeholder="Rechercher un médicament..."
                className="w-full rounded-full bg-toni-green-light border-none py-3 pl-6 pr-14 text-sm font-semibold text-gray-500 placeholder:text-gray-400 placeholder:font-semibold outline-none cursor-pointer"
                readOnly
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-toni-green-dark-2 p-2.5 text-white transition hover:bg-toni-green-dark"
              >
                <Search size={18} />
              </button>
            </form>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/client/notifications"
                className="flex items-center gap-2 rounded-full border border-toni-green-dark-2 px-4 py-2 text-sm font-semibold text-toni-green-dark-2 transition hover:bg-[#E6F6F0]"
              >
                <Bell size={16} />
                Notifications
              </Link>
              <Link
                href="/client/dashboard/cart"
                className="flex items-center gap-2 rounded-full border border-toni-green-dark-2 px-4 py-2 text-sm font-semibold text-toni-green-dark-2 transition hover:bg-[#E6F6F0]"
              >
                <ShoppingCart size={16} />
                Mon Panier
              </Link>
            </div>
          </div>

          {/* Barre de recherche mobile (sous la top bar) — clic → page recherche */}
          <form
            className="mt-3 relative lg:hidden"
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/client/recherche");
            }}
          >
            <input
              type="text"
              placeholder="Rechercher un médicament..."
              onFocus={() => router.push("/client/recherche")}
              className="w-full rounded-full bg-toni-green-light border-none py-3 pl-6 pr-14 text-sm font-semibold text-gray-500 placeholder:text-gray-400 placeholder:font-semibold outline-none cursor-pointer"
              readOnly
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-toni-green-dark-2 p-2.5 text-white transition hover:bg-toni-green-dark"
            >
              <Search size={16} />
            </button>
          </form>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
