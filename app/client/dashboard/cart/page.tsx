"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  addPanierItem,
  clearPanier,
  getBrowserCoordinates,
  getPanier,
  removePanierItem,
  searchProduits,
  updatePanierItemQuantity,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

type CartItem = {
  id: string;
  produitId: string;
  name: string;
  type: string;
  qty: number;
  requiresPrescription?: boolean;
};

type SearchProductResult = {
  key: string;
  rechercheId: string;
  produitId: string;
  pharmacieId: string;
  nom: string;
  type: string;
  pharmacieNom: string;
  prix: number;
  stock: number;
  ordonnance: boolean;
};

export default function ClientCartPage() {
  return (
    <Suspense fallback={<div />}> 
      <ClientCartPageContent />
    </Suspense>
  );
}

function ClientCartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("q")?.trim() ?? "";
  const shouldAutoSearch = searchParams.get("auto") === "1";
  const isSearchMode = searchTerm.length > 0;

  const [items, setItems] = useState<CartItem[]>([]);
  const [busyByItem, setBusyByItem] = useState<Record<string, boolean>>({});
  const [globalBusy, setGlobalBusy] = useState(false);
  const [searchProducts, setSearchProducts] = useState<SearchProductResult[]>([]);
  const [busySearchProductKey, setBusySearchProductKey] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [hasLocalized, setHasLocalized] = useState(false);
  const autoSearchAttemptedRef = useRef(false);

  const token = useMemo(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") {
      return null;
    }
    return session.token;
  }, []);

  const loadPanier = async (): Promise<CartItem[]> => {
    if (!token) {
      clearAuthSession();
      router.replace("/client/connexion");
      return [];
    }

    try {
      const response = await getPanier(token);
      const mappedItems = response.data.panier.pharmacies.flatMap((pharmacieBloc) =>
        pharmacieBloc.produits.map((item) => ({
          id: item.id,
          produitId: item.produit.id,
          name: item.produit.nom,
          type: [item.produit.forme, item.produit.dosage].filter(Boolean).join(" ") || "Produit",
          qty: item.quantite,
          requiresPrescription: Boolean(item.produit.necessite_ordonnance),
        })),
      );
      setItems(mappedItems);
      return mappedItems;
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
      return [];
    }
  };

  const updateQty = async (id: string, delta: number) => {
    const item = items.find((entry) => entry.id === id);
    if (!item || !token) {
      return;
    }

    const nextQty = Math.max(1, item.qty + delta);
    setBusyByItem((prev) => ({ ...prev, [id]: true }));
    try {
      await updatePanierItemQuantity(token, id, nextQty);
      await loadPanier();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setBusyByItem((prev) => ({ ...prev, [id]: false }));
    }
  };

  const removeItem = async (id: string) => {
    if (!token) {
      return;
    }

    setBusyByItem((prev) => ({ ...prev, [id]: true }));
    try {
      await removePanierItem(token, id);
      await loadPanier();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setBusyByItem((prev) => ({ ...prev, [id]: false }));
    }
  };

  const removeAll = async () => {
    if (!token) {
      return;
    }

    setGlobalBusy(true);
    try {
      await clearPanier(token);
      await loadPanier();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setGlobalBusy(false);
    }
  };

  useEffect(() => {
    void loadPanier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    setHasLocalized(false);
    setSearchProducts([]);
    autoSearchAttemptedRef.current = false;
  }, [searchTerm]);

  const runProductSearch = useCallback(async () => {
    if (!token) {
      return;
    }

    if (isSearchMode && searchTerm.length < 2) {
      toast.warning("Saisissez au moins 2 caracteres pour lancer la recherche.");
      return;
    }

    const produitsToSearch = isSearchMode
      ? [{ terme: searchTerm, quantite: 1 }]
      : items.map((item) => ({ terme: item.name, quantite: item.qty }));

    if (produitsToSearch.length === 0) {
      toast.warning("Ajoutez d'abord un médicament au panier avant de localiser.");
      return;
    }

    setIsLocating(true);
    try {
      const coordinates = await getBrowserCoordinates();
      const response = await searchProduits(
        token,
        produitsToSearch,
        coordinates,
      );

      if (!isSearchMode) {
        if (response.data.pharmacies.length === 0) {
          toast.warning("Aucune pharmacie disponible à proximité pour votre panier.");
          return;
        }
        router.push("/client/dashboard/cart/checkout");
        return;
      }

      const products = response.data.pharmacies.flatMap((item) =>
        item.produits.map((produit) => ({
          key: `${item.pharmacie.id}-${produit.id}`,
          rechercheId: response.data.recherche_id,
          produitId: produit.id,
          pharmacieId: item.pharmacie.id,
          nom: produit.nom,
          type: [produit.forme, produit.dosage].filter(Boolean).join(" ") || "Produit",
          pharmacieNom: item.pharmacie.nom,
          prix: Number(produit.prix ?? 0),
          stock: Number(produit.quantite_disponible ?? 0),
          ordonnance: Boolean(produit.necessite_ordonnance),
        })),
      );

      setSearchProducts(products);

      setHasLocalized(true);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setIsLocating(false);
    }
  }, [token, isSearchMode, searchTerm, items, router]);

  const handleLocaliser = async () => {
    await runProductSearch();
  };

  useEffect(() => {
    if (!shouldAutoSearch || !searchTerm || hasLocalized || isLocating) {
      return;
    }

    if (searchTerm.length < 2) {
      toast.warning("Saisissez au moins 2 caracteres pour lancer la recherche.");
      return;
    }

    if (autoSearchAttemptedRef.current) {
      return;
    }

    autoSearchAttemptedRef.current = true;

    void runProductSearch();
  }, [shouldAutoSearch, searchTerm, hasLocalized, isLocating, runProductSearch]);

  const handleAddSearchProductToCart = async (result: SearchProductResult) => {
    if (!token) {
      return;
    }

    const previousQty = items.find((entry) => entry.produitId === result.produitId)?.qty ?? 0;
    setBusySearchProductKey(result.key);
    try {
      await addPanierItem(token, result.produitId, 1, result.rechercheId, result.pharmacieId);
      const refreshed = await loadPanier();
      const currentQty =
        refreshed.find((entry) => entry.produitId === result.produitId)?.qty ?? (previousQty + 1);
      toast.success(`Produit ajouté (x${currentQty}).`);
    } catch (error) {
      if (error instanceof ApiError) {
        const details = error.details as {
          data?: {
            action_requise?: string;
            pharmacie_produit?: string;
            pharmacies_autorisees?: string[];
          };
        };

        if (details?.data?.action_requise === "VIDER_PANIER") {
          try {
            await clearPanier(token);
            await addPanierItem(token, result.produitId, 1, result.rechercheId, result.pharmacieId);
            const refreshed = await loadPanier();
            const currentQty =
              refreshed.find((entry) => entry.produitId === result.produitId)?.qty ?? (previousQty + 1);
            toast.success(`Panier réinitialisé pour la nouvelle recherche. Produit ajouté (x${currentQty}).`);
            return;
          } catch (retryError) {
            if (retryError instanceof ApiError) {
              toast.error(retryError.message);
            } else {
              toast.error("Impossible de réinitialiser le panier automatiquement.");
            }
            return;
          }
        }

        const pharmacieProduit = details?.data?.pharmacie_produit;
        const pharmaciesAutorisees = details?.data?.pharmacies_autorisees;

        if (pharmacieProduit && Array.isArray(pharmaciesAutorisees) && pharmaciesAutorisees.length > 0) {
          toast.error(
            `${error.message} Produit: ${pharmacieProduit}. Autorisees: ${pharmaciesAutorisees.join(", ")}.`,
          );
        } else {
          toast.error(error.message);
        }
      }
    } finally {
      setBusySearchProductKey(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-3 pb-6 sm:px-6 sm:pb-8">

      {/* ── Vue Panier ── */}
      <>
      {/* Supprimer tout */}
      <div className="mb-6">
        <button
          onClick={removeAll}
          disabled={globalBusy}
          className="text-xl font-medium text-toni-green-dark-2 underline sm:text-base"
        >
          Supprimer tout
        </button>
      </div>

      {/* Products grid */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative rounded-2xl border border-gray-200 bg-white p-4 sm:p-6"
          >
            {item.requiresPrescription && (
              <FileText size={18} className="absolute right-4 top-4 text-red-500" />
            )}
            <div className="mb-5 sm:mb-6">
              <h3 className="text-base md:text-xl font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm md:text-base text-black">{item.type}</p>
            </div>

            <div className="flex items-center justify-between">
              {/* Qty */}
              <div className="inline-flex items-center rounded-full border border-gray-200 px-2 py-1">
                <button
                  onClick={() => updateQty(item.id, -1)}
                  disabled={Boolean(busyByItem[item.id])}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  aria-label="Diminuer"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 text-sm font-semibold text-gray-800 min-w-[24px] text-center">
                  {item.qty}
                </span>
                <button
                  onClick={() => updateQty(item.id, 1)}
                  disabled={Boolean(busyByItem[item.id])}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-toni-green-dark-2 hover:bg-toni-green-light"
                  aria-label="Augmenter"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeItem(item.id)}
                disabled={Boolean(busyByItem[item.id])}
                className="text-red-400 hover:text-red-600"
                aria-label="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Prescription message */}
      <p className="mt-8 text-[#ff6b5c] text-base font-medium">
        Ayez votre ordonnance prête pour les produits soumis à prescription.
      </p>

      {/* Localiser */}
      <div className="mt-6 w-full">
        {!isSearchMode && (
          <button
            onClick={handleLocaliser}
            disabled={isLocating}
            className="block w-full rounded-full bg-toni-green-dark-2 py-3 text-base font-bold text-white transition hover:bg-toni-green-dark disabled:opacity-70"
          >
            {isLocating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Localisation en cours…
              </span>
            ) : "Localiser"}
          </button>
        )}

        {hasLocalized && isSearchMode && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Médicaments trouvés pour &quot;{searchTerm}&quot;
            </h3>
            {searchProducts.length > 0 ? (
              <div className="space-y-3">
                {searchProducts.map((produit) => (
                  <div
                    key={produit.key}
                    className="flex flex-col gap-3 rounded-xl border border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {produit.nom}
                        {produit.ordonnance && <FileText size={14} className="text-red-500" />}
                      </p>
                      <p className="text-sm text-gray-500">{produit.type}</p>
                      <p className="text-sm text-gray-500">
                        {produit.pharmacieNom} · Stock: {produit.stock}
                      </p>
                    </div>
                    <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                      <span className="text-sm font-semibold text-toni-green-dark-2 sm:text-base">
                        {Number(produit.prix ?? 0).toLocaleString("fr-FR")} FCFA
                      </span>
                      <button
                        onClick={() => handleAddSearchProductToCart(produit)}
                        disabled={busySearchProductKey === produit.key}
                        className="rounded-full bg-toni-green-dark-2 px-4 py-2 text-sm font-semibold text-white transition hover:bg-toni-green-dark"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucun produit disponible pour cette recherche.</p>
            )}
          </div>
        )}
      </div>
      </>
    </section>
  );
}
