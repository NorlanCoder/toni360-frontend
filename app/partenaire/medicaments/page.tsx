"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { extractCollection, getPartnerStocks } from "@/lib/api/partner";
import { toast } from "sonner";
import ImportModal from "./components/ImportModal";
import { useHeaderSearch } from "@/app/partenaire/_header-search-context";

/* ──────────────────────────── Types ──────────────────────────── */
type FilterKey = "tous" | "disponible" | "au-seuil" | "indisponible" | "desactives";

interface Medicine {
  id: string;
  nom: string;
  prix: string;
  quantite: number;
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
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("tous");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const { searchQuery, setShowSearch, setSearchPlaceholder, setSearchQuery } = useHeaderSearch();

  useEffect(() => {
    setShowSearch(true);
    setSearchPlaceholder("Rechercher un médicament");
    return () => {
      setShowSearch(false);
      setSearchQuery("");
    };
  }, [setShowSearch, setSearchPlaceholder, setSearchQuery]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "tous", label: "Tous" },
    { key: "disponible", label: "Disponible" },
    { key: "au-seuil", label: "Au seuil" },
    { key: "indisponible", label: "Indisponible" },
    { key: "desactives", label: "Désactivés" },
  ];

  const filteredMedicines = useMemo(
    () =>
      medicines
        .filter((m) => activeFilter === "tous" || m.statut === filterMap[activeFilter])
        .filter((m) =>
          searchQuery.trim() === "" ||
          m.nom.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" })),
    [activeFilter, medicines, searchQuery],
  );

  const moneyFormat = useMemo(
    () =>
      ({
        format: (value: number) =>
          new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " FCFA",
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
            if (stock.produit && stock.produit.is_active === false) {
              statut = "Désactivé";
            } else if (stock.statut === "rupture") {
              statut = "Indisponible";
            } else if (stock.statut === "alerte" || stock.statut === "critique") {
              statut = "Au seuil";
            }

            return {
              id: stock.produit_id,
              nom: stock.produit?.nom ?? "—",
              prix: moneyFormat.format(stock.prix_unitaire ?? 0),
              quantite: stock.quantite ?? 0,
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
          {/* Retour */}
          <Link
            href="/partenaire"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-toni-green-dark-2 hover:underline mb-4"
          >
            ← Retour au tableau de bord
          </Link>

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
              className="inline-flex items-center gap-2 overflow-hidden  text-sm sm:text-base font-bold text-emerald-700 transition-colors"
            >
              <span className="flex items-center justify-center bg-emerald-600 px-3 py-2.5 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span className="px-4 py-2.5 bg-emerald-50  hover:bg-emerald-100">Ajouter un médicament</span>
            </Link>
            
            <Link
              href="/partenaire/medicaments/incoherences"
              aria-label="Normalisation des médicaments"
              className="flex items-center justify-center rounded-lg  p-2 sm:p-3 text-emerald-700 transition-colors hover:bg-gray-50"
            >
              <Image src="/images/dossier.svg" alt="Normalisation des médicaments" width={24} height={24} />
            </Link>
            <button
              type="button"
              aria-label="Importer"
              onClick={() => setShowImportModal(true)}
              className="flex items-center justify-center rounded-lg  p-2 sm:p-3 text-emerald-700 transition-colors hover:bg-gray-50"
            >
              <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="mb-6 flex flex-wrap  gap-x-10  gap-y-3">
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
                  <th className="w-[58%] px-3 sm:px-8 py-3 sm:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Médicament
                  </th>
                  <th className="w-[16%] px-3 sm:px-8 py-3 sm:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Prix unitaire
                  </th>
                  <th className="w-[12%] px-3 sm:px-8 py-3 sm:py-5 text-left text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Quantité
                  </th>
                  <th className="w-[14%] px-3 sm:px-8 py-3 sm:py-5 text-right text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => (
                  <tr
                    key={med.id}
                    onClick={() => router.push(`/partenaire/medicaments/${med.id}`)}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-emerald-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-3 sm:px-8 py-3 sm:py-6 text-sm sm:text-base text-gray-700">
                      {med.nom}
                    </td>
                    <td className="whitespace-nowrap px-3 sm:px-8 py-3 sm:py-6 text-sm sm:text-base text-gray-700">
                      {med.prix}
                    </td>
                    <td className="whitespace-nowrap px-3 sm:px-8 py-3 sm:py-6 text-sm sm:text-base text-gray-700">
                      {med.quantite}
                    </td>
                    <td className="whitespace-nowrap px-3 sm:px-8 py-3 sm:py-6 text-right">
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
