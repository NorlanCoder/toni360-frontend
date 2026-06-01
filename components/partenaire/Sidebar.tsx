"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  UserRound,
  Pill,
  History,
  HelpCircle,
  Bell,
  LogOut,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { filterPartnerNavigationByPermissions } from "@/lib/auth/authorization";
import { getAuthSession } from "@/lib/api/session";
import { getPartnerNotificationCount } from "@/lib/api/partner";
import { useSidebarContext } from "@/app/partenaire/_sidebar-context";

/* ──────────────────── Nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/dashboard" },
  { label: "Gestion de commande", icon: Package, href: "/partenaire/commandes" },
  // { label: "Gestion de Stocks", icon: Boxes, href: "/partenaire/stocks" },
  // { label: "Clients", icon: UserRound, href: "/client" },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  // { label: "Incohérences", icon: AlertTriangle, href: "/partednaire/medicaments/incoherences" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Notifications", icon: Bell, href: "/partenaire/notifications" },
  { label: "Centre d'aide", icon: HelpCircle, href: "/about" },
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
  const [notifCount, setNotifCount] = useState(0);

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
          <aside className="absolute left-0 top-0 bottom-0 w-80 bg-white flex flex-col justify-between shadow-xl">
            <div>
              {/* En-tête drawer */}
              <div className="flex items-center justify-between px-5 pt-6 pb-8">
                <Link href="/partenaire/dashboard" aria-label="Accueil" onClick={onClose}>
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
                  const isNotif = item.href === "/partenaire/notifications";
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
                      {isNotif && notifCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                          {notifCount > 99 ? "99+" : notifCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
                <div className="mx-4 my-1 border-t border-gray-100" />
                <Link
                  href="/partenaire/deconnexion"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut size={20} strokeWidth={1.8} />
                  Déconnexion
                </Link>
              </nav>
            </div>

            {/* Footer drawer */}
            <div className="px-5 pb-6 flex flex-col gap-1.5 text-xs text-gray-400 leading-relaxed">
              <Link href="/partenaire/cgu" className="hover:underline hover:text-gray-600 transition-colors" onClick={onClose}>
                Conditions générales d&apos;utilisation
              </Link>
              <Link href="/partenaire/privacy" className="hover:underline hover:text-gray-600 transition-colors" onClick={onClose}>
                Politique de confidentialité
              </Link>
              <Link href="/partenaire/contacts" className="hover:underline hover:text-gray-600 transition-colors" onClick={onClose}>
                Contactez-nous
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ── Sidebar desktop ── */}
      <aside className="hidden w-72 shrink-0 flex-col justify-between  border-gray-200 bg-white lg:flex h-screen overflow-y-auto">
        <div>
          <div className="mb-10 mt-7 px-5">
            <Link href="/partenaire/dashboard" aria-label="Accueil">
              <Image src="/images/logo.png" alt="Toni360" width={140} height={70} />
            </Link>
          </div>

          <nav className="flex flex-col gap-0.5" aria-label="Navigation partenaire">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === activeHref;
              const isNotif = item.href === "/partenaire/notifications";
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
                  {isNotif && notifCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                      {notifCount > 99 ? "99+" : notifCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="mx-4 my-1 border-t border-gray-100" />
            <Link
              href="/partenaire/deconnexion"
              className="flex items-center gap-3 px-4 py-2 text-base font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={20} strokeWidth={1.8} />
              Déconnexion
            </Link>
          </nav>
        </div>

        <div className="px-5 pb-6 flex flex-col gap-1.5 text-xs text-gray-400 leading-relaxed">
          <Link href="/partenaire/cgu" className="hover:underline hover:text-gray-600 transition-colors">
            Conditions générales d&apos;utilisation
          </Link>
          <Link href="/partenaire/privacy" className="hover:underline hover:text-gray-600 transition-colors">
            Politique de confidentialité
          </Link>
          <Link href="/partenaire/contacts" className="hover:underline hover:text-gray-600 transition-colors">
            Contactez-nous
          </Link>
        </div>
      </aside>
    </>
  );
}
