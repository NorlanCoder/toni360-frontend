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

const navItems = [
  { label: "Accueil", href: "/client/accueil", icon: Home },
  { label: "Mon compte", href: "/client/profil", icon: User },
  { label: "Mes commandes", href: "/client/orders", icon: ListOrdered },
  { label: "Notifications", href: "/client/notifications", icon: Bell },
  { label: "Mon Panier", href: "/client/dashboard/cart", icon: ShoppingCart },
  { label: "Centre d'aide", href: "/client/help/faq", icon: HelpCircle },
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
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col justify-between border-r-2 border-gray-300 bg-white px-6 py-8 lg:flex">
        <div>
          {/* Logo */}
          <div className="mb-12 mt-6">
            <Link href="/" aria-label="Accueil">
              <Image
                src="/images/logo.png"
                alt="Toni360"
                width={160}
                height={80}
                priority
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                    active
                      ? "bg-toni-green-light text-toni-green-dark-2 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer sidebar */}
        <div className="text-xs text-toni-green-dark-2 leading-relaxed">
          <Link href="/client/help/privacy" className="hover:underline block">
            Politiques de confidentialité,
          </Link>
          <Link href="/client/help/return-policy" className="hover:underline block">
            Conditions générales de retour,
          </Link>
          <Link href="/client/contact" className="hover:underline block">
            Contactez-nous
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="border-b-2 border-gray-300 px-3 pb-4 pt-4 sm:px-6 lg:px-8 lg:pt-12">
          <div className="mb-3 flex items-center justify-between lg:hidden">
            <Link href="/" aria-label="Accueil">
              <Image
                src="/images/logo.png"
                alt="Toni360"
                width={126}
                height={63}
                priority
                className="h-12 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-md border border-gray-300 p-2 text-gray-700"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="mb-4 grid gap-2 rounded-xl border border-gray-200 bg-white p-3 lg:hidden">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-toni-green-light text-toni-green-dark-2"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <form className="relative w-full lg:max-w-xl" onSubmit={handleSearch}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 120);
              }}
              placeholder="Rechercher un médicament..."
              className="w-full rounded-full border border-gray-300 py-2.5 pl-4 pr-12 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 sm:py-3 sm:pl-5 sm:text-base"
            />
            <button
              type="submit"
              className="absolute bottom-0 right-0 top-0 flex items-center justify-center rounded-r-full bg-toni-green-dark-2 px-4 text-white transition hover:bg-toni-green-dark"
            >
              <Search size={18} />
            </button>

            {showSuggestions && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {suggestions.map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={() => handleSuggestionClick(item)}
                    className={`w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 ${
                      index === activeSuggestionIndex ? "bg-gray-50" : ""
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
            <Link
              href="/client/notifications"
              className="flex items-center justify-center gap-2 rounded-full border border-toni-green-dark-2 px-3 py-2 text-xs font-semibold text-toni-green-dark-2 transition hover:bg-toni-green-light sm:px-4 sm:text-sm"
            >
              <Bell size={16} />
              Notifications
            </Link>
            <Link
              href="/client/dashboard/cart"
              className="flex items-center justify-center gap-2 rounded-full border border-toni-green-dark-2 px-3 py-2 text-xs font-semibold text-toni-green-dark-2 transition hover:bg-toni-green-light sm:px-4 sm:text-sm"
            >
              <ShoppingCart size={16} />
              Mon Panier
            </Link>
          </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-3 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
