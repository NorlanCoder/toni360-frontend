"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";
import { hasPermission } from "@/lib/auth/authorization";
import { formatNumberFr } from "@/lib/formatNumber";
import {
  getPartnerCommandeCompteurs,
  getPartnerStockStats,
  getPartnerUsers,
} from "@/lib/api/partner";

/* ─────────────────────── Donut Chart ───────────────────────── */
const CIRCUMFERENCE = 251.33;

interface RoleDistribution {
  code: string;
  label: string;
  count: number;
  color: string;
}

interface DonutSegment {
  color: string;
  label: string;
  length: number;
  offset: number;
}

interface PartnerUserLike {
  role?: { code?: string | null; libelle?: string | null } | null;
  roles?: Array<{ code?: string | null; libelle?: string | null }> | null;
  role_code?: string | null;
}

const ROLE_META: Record<string, { label: string; color: string; order: number }> = {
  PHARMACIEN_TITULAIRE: { label: "Pharmacien titulaire", color: "#0f766e", order: 1 },
  GESTIONNAIRE_OPERATIONNEL: { label: "Gestionnaire opérationnel", color: "#1e3a8a", order: 2 },
  RESPONSABLE_STOCKS: { label: "Responsable des stocks", color: "#a855f7", order: 3 },
  RESPONSABLE_COMMANDES: { label: "Responsable des commandes", color: "#facc15", order: 4 },
  UNKNOWN_ROLE: { label: "Profil non défini", color: "#6b7280", order: 99 },
};

const FALLBACK_COLORS = ["#0ea5e9", "#ef4444", "#f97316", "#22c55e", "#eab308", "#8b5cf6"];

function pluralizeLabel(count: number, singular: string, plural: string): string {
  return count <= 1 ? singular : plural;
}

