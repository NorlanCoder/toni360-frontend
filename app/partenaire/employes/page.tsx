"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
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

/* ──────────────────────── Helpers ────────────────────────────── */
const statusStyles: Record<Employee["statut"], string> = {
  Actif: "bg-emerald-100 text-emerald-700 ",
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
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "tous", label: "Tous" },
    { key: "actives", label: "Activés" },
    { key: "desactives", label: "Désactivés" },
  ];

  const q = search.trim().toLowerCase();
  const filteredEmployees = (
    activeFilter === "tous"
      ? employees
      : employees.filter((e) => e.statut === filterMap[activeFilter])
  )
    .filter((e) =>
      !q ||
      e.nom.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q)
    )
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" }));

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
        const users = extractCollection(response.data).filter(
          (user) => user.role?.code !== "PHARMACIEN_TITULAIRE",
        );

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
    <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
          {/* Retour */}
          <Link
            href="/partenaire/dashboard"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-toni-green-dark-2 hover:underline"
          >
            ← Retour au tableau de bord
          </Link>

          {/* Action bar */}
          <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4">
   

            <Link
              href="/partenaire/employes/ajouter"
              className="inline-flex items-center gap-2 overflow-hidden  text-sm sm:text-base font-bold text-emerald-700 transition-colors"
            >
              <span className="flex items-center justify-center bg-emerald-600 px-3 py-2.5 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span className="px-4 py-2.5 bg-emerald-50  hover:bg-emerald-100">Ajouter un employé</span>
            </Link>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un employé…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-toni-green-dark-2 focus:outline-none focus:ring-1 focus:ring-toni-green-dark-2"
              />
            </div>
          </div>

          {/* Filter tabs */}
          {/* <div className="mb-6 flex flex-wrap gap-2 sm:gap-x-4 lg:gap-x-8 gap-y-2 sm:gap-y-3">
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
          </div> */}

          {/* Table / Empty state */}
          {isLoading ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <div className="px-6 py-6 text-sm text-gray-500">Chargement des employés...</div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-300px)]">
              <div className="flex flex-col items-center justify-center">
                <Users size={120} className="text-gray-400 mb-8" />
                <p className="text-2xl text-gray-500 text-center mb-6">Aucun employé ajouté</p>
                <Link
                  href="/partenaire/employes/ajouter"
                  className="flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-base font-bold text-white transition-colors hover:bg-emerald-800"
                >
                  Ajouter un employé
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg ">
            <table className="min-w-[520px] w-full table-auto text-sm lg:text-base">
              <thead>
                <tr className="">
                  <th className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold  tracking-wider text-[#666666]">
                    Nom
                  </th>
                  <th className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-5 text-left text-xs sm:text-sm font-bold  tracking-wider text-[#666666]">
                    Rôle
                  </th>
                  <th className="px-2 sm:px-4 md:px-8 py-3 sm:py-4 md:py-5 text-right text-xs sm:text-sm font-bold  tracking-wider text-[#666666]">
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
                    className={`border-b border-gray-500 last:border-b-0 transition-colors ${emp.statut === "Actif" ? "bg-white" : "bg-gray-100"}`}
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
                          className={`inline-block rounded-[10px] px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold ${statusStyles[emp.statut]}`}
                        >
                          {emp.statut}
                        </span>
                      ) : (
                        <Link href={`/partenaire/employes/${emp.id}`}>
                          <span
                            className={`inline-block rounded-[10px] px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold ${statusStyles[emp.statut]}`}
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
            </div>
          )}
        </main>
    </div>
  );
}

