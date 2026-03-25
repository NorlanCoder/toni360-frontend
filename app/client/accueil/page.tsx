"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, MapPin, Minus, Plus, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { getPatientProfile } from "@/lib/api/auth";
import {
  addPanierItem,
  getBrowserCoordinates,
  searchProduits,
  type SearchTermInput,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";
import { useSearch } from "@/lib/search-context";
import { useCart } from "@/lib/cart-context";

type SearchResult = {
  key: string;
  rechercheId: string;
  produitId: string;
  pharmacieId: string;
  nom: string;
  forme?: string | null;
  dosage?: string | null;
  pharmacieNom: string;
  pharmacieAdresse?: string | null;
  pharmacieVille?: string | null;
  distanceKm?: number;
  prix: number;
  stock: number;
  ordonnance: boolean;
};

export default function AccueilClientPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Mr Vagelas");
  const { searchTerm, searchVersion } = useSearch();
  const { refreshCart } = useCart();

  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [addingTo, setAddingTo] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const syncProfile = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "patient" || !session.token) {
        clearAuthSession();
        router.replace("/client/connexion");
        return;
      }

      try {
        const response = await getPatientProfile(session.token);
        const patient = response.data.patient;
        const name = patient.nom_complet || `${patient.prenom ?? ""} ${patient.nom ?? ""}`.trim();
        if (name) {
          setDisplayName(name);
        }
      } catch (error: unknown) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearAuthSession();
          router.replace("/client/connexion");
        }
      }
    };

    void syncProfile();
  }, [router]);

  /* ── Listen to search context ── */
  useEffect(() => {
    if (searchVersion === 0) return;

    if (!searchTerm) {
      setHasSearched(false);
      setResults([]);
      return;
    }

    const runSearch = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "patient" || !session.token) {
        clearAuthSession();
        router.replace("/client/connexion");
        return;
      }

      setSearching(true);
      setHasSearched(false);
      setResults([]);

      try {
        let coords = { latitude: 0, longitude: 0 };
        try {
          coords = await getBrowserCoordinates();
        } catch {
          // géolocalisation optionnelle
        }

        const produits: SearchTermInput[] = [{ terme: searchTerm, quantite: 1 }];
        const res = await searchProduits(session.token, produits, coords);

        const flat: SearchResult[] = [];
        for (const ph of res.data.pharmacies) {
          for (const prod of ph.produits) {
            flat.push({
              key: `${ph.pharmacie.id}-${prod.id}`,
              rechercheId: res.data.recherche_id,
              produitId: prod.id,
              pharmacieId: ph.pharmacie.id,
              nom: prod.nom,
              forme: prod.forme,
              dosage: prod.dosage,
              pharmacieNom: ph.pharmacie.nom,
              pharmacieAdresse: ph.pharmacie.adresse,
              pharmacieVille: ph.pharmacie.ville,
              distanceKm: ph.pharmacie.distance_km,
              prix: prod.prix,
              stock: prod.quantite_disponible,
              ordonnance: prod.necessite_ordonnance ?? false,
            });
          }
        }

        setResults(flat);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearAuthSession();
          router.replace("/client/connexion");
          return;
        }
        toast.error("Erreur lors de la recherche. Veuillez réessayer.");
      } finally {
        setSearching(false);
        setHasSearched(true);
      }
    };

    void runSearch();
  }, [searchTerm, searchVersion, router]);

  const handleAddToCart = async (item: SearchResult) => {
    const session = getAuthSession();
    if (!session || !session.token) {
      clearAuthSession();
      router.replace("/client/connexion");
      return;
    }

    const qty = quantities[item.key] ?? 1;
    setAddingTo((p) => ({ ...p, [item.key]: true }));
    try {
      await addPanierItem(session.token, item.produitId, qty, item.rechercheId, item.pharmacieId);
      toast.success(`${item.nom} ajouté au panier`);
      refreshCart();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAuthSession();
        router.replace("/client/connexion");
        return;
      }
      toast.error("Impossible d'ajouter au panier.");
    } finally {
      setAddingTo((p) => ({ ...p, [item.key]: false }));
    }
  };

  const changeQty = (key: string, delta: number) => {
    setQuantities((p) => ({ ...p, [key]: Math.max(1, (p[key] ?? 1) + delta) }));
  };

  const isSearchActive = searchTerm.length > 0 || hasSearched;

  /* ── Search results view ── */
  if (isSearchActive) {
    return (
      <section className="mx-auto w-full max-w-5xl px-3 py-2 sm:px-6 sm:py-4 lg:px-8">
        {/* Loading */}
        {searching && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-10 h-10 rounded-full border-4 border-toni-green-dark-2 border-t-transparent animate-spin mb-4" />
            <p className="text-sm">Recherche en cours…</p>
          </div>
        )}

        {/* Results */}
        {!searching && hasSearched && results.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              {results.length} résultat{results.length > 1 ? "s" : ""} pour{" "}
              <span className="font-semibold text-gray-800">&ldquo;{searchTerm}&rdquo;</span>
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {results.map((item) => {
                const qty = quantities[item.key] ?? 1;
                return (
                  <div
                    key={item.key}
                    className="relative rounded-2xl border border-gray-200 bg-white p-4 sm:p-6"
                  >
                    {item.ordonnance && (
                      <FileText size={18} className="absolute right-4 top-4 text-red-500" />
                    )}

                    <div className="mb-5 sm:mb-6">
                      <h3 className="text-base md:text-xl font-semibold text-gray-900">
                        {item.nom}
                        {item.dosage && (
                          <span className="ml-1 font-normal"> {item.dosage}</span>
                        )}
                      </h3>
                      <p className="text-sm md:text-base text-black">{item.forme ?? "Produit"}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} />
                        {item.pharmacieNom}
                        {item.distanceKm != null && (
                          <span className="text-toni-green-dark-2 font-medium ml-1">
                            · {item.distanceKm.toFixed(1)} km
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center rounded-full border border-gray-200 px-2 py-1">
                        <button
                          type="button"
                          onClick={() => changeQty(item.key, -1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          aria-label="Diminuer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-semibold text-gray-800 min-w-[24px] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => changeQty(item.key, 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-toni-green-dark-2 hover:bg-toni-green-light"
                          aria-label="Augmenter"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-toni-green-dark-2">
                        {item.prix.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      disabled={addingTo[item.key]}
                      className="block w-full rounded-full bg-toni-green py-2.5 md:py-3 text-sm md:text-base font-bold text-white transition hover:bg-toni-green-dark disabled:opacity-60"
                    >
                      {addingTo[item.key] ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Ajout…
                        </span>
                      ) : (
                        "Ajouter au panier"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => router.push("/client/dashboard/cart")}
                className="flex items-center gap-2 rounded-full border border-toni-green-dark-2 px-6 py-2.5 text-sm font-semibold text-toni-green-dark-2 transition hover:bg-[#E6F6F0]"
              >
                <ShoppingCart size={16} />
                Voir mon panier
              </button>
            </div>
          </div>
        )}

        {/* No results */}
        {!searching && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
            <Search size={40} className="mb-4 opacity-30" />
            <p className="font-medium text-gray-600">Aucun résultat trouvé</p>
            <p className="text-sm mt-1">
              Essayez un autre nom ou vérifiez l&apos;orthographe.
            </p>
          </div>
        )}
      </section>
    );
  }

  /* ── Default accueil view ── */
  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-2 sm:px-6 sm:py-4 lg:px-8">
      {/* Welcome */}
      <h1 className="mb-4 break-words text-xl font-bold leading-tight text-gray-900 sm:mb-6 sm:text-3xl lg:text-4xl">
        Bienvenue, {displayName}
      </h1>

      {/* Hero card */}
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-sm sm:rounded-3xl">
        <div className="relative aspect-[3/4] w-full sm:aspect-[16/10] lg:aspect-[16/9]">
          <Image
            src="/images/ph7.png"
            alt="Pharmacie"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 960px"
            className="object-cover"
          />
        </div>
        {/* Green gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,128,80,0.85) 0%, rgba(0,128,80,0.2) 50%, transparent 100%)",
          }}
        />
        {/* Text on image */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 md:p-8 lg:p-10">
          <p className="text-base font-bold leading-snug text-white sm:max-w-3xl sm:text-2xl md:text-3xl">
            Trouvez facilement votre médicament.
          </p>
        </div>
      </div>
    </section>
  );
}