function sanitizeRoleLabel(label: string): string {
  const normalized = label.trim();
  if (!normalized) {
    return ROLE_META.UNKNOWN_ROLE.label;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function buildDonutSegments(distribution: RoleDistribution[]): DonutSegment[] {
  const entries = distribution.filter((entry) => entry.count > 0);

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
  const roleFromList = Array.isArray(user.roles) ? user.roles.find((r) => typeof r?.code === "string" && r.code.trim()) : null;
  if (roleFromList?.code) {
    return roleFromList.code;
  }

  if (typeof user.role?.code === "string" && user.role.code.trim()) {
    return user.role.code;
  }

  if (typeof user.role_code === "string" && user.role_code.trim()) {
    return user.role_code;
  }

  return null;
}

function getRoleLabel(user: PartnerUserLike, roleCode: string | null): string {
  const roleFromList = Array.isArray(user.roles) ? user.roles.find((r) => typeof r?.code === "string" && r.code.trim()) : null;
  const roleLibelle = roleFromList?.libelle ?? user.role?.libelle ?? null;

  if (roleCode && ROLE_META[roleCode]) {
    return ROLE_META[roleCode].label;
  }

  if (typeof roleLibelle === "string" && roleLibelle.trim()) {
    return sanitizeRoleLabel(roleLibelle);
  }

  return ROLE_META.UNKNOWN_ROLE.label;
}

/* ────────────────── Skeleton loader (number placeholder) ──────────────── */
function NumberSkeleton({ colorClass = "bg-black/10" }: { colorClass?: string }) {
  return (
    <span
      className={`inline-block h-[3.75rem] w-16 animate-pulse rounded-xl ${colorClass}`}
      aria-hidden="true"
    />
  );
}

/* ────────────────── Arrow button (green circle) ──────────────── */
function ArrowButton({ bg = "bg-emerald-700 hover:bg-emerald-800" }: { bg?: string }) {
  return (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-full ${bg} text-white transition-colors`}
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
  const [aPreparerCount, setAPreparerCount] = useState(0);
  const [enAttenteCount, setEnAttenteCount] = useState(0);
  const [recupereesCount, setRecupereesCount] = useState(0);
  const [stockTotal, setStockTotal] = useState(0);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const donutSegments = buildDonutSegments(roleDistribution);

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

        const [compteursResponse, stockStats, usersPage1] = await Promise.all([
          canReadCommandes  ? getPartnerCommandeCompteurs(session.token) : Promise.resolve(null),
          canReadStocks     ? getPartnerStockStats(session.token)        : Promise.resolve(null),
          canReadUsers      ? getPartnerUsers(session.token, { page: 1 }) : Promise.resolve(null),
        ]);

        const compteurs = compteursResponse?.data;
        setAPreparerCount(compteurs?.en_cours ?? 0);
        setEnAttenteCount(compteurs?.prete ?? 0);
        setRecupereesCount(compteurs?.recuperee ?? 0);
        setStockTotal(stockStats?.data.total_unites ?? 0);

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

        const map = new Map<string, { code: string; label: string; count: number }>();

        allUsers.forEach((userItem) => {
          const roleCode = getRoleCode(userItem) ?? "UNKNOWN_ROLE";
          const roleLabel = getRoleLabel(userItem, roleCode);
          const key = `${roleCode}::${roleLabel}`;
          const current = map.get(key);

          if (current) {
            current.count += 1;
            return;
          }

          map.set(key, {
            code: roleCode,
            label: roleLabel,
            count: 1,
          });
        });

        const ordered = Array.from(map.values())
          .sort((a, b) => {
            const orderA = ROLE_META[a.code]?.order ?? 50;
            const orderB = ROLE_META[b.code]?.order ?? 50;
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            return a.label.localeCompare(b.label, "fr");
          })
          .map((entry, index) => ({
            ...entry,
            color: ROLE_META[entry.code]?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
          }));

        setRoleDistribution(ordered);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          clearAuthSession();
          router.replace("/partenaire/connexion");
          return;
        }
      } finally {
        setIsLoading(false);
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
        <main className="flex-1 m-auto max-w-4xl overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 lg:py-8">

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
                {isLoading ? (
                  <NumberSkeleton colorClass="bg-red-700/15" />
                ) : (
                  <span className="text-6xl font-bold text-red-700 leading-none">{formatNumberFr(aPreparerCount)}</span>
                )}
                <span className="text-sm text-red-600 leading-tight max-w-[100px]">
                  {pluralizeLabel(aPreparerCount, "commande en attente de préparation", "commandes en attente de préparation")}
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton bg="bg-red-700" />
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
                {isLoading ? (
                  <NumberSkeleton colorClass="bg-[#b7860b]/15" />
                ) : (
                  <span className="text-6xl font-bold text-[#b7860b] leading-none">{formatNumberFr(enAttenteCount)}</span>
                )}
                <span className="text-sm text-[#b7860b] leading-tight max-w-[110px]">
                  {pluralizeLabel(enAttenteCount, "commande prête à être récupérée", "commandes prêtes à être récupérées")}
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton bg="bg-[#b7860b] hover:bg-[#9a7009]" />
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
                {isLoading ? (
                  <NumberSkeleton colorClass="bg-emerald-800/15" />
                ) : (
                  <span className="text-6xl font-bold text-emerald-800 leading-none">{formatNumberFr(recupereesCount)}</span>
                )}
                <span className="text-sm text-emerald-700 leading-tight max-w-[110px]">
                  {pluralizeLabel(recupereesCount, "commande récupérée par un patient", "commandes récupérées par les patients")}
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton bg="bg-emerald-700 hover:bg-emerald-800" />
              </div>
            </Link>
          </div>

          {/* ── Row 2: Stock card + Donut chart ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* Card 4 — Stocks disponibles */}
            <Link
              href="/partenaire/stocks"
              className="group flex flex-col sm:col-span-1 rounded-2xl bg-[#B0E3D1] border border-[#00955F] p-6 min-h-[220px] transition-shadow hover:shadow-md"
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
              <div className="flex flex-col gap-2 mt-auto mb-4">
                {isLoading ? (
                  <NumberSkeleton colorClass="bg-emerald-800/15" />
                ) : (
                  <span className="text-6xl font-bold text-emerald-800 leading-none">{formatNumberFr(stockTotal)}</span>
                )}
                <span className="text-sm text-emerald-700 leading-tight">
                  {pluralizeLabel(stockTotal, "produit actuellement en stock", "produits actuellement en stock")}
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton bg="bg-emerald-700 hover:bg-emerald-800" />
              </div>
            </Link>

            {/* Card 5 — Donut chart */}
            <Link
              href="/partenaire/employes"
              className="group flex items-center justify-center sm:col-span-2 rounded-2xl border border-emerald-300 bg-white p-4 min-h-[180px] transition-shadow hover:shadow-md sm:p-6 sm:min-h-[220px]"
            >
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
              ) : (
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

                  {/* <div className="sm:ml-2">
                    <ArrowButton />
                  </div> */}
                </div>
              )}
            </Link>

          </div>
        </main>
      </div>
  );
}
