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
  Menu,
} from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { extractCollection, getPartnerUsers } from "@/lib/api/partner";
import { toast } from "sonner";

/* ──────────────────────────── Types ──────────────────────────── */
type FilterKey = "tous" | "actives" | "desactives";

type EmployeeRoleCode = "PHARMACIEN_TITULAIRE" | "GESTIONNAIRE_OPERATIONNEL" | "RESPONSABLE_STOCKS" | "RESPONSABLE_COMMANDES" | null;

interface Employee {
  id: string;
  nom: string;
  role: "Pharmacien Titulaire" | "Gestionnaire Opérationnel" | "Responsable des Stocks" | "Responsable des Commandes";
  roleCode: EmployeeRoleCode;
  statut: "Actif" | "Désactivé" | "Inactif";
}

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/dashboard" },
  { label: "Gestion de commande", icon: Package, href: "/partenaire/commandes" },
  { label: "Gestion de Stocks", icon: Boxes, href: "/partenaire/stocks" },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes", active: true },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
];

/* ──────────────────────── Helpers ────────────────────────────── */
const statusStyles: Record<Employee["statut"], string> = {
  Actif: "bg-emerald-100 text-emerald-700",
  Désactivé: "bg-gray-400 text-white",
  Inactif: "bg-red-200 text-red-600",
};

const filterMap: Record<FilterKey, Employee["statut"] | null> = {
  tous: null,
  actives: "Actif",
  desactives: "Désactivé",
};

function mapRoleLabel(code: string | undefined, libelle: string | undefined): Employee["role"] {
  if (code === "PHARMACIEN_TITULAIRE") {
    return "Pharmacien Titulaire";
  }

  if (code === "RESPONSABLE_STOCKS") {
    return "Responsable des Stocks";
  }

  if (code === "RESPONSABLE_COMMANDES") {
    return "Responsable des Commandes";
  }

  if (code === "GESTIONNAIRE_OPERATIONNEL") {
    return "Gestionnaire Opérationnel";
  }

  const normalized = (libelle ?? "").toLowerCase();
  if (normalized.includes("titulaire")) {
    return "Pharmacien Titulaire";
  }
  if (normalized.includes("stocks")) {
    return "Responsable des Stocks";
  }
  if (normalized.includes("commande")) {
    return "Responsable des Commandes";
  }
  return "Gestionnaire Opérationnel";
}

function mapNomComplet(nomComplet: string | undefined, nom: string | undefined, prenom: string | undefined): string {
  const fullName = nomComplet?.trim();
  if (fullName) {
    return fullName;
  }

  return [nom, prenom].filter(Boolean).join(" ").trim();
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireEmployesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("tous");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "tous", label: "Tous" },
    { key: "actives", label: "Activés" },
    { key: "desactives", label: "Désactivés" },
  ];

  const filteredEmployees =
    activeFilter === "tous"
      ? employees
      : employees.filter((e) => e.statut === filterMap[activeFilter]);

  useEffect(() => {
    const loadEmployees = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPartnerUsers(session.token, { per_page: 100 });
        const users = extractCollection(response.data);

        setEmployees(users.map((user) => ({
          id: user.id,
          nom: mapNomComplet(user.nom_complet, user.nom, user.prenom),
          role: mapRoleLabel(user.role?.code, user.role?.libelle),
          roleCode: (user.role?.code as EmployeeRoleCode) ?? null,
          statut: user.is_active ? "Actif" : "Désactivé",
        })));
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger les employés.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadEmployees();
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
        <header className="flex h-20 lg:h-24 shrink-0 items-center gap-3 justify-between border-b border-gray-200 bg-white px-4 md:px-8">
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
          {/* Action bar */}
          <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4">
            <Link
              href="/partenaire/employes/ajouter"
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-bold text-white transition-colors hover:bg-emerald-800"
            >
              <Image
                src="/fluent.svg"
                alt="Ajouter"
                width={24}
                height={24}
              />
              Ajouter un employé
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="mb-6 flex flex-wrap gap-2 sm:gap-x-4 lg:gap-x-8 gap-y-2 sm:gap-y-3">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`rounded-full border border-emerald-600 px-3 sm:px-6 lg:px-10 py-1.5 sm:py-2 text-xs sm:text-sm lg:text-base font-bold transition-colors ${
                    isActive
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            {isLoading ? (
              <div className="px-6 py-6 text-sm text-gray-500">Chargement des employés...</div>
            ) : (
            <table className="min-w-[520px] w-full table-auto text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Nom
                  </th>
                  <th className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Rôle
                  </th>
                  <th className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-5 text-right text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, index) => (
                  (() => {
                    const isTitulaire = emp.roleCode === "PHARMACIEN_TITULAIRE";
                    return (
                  <tr
                    key={emp.id}
                    className={`border-b border-gray-200 last:border-b-0 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    }`}
                  >
                    <td className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6">
                      {isTitulaire ? (
                        <span className="text-xs sm:text-sm md:text-base text-gray-700 cursor-not-allowed" title="Le profil titulaire n'est pas modifiable.">
                          {emp.nom}
                        </span>
                      ) : (
                        <Link
                          href={`/partenaire/employes/${emp.id}`}
                          className="text-xs sm:text-sm md:text-base text-gray-700"
                        >
                          {emp.nom}
                        </Link>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6">
                      {isTitulaire ? (
                        <span className="text-xs sm:text-sm md:text-base text-gray-700 cursor-not-allowed" title="Le profil titulaire n'est pas modifiable.">
                          {emp.role}
                        </span>
                      ) : (
                        <Link
                          href={`/partenaire/employes/${emp.id}`}
                          className="text-xs sm:text-sm md:text-base text-gray-700"
                        >
                          {emp.role}
                        </Link>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-6 text-right">
                      {isTitulaire ? (
                        <span
                          className={`inline-block rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold ${statusStyles[emp.statut]}`}
                        >
                          {emp.statut}
                        </span>
                      ) : (
                        <Link href={`/partenaire/employes/${emp.id}`}>
                          <span
                            className={`inline-block rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold ${statusStyles[emp.statut]}`}
                          >
                            {emp.statut}
                          </span>
                        </Link>
                      )}
                    </td>
                  </tr>
                    );
                  })()
                ))}
              </tbody>
            </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

