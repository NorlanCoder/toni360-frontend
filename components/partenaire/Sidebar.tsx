"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Pill,
  History,
  HelpCircle,
  LogOut,
} from "lucide-react";

/* ──────────────────── Nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/commandes" },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
];

/* Finds the most specific matching nav item for the current path */
function getActiveHref(pathname: string): string {
  const matches = navItems.filter(
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
interface PartenaireSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ═════════════════════ COMPONENT ════════════════════════ */
export default function PartenaireSidebar({ isOpen, onClose }: PartenaireSidebarProps) {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:relative lg:z-auto lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center px-5">
          <Link href="/partenaire/commandes" className="flex items-center gap-2">
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
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-4 text-base font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-6 w-6 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          <div className="flex-1" />

          <Link
            href="#"
            className="mb-6 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Déconnexion
          </Link>
        </nav>
      </aside>
    </>
  );
}
