"use client";

import { FormEvent, KeyboardEvent, Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, MapPin, Minus, Plus, Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import {
  addPanierItem,
  getBrowserCoordinates,
  getProductSuggestions,
  searchProduits,
  SearchTermInput,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

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

export default function RecherchePage() {
  return (
    <Suspense fallback={<div />}>
      <RecherchePageContent />
    </Suspense>
  );
}

function RecherchePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [addingTo, setAddingTo] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const inputRef = useRef<HTMLInputElement>(null);

  /* ── auto-focus ── */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* ── suggestions ── */
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const session = getAuthSession();
    if (!session || !session.token) return;

    let active = true;
    const timeout = setTimeout(async () => {
      try {
        const res = await getProductSuggestions(session.token, term);
        if (!active) return;
        setSuggestions(res.data.suggestions);
        setShowSuggestions(res.data.suggestions.length > 0);
        setActiveSuggestionIndex(-1);
      } catch {
        if (!active) return;
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  /* ── lance auto-search si ?q= présent à l'arrivée ── */
  useEffect(() => {
    if (initialQ.trim()) {
      runSearch(initialQ.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(term: string) {
    const session = getAuthSession();
    if (!session || session.userType !== "patient" || !session.token) {
      clearAuthSession();
      router.replace("/client/connexion");
      return;
    }

    setSearching(true);
    setHasSearched(false);
    setResults([]);
    setShowSuggestions(false);

    try {
      let coords = { latitude: 0, longitude: 0 };
      try {
        coords = await getBrowserCoordinates();
      } catch {
        // géolocalisation optionnelle
      }

      const produits: SearchTermInput[] = [{ terme: term, quantite: 1 }];
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
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    router.replace(`/client/recherche?q=${encodeURIComponent(term)}`);
    runSearch(term);
  };

  const handleSuggestionClick = (value: string) => {
    setQuery(value);
    setShowSuggestions(false);
    router.replace(`/client/recherche?q=${encodeURIComponent(value)}`);
    runSearch(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((p) => (p + 1) % suggestions.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((p) => (p <= 0 ? suggestions.length - 1 : p - 1));
      return;
    }
    if (e.key === "Enter" && activeSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestionIndex]);
      return;
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

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

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Barre de recherche ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Rechercher un médicament</h1>
        <form className="relative" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => { setTimeout(() => setShowSuggestions(false), 120); }}
            placeholder="Ex : Doliprane, Amoxicilline..."
            className="w-full rounded-full border border-gray-300 py-3 pl-6 pr-14 text-base text-gray-700 outline-none transition-colors focus:border-toni-green-dark-2"
          />
          <button
            type="submit"
            className="absolute bottom-0 right-0 top-0 flex items-center justify-center rounded-r-full bg-toni-green-dark-2 px-5 text-white transition hover:bg-toni-green-dark"
          >
            <Search size={20} />
          </button>

          {showSuggestions && (
            <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
              {suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={() => handleSuggestionClick(s)}
                  className={`w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 ${
                    i === activeSuggestionIndex ? "bg-gray-50" : ""
                  }`}
                >
                  <Search size={14} className="text-gray-400 shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* ── État : chargement ── */}
      {searching && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-10 h-10 rounded-full border-4 border-toni-green-dark-2 border-t-transparent animate-spin mb-4" />
          <p className="text-sm">Recherche en cours…</p>
        </div>
      )}

      {/* ── Résultats ── */}
      {!searching && hasSearched && results.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {results.length} résultat{results.length > 1 ? "s" : ""} pour{" "}
            <span className="font-semibold text-gray-800">&ldquo;{searchParams.get("q")}&rdquo;</span>
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
                    {/* Sélecteur de quantité */}
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

      {/* ── Aucun résultat ── */}
      {!searching && hasSearched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
          <Search size={40} className="mb-4 opacity-30" />
          <p className="font-medium text-gray-600">Aucun résultat trouvé</p>
          <p className="text-sm mt-1">
            Essayez un autre nom ou vérifiez l&apos;orthographe.
          </p>
        </div>
      )}

      {/* ── État initial (rien encore recherché) ── */}
      {!searching && !hasSearched && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
          <Search size={40} className="mb-4 opacity-20" />
          <p className="text-sm">Tapez le nom d&apos;un médicament pour commencer</p>
        </div>
      )}
    </div>
  );
}
