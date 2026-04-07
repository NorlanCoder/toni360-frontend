"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  UserRound,
  Pill,
  History,
  HelpCircle,
  Bell,
  LogOut,
  X,
  AlertTriangle,
} from "lucide-react";
import { filterPartnerNavigationByPermissions } from "@/lib/auth/authorization";
import { getAuthSession } from "@/lib/api/session";
import { useSidebarContext } from "@/app/partenaire/_sidebar-context";

/* ──────────────────── Nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/dashboard" },
  { label: "Gestion de commande", icon: Package, href: "/partenaire/commandes" },
  // { label: "Gestion de Stocks", icon: Boxes, href: "/partenaire/stocks" },
  // { label: "Clients", icon: UserRound, href: "/client" },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Incohérences", icon: AlertTriangle, href: "/partenaire/medicaments/incoherences" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Notifications", icon: Bell, href: "/partenaire/notifications" },
  { label: "Assistance et support", icon: HelpCircle, href: "/about" },
];

/* Finds the most specific matching nav item for the current path */
function getActiveHref(pathname: string, items: Array<{ href: string }>): string {
  const matches = items.filter(
    (item) =>
      item.href !== "#" &&
      (pathname === item.href || pathname.startsWith(item.href + "/")),
  );
  if (!matches.length) return "";
  return matches.reduce((best, cur) =>
    cur.href.length > best.href.length ? cur : best,
  ).href;
}

/* ──────────────────────── Props ─────────────────────── */
// No props needed — state managed via SidebarContext

/* ═════════════════════ COMPONENT ════════════════════════ */
export default function PartenaireSidebar() {
  const { open: isOpen, setOpen } = useSidebarContext();
  const onClose = () => setOpen(false);
  const pathname = usePathname();
  const session = getAuthSession();
  const visibleNavItems = filterPartnerNavigationByPermissions(session, navItems);
  const activeHref = getActiveHref(pathname, visibleNavItems);

  return (
    <>
      {/* ── Drawer mobile (slide depuis la gauche) ── */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          {/* Panneau */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col justify-between shadow-xl">
            <div>
              {/* En-tête drawer */}
              <div className="flex items-center justify-between px-5 pt-6 pb-8">
                <Link href="/" aria-label="Accueil" onClick={onClose}>
                  <Image src="/images/logo.png" alt="Toni360" width={120} height={60} />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                  aria-label="Fermer le menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-0.5">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === activeHref;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-[#E6F6F0] text-toni-green-dark-2 font-bold"
                          : "text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer drawer */}
            <div className="px-5 pb-6 text-xs text-toni-green-dark-2 leading-relaxed">
              <Link
                href="/partenaire/deconnexion"
                className="hover:underline flex items-center gap-1.5"
                onClick={onClose}
              >
                <LogOut size={13} />
                Déconnexion
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ── Sidebar desktop ── */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between  border-gray-200 bg-white lg:flex h-screen overflow-y-auto">
        <div>
          <div className="mb-10 mt-7 px-5">
            <Link href="/" aria-label="Accueil">
              <Image src="/images/logo.png" alt="Toni360" width={140} height={70} />
            </Link>
          </div>

          <nav className="flex flex-col gap-0.5" aria-label="Navigation partenaire">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === activeHref;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 text-base transition-colors ${
                    isActive
                      ? "bg-[#E6F6F0] text-toni-green-dark-2 font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-5 pb-6 text-xs text-toni-green-dark-2 leading-relaxed">
          <Link href="/partenaire/deconnexion" className="hover:underline flex items-center gap-1.5">
            <LogOut size={13} />
            Déconnexion
          </Link>
        </div>
      </aside>
    </>
  );
}
