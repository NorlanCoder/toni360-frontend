"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Pill,
  History,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { getPartnerProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";
import { filterPartnerNavigationByPermissions, hasPermission } from "@/lib/auth/authorization";
import {
  getPartnerCommandeCompteurs,
  getPartnerNotificationCount,
  getPartnerPharmacieProfile,
  getPartnerStockStats,
  getPartnerUsers,
} from "@/lib/api/partner";

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/dashboard" },
  { label: "Gestion de commande", icon: Package, href: "/partenaire/commandes" },
  { label: "Gestion de Stocks", icon: Boxes, href: "/partenaire/stocks" },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "/contact" },
];

/* ─────────────────────── Donut Chart ───────────────────────── */
const CIRCUMFERENCE = 251.33;
const DEFAULT_PHARMACIE_LABEL = "Nom de la pharmacie";

interface RoleCounts {
  gestionnaireOperationnel: number;
  responsableStocks: number;
  responsableCommandes: number;
}

interface DonutSegment {
  color: string;
  label: string;
  length: number;
  offset: number;
}

interface PartnerUserLike {
  role?: { code?: string | null } | null;
  roles?: Array<{ code?: string | null }> | null;
  role_code?: string | null;
}

const TARGET_ROLE_CODES = [
  "GESTIONNAIRE_OPERATIONNEL",
  "RESPONSABLE_STOCKS",
  "RESPONSABLE_COMMANDES",
] as const;

function buildDonutSegments(counts: RoleCounts): DonutSegment[] {
  const entries = [
    { color: "#1e3a8a", label: "Gestionnaire opérationnel", count: counts.gestionnaireOperationnel },
    { color: "#a855f7", label: "Responsable des stocks", count: counts.responsableStocks },
    { color: "#facc15", label: "Responsable des commandes", count: counts.responsableCommandes },
  ];

  const total = entries.reduce((sum, entry) => sum + entry.count, 0);
  let runningOffset = 0;

  return entries.map((entry) => {
    const length = total > 0 ? (entry.count / total) * CIRCUMFERENCE : 0;
    const segment = {
      color: entry.color,
      label: `${entry.label} (${entry.count})`,
      length,
      offset: runningOffset,
    };
    runningOffset += length;
    return segment;
  });
}

function getPaginatorMeta(responseData: unknown): { lastPage: number; users: PartnerUserLike[] } {
  if (!responseData || typeof responseData !== "object") {
    return { lastPage: 1, users: [] };
  }

  if (Array.isArray(responseData)) {
    return { lastPage: 1, users: responseData as PartnerUserLike[] };
  }

  const paginated = responseData as {
    data?: unknown;
    last_page?: number;
  };

  return {
    lastPage: typeof paginated.last_page === "number" && paginated.last_page > 0 ? paginated.last_page : 1,
    users: Array.isArray(paginated.data) ? (paginated.data as PartnerUserLike[]) : [],
  };
}

function getRoleCode(user: PartnerUserLike): string | null {
  const candidates = [
    ...(Array.isArray(user.roles) ? user.roles.map((r) => r?.code).filter(Boolean) : []),
    user.role?.code ?? null,
    user.role_code ?? null,
  ].filter((code): code is string => Boolean(code));

  const matched = candidates.find((code) => TARGET_ROLE_CODES.includes(code as (typeof TARGET_ROLE_CODES)[number]));
  return matched ?? null;
}

function formatTitulaireFullName(nomComplet: string | undefined, prenom: string | undefined, nom: string | undefined): string {
  const prenomNom = `${prenom ?? ""} ${nom ?? ""}`.trim();
  if (prenomNom) {
    return prenomNom;
  }

  return nomComplet?.trim() ?? "";
}

function getPharmacieName(value: unknown): string {
  if (value && typeof value === "object" && "nom" in value) {
    const nom = (value as { nom?: unknown }).nom;
    if (typeof nom === "string" && nom.trim()) {
      return nom.trim();
    }
  }

  return DEFAULT_PHARMACIE_LABEL;
}

