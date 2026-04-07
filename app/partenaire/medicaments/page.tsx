"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { extractCollection, getPartnerStocks } from "@/lib/api/partner";
import { toast } from "sonner";
import ImportModal from "./components/ImportModal";

/* ──────────────────────────── Types ──────────────────────────── */
type FilterKey = "tous" | "disponible" | "au-seuil" | "indisponible" | "desactives";

interface Medicine {
  id: string;
  nom: string;
  prix: string;
  statut: "Disponible" | "Au seuil" | "Indisponible" | "Désactivé";
}


/* ──────────────────────── Helpers ────────────────────────────── */
const statusStyles: Record<Medicine["statut"], string> = {
  Disponible: "bg-emerald-100 text-emerald-700",
  "Au seuil": "bg-amber-50 text-amber-600",
  Indisponible: "bg-red-100 text-red-500",
  Désactivé: "bg-gray-200 text-gray-500",
};

const filterMap: Record<FilterKey, Medicine["statut"] | null> = {
  tous: null,
  disponible: "Disponible",
  "au-seuil": "Au seuil",
  indisponible: "Indisponible",
  desactives: "Désactivé",
};

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireMedicamentsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("tous");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "tous", label: "Tous" },
    { key: "disponible", label: "Disponible" },
    { key: "au-seuil", label: "Au seuil" },
    { key: "indisponible", label: "Indisponible" },
    { key: "desactives", label: "Désactivés" },
  ];

  const filteredMedicines =
    activeFilter === "tous"
      ? medicines
      : medicines.filter((m) => m.statut === filterMap[activeFilter]);

  const moneyFormat = useMemo(
    () =>
      new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "XOF",
        maximumFractionDigits: 0,
      }),
    [],
  );

  const loadMedicines = useCallback(async () => {
    setIsLoading(true);
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      toast.error("Session partenaire invalide.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await getPartnerStocks(session.token, { per_page: 200 });
      const stocks = extractCollection(response.data);

        setMedicines(
          stocks.map((stock) => {
            let statut: Medicine["statut"] = "Disponible";
            if (stock.statut === "rupture") {
              statut = "Indisponible";
            } else if (stock.statut === "alerte" || stock.statut === "critique") {
              statut = "Au seuil";
            } else if (stock.statut === "expire") {
              statut = "Désactivé";
            }

            return {
              id: stock.produit_id,
              nom: stock.produit?.nom ?? "—",
              prix: moneyFormat.format(stock.prix_unitaire ?? 0),
              statut,
            };
          }),
        );
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger les médicaments.");
      } finally {
        setIsLoading(false);
      }
    }, [moneyFormat]);

  useEffect(() => {
    void loadMedicines();
  }, [loadMedicines]);

  return (
    <>
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
          {/* Import modal */}
          {showImportModal && (
            <ImportModal
              onClose={() => setShowImportModal(false)}
              onSuccess={() => void loadMedicines()}
            />
          )}
          <div className="mb-6 flex items-center gap-2 sm:gap-4">
            <Link
              href="/partenaire/medicaments/ajouter"
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-bold text-white transition-colors hover:bg-emerald-800"
            >
              <Image
                src="/fluent.svg"
                alt="Ajouter"
                width={24}
                height={24}
              />
              Ajouter un médicament
            </Link>
            
            <Link
              href="/partenaire/medicaments/incoherences"
              aria-label="Incohérences"
              className="flex items-center justify-center rounded-lg border border-gray-300 p-2 sm:p-3 text-emerald-700 transition-colors hover:bg-gray-50"
            >
              <Image src="/images/dossier.svg" alt="Incohérences" width={24} height={24} />
            </Link>
            <button
              type="button"
              aria-label="Importer"
              onClick={() => setShowImportModal(true)}
              className="flex items-center justify-center rounded-lg border border-gray-300 p-2 sm:p-3 text-emerald-700 transition-colors hover:bg-gray-50"
            >
              <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="mb-6 flex flex-wrap gap-x-2  gap-y-3">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`rounded-full border border-emerald-600 px-4 py-2 text-sm sm:text-base font-bold transition-colors ${
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
              <div className="px-6 py-6 text-sm text-gray-500">Chargement des médicaments...</div>
            ) : (
            <table className="min-w-[520px] w-full table-auto text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 sm:px-8 py-3 sm:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Médicament
                  </th>
                  <th className="px-3 sm:px-8 py-3 sm:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Prix unitaire
                  </th>
                  <th className="px-3 sm:px-8 py-3 sm:py-5 text-right text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => (
                  <tr
                    key={med.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-3 sm:px-8 py-3 sm:py-6 text-sm sm:text-base text-gray-700">
                      {med.nom}
                    </td>
                    <td className="px-3 sm:px-8 py-3 sm:py-6 text-sm sm:text-base text-gray-700">
                      {med.prix}
                    </td>
                    <td className="px-3 sm:px-8 py-3 sm:py-6 text-right">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[med.statut]}`}
                      >
                        {med.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </main>
    </>
  
  );
}
