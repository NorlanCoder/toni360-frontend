"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  );
}