/* ────────────────── Arrow button (green circle) ──────────────── */
function ArrowButton() {
  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
      aria-label="Voir le détail"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path
          fillRule="evenodd"
          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState(DEFAULT_PHARMACIE_LABEL);
  const [visibleNavItems, setVisibleNavItems] = useState(navItems);
  const [aPreparerCount, setAPreparerCount] = useState(0);
  const [enAttenteCount, setEnAttenteCount] = useState(0);
  const [recupereesCount, setRecupereesCount] = useState(0);
  const [stockTotal, setStockTotal] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [roleCounts, setRoleCounts] = useState<RoleCounts>({
    gestionnaireOperationnel: 0,
    responsableStocks: 0,
    responsableCommandes: 0,
  });

  const donutSegments = buildDonutSegments(roleCounts);

  useEffect(() => {
    const syncProfile = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        clearAuthSession();
        router.replace("/partenaire/connexion");
        return;
      }

      try {
        const canReadCommandes  = hasPermission(session, "gestion_commandes", "read");
        const canReadStocks     = hasPermission(session, "gestion_stocks", "read");
        const canReadUsers      = hasPermission(session, "gestion_users", "read");
        const canReadParametrage = hasPermission(session, "parametrage_pharmacie", "read");

        const [response, compteursResponse, stockStats, notifications, usersPage1, pharmacieProfile] = await Promise.all([
          getPartnerProfile(session.token),
          canReadCommandes  ? getPartnerCommandeCompteurs(session.token) : Promise.resolve(null),
          canReadStocks     ? getPartnerStockStats(session.token)        : Promise.resolve(null),
          getPartnerNotificationCount(session.token).catch(() => null),
          canReadUsers      ? getPartnerUsers(session.token, { page: 1 }) : Promise.resolve(null),
          canReadParametrage ? getPartnerPharmacieProfile(session.token)  : Promise.resolve(null),
        ]);

        const user = response.data.user;
        const titulaireName = formatTitulaireFullName(user.nom_complet, user.prenom, user.nom);
        const profilePharmacieName = getPharmacieName(pharmacieProfile?.data);
        const fallbackPharmacieName = user?.pharmacie?.nom?.trim() || titulaireName || DEFAULT_PHARMACIE_LABEL;
        setDisplayName(profilePharmacieName !== DEFAULT_PHARMACIE_LABEL ? profilePharmacieName : fallbackPharmacieName);

        const compteurs = compteursResponse?.data;
        setAPreparerCount((compteurs?.a_traiter ?? 0) + (compteurs?.en_preparation ?? 0));
        setEnAttenteCount(compteurs?.prete ?? 0);
        setRecupereesCount(compteurs?.recuperee ?? 0);
        setStockTotal(stockStats?.data.total_unites ?? 0);
        setNotificationCount(
          notifications?.data.total_non_lues
          ?? notifications?.data.non_lues
          ?? 0,
        );

        const firstPage = usersPage1 ? getPaginatorMeta(usersPage1.data) : { users: [], lastPage: 0 };
        const allUsers: PartnerUserLike[] = [...firstPage.users];

        if (firstPage.lastPage > 1) {
          const remainingRequests: Array<Promise<Awaited<ReturnType<typeof getPartnerUsers>>>> = [];
          for (let page = 2; page <= firstPage.lastPage; page += 1) {
            remainingRequests.push(getPartnerUsers(session.token, { page }));
          }

          const remainingResponses = await Promise.all(remainingRequests);
          remainingResponses.forEach((res) => {
            allUsers.push(...getPaginatorMeta(res.data).users);
          });
        }

        const counts: RoleCounts = {
          gestionnaireOperationnel: 0,
          responsableStocks: 0,
          responsableCommandes: 0,
        };

        allUsers.forEach((userItem) => {
          const roleCode = getRoleCode(userItem);
          if (roleCode === "GESTIONNAIRE_OPERATIONNEL") counts.gestionnaireOperationnel += 1;
          if (roleCode === "RESPONSABLE_STOCKS") counts.responsableStocks += 1;
          if (roleCode === "RESPONSABLE_COMMANDES") counts.responsableCommandes += 1;
        });

        setRoleCounts(counts);

        setVisibleNavItems(filterPartnerNavigationByPermissions(session, navItems));
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          clearAuthSession();
          router.replace("/partenaire/connexion");
          return;
        }
      }
    };

    void syncProfile();

    const intervalId = setInterval(() => {
      void syncProfile();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [router]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 lg:py-8">

          {/* ── Row 1: 3 stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">

            {/* Card 1 — Commandes à préparer */}
            <Link
              href="/partenaire/commandes"
              className="group flex flex-col rounded-2xl bg-[#fde8e8] p-6 min-h-[220px] transition-shadow hover:shadow-md"
            >
              {/* Icon */}
              <div className="mb-4">
                <Image
                  src="/preparer.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>
              {/* Title */}
              <p className="text-xl font-bold text-red-700 leading-snug mb-4">
                Commandes<br />à préparer
              </p>
              {/* Count */}
              <div className="flex items-center gap-3 mt-auto mb-4">
                <span className="text-6xl font-bold text-red-700 leading-none">{aPreparerCount}</span>
                <span className="text-sm text-red-600 leading-tight max-w-[100px]">
                  commandes en attente de préparation
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton />
              </div>
            </Link>

            {/* Card 2 — Commandes en attente */}
            <Link
              href="/partenaire/commandes/en-attente"
              className="group flex flex-col rounded-2xl bg-[#fef9e7] p-6 min-h-[220px] transition-shadow hover:shadow-md"
            >
              {/* Icon */}
              <div className="mb-4">
                <Image
                  src="/enattente.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>
              {/* Title */}
              <p className="text-xl font-bold text-[#b7860b] leading-snug mb-4">
                Commandes<br />en attente
              </p>
              {/* Count */}
              <div className="flex items-center gap-3 mt-auto mb-4">
                <span className="text-6xl font-bold text-[#b7860b] leading-none">{enAttenteCount}</span>
                <span className="text-sm text-[#b7860b] leading-tight max-w-[110px]">
                  commandes prêtes à être récupérées
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton />
              </div>
            </Link>

            {/* Card 3 — Commandes récupérées */}
            <Link
              href="/partenaire/commandes/recuperees"
              className="group flex flex-col rounded-2xl bg-[#e6f7f0] border border-emerald-300 p-6 min-h-[220px] transition-shadow hover:shadow-md"
            >
              {/* Icon */}
              <div className="mb-4">
                <Image
                  src="/recuperer.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>
              {/* Title */}
              <p className="text-xl font-bold text-emerald-800 leading-snug mb-4">
                Commandes<br />récupérées
              </p>
              {/* Count */}
              <div className="flex items-center gap-3 mt-auto mb-4">
                <span className="text-6xl font-bold text-emerald-800 leading-none">{recupereesCount}</span>
                <span className="text-sm text-emerald-700 leading-tight max-w-[110px]">
                  commandes récupérées par les patients
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton />
              </div>
            </Link>
          </div>

          {/* ── Row 2: Stock card + Donut chart ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Card 4 — Stocks disponibles */}
            <Link
              href="/partenaire/stocks"
              className="group flex flex-col rounded-2xl bg-[#e6f7f0] border border-emerald-300 p-6 min-h-[220px] transition-shadow hover:shadow-md"
            >
              {/* Icon */}
              <div className="mb-4">
                <Image
                  src="/stock.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>
              {/* Title */}
              <p className="text-xl font-bold text-emerald-800 leading-snug mb-4">
                Stocks<br />disponibles
              </p>
              {/* Count */}
              <div className="flex items-center gap-3 mt-auto mb-4">
                <span className="text-6xl font-bold text-emerald-800 leading-none">{stockTotal}</span>
                <span className="text-sm text-emerald-700 leading-tight max-w-[110px]">
                  produits actuellement en stock
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton />
              </div>
            </Link>

            {/* Card 5 — Donut chart */}
            <div className="flex items-center justify-center rounded-2xl border border-emerald-300 bg-white p-4 min-h-[180px] sm:p-6 sm:min-h-[220px]">
              <div className="flex flex-col items-center gap-4 w-full sm:flex-row sm:items-center sm:gap-8 sm:w-auto">
                {/* SVG Donut */}
                <svg
                  viewBox="0 0 100 100"
                  className="h-32 w-32 shrink-0 sm:h-40 sm:w-40"
                  aria-hidden="true"
                >
                  {/* Background ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="18"
                  />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.label}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="18"
                      strokeDasharray={`${seg.length} ${CIRCUMFERENCE - seg.length}`}
                      strokeDashoffset={-seg.offset}
                      transform="rotate(-90 50 50)"
                    />
                  ))}
                  {/* White hole in the center */}
                  <circle cx="50" cy="50" r="24" fill="white" />
                </svg>

                {/* Legend */}
                <ul className="flex flex-row flex-wrap justify-center gap-2 sm:flex-col sm:gap-3">
                  {donutSegments.map((seg) => (
                    <li key={seg.label} className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 shrink-0 rounded-sm"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-xs sm:text-sm text-gray-700">{seg.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </main>
      </div>
  );
}
