"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Minus,
  Plus,
  MapPin,
  Trash2,
} from "lucide-react";
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

type NearbyPharmacy = {
  id: string;
  name: string;
  address: string;
  distance: string;
  produits: Array<{
    id: string;
    nom: string;
    quantiteDemandee: number;
    quantiteDisponible: number;
  }>;
};

type SearchProductResult = {
  key: string;
  rechercheId: string;
  produitId: string;
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
  const [message, setMessage] = useState<string>("");
  const [showNearbyPharmacies, setShowNearbyPharmacies] = useState(false);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<NearbyPharmacy[]>([]);
  const [searchProducts, setSearchProducts] = useState<SearchProductResult[]>([]);
  const [busySearchProductKey, setBusySearchProductKey] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [hasLocalized, setHasLocalized] = useState(false);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number | null>(null);
  const [localizationSummary, setLocalizationSummary] = useState<string>("");

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
        setMessage(error.message);
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
        setMessage(error.message);
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
        setMessage(error.message);
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
        setMessage(error.message);
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
    setShowNearbyPharmacies(false);
    setNearbyPharmacies([]);
    setSearchProducts([]);
    setSearchRadiusKm(null);
    setLocalizationSummary("");
  }, [searchTerm]);

  const runProductSearch = useCallback(async () => {
    if (!token) {
      return;
    }

    const produitsToSearch = isSearchMode
      ? [{ terme: searchTerm, quantite: 1 }]
      : items.map((item) => ({ terme: item.name, quantite: item.qty }));

    if (produitsToSearch.length === 0) {
      setMessage("Ajoutez d'abord un médicament au panier avant de localiser.");
      return;
    }

    setIsLocating(true);
    setMessage("");
    try {
      const coordinates = await getBrowserCoordinates();
      const response = await searchProduits(
        token,
        produitsToSearch,
        coordinates,
      );
      setLocalizationSummary(response.message ?? "");

      const rawRadius = (response.data as { rayon_trouve_km?: number; rayon_recherche_km?: number }).rayon_trouve_km
        ?? (response.data as { rayon_trouve_km?: number; rayon_recherche_km?: number }).rayon_recherche_km;
      setSearchRadiusKm(typeof rawRadius === "number" ? rawRadius : null);

      const mapped = response.data.pharmacies.map((item) => ({
        id: item.pharmacie.id,
        name: item.pharmacie.nom,
        address: [item.pharmacie.ville, item.pharmacie.quartier, item.pharmacie.adresse]
          .filter(Boolean)
          .join(", "),
        distance:
          typeof item.pharmacie.distance_km === "number"
            ? `${item.pharmacie.distance_km.toString().replace(".", ",")} km`
            : "-",
        produits: item.produits.map((produit) => ({
          id: produit.id,
          nom: produit.nom,
          quantiteDemandee: Number(produit.quantite_demandee ?? 0),
          quantiteDisponible: Number(produit.quantite_disponible ?? 0),
        })),
      }));

      const products = response.data.pharmacies.flatMap((item) =>
        item.produits.map((produit) => ({
          key: `${item.pharmacie.id}-${produit.id}`,
          rechercheId: response.data.recherche_id,
          produitId: produit.id,
          nom: produit.nom,
          type: [produit.forme, produit.dosage].filter(Boolean).join(" ") || "Produit",
          pharmacieNom: item.pharmacie.nom,
          prix: Number(produit.prix ?? 0),
          stock: Number(produit.quantite_disponible ?? 0),
          ordonnance: Boolean(produit.necessite_ordonnance),
        })),
      );

      setNearbyPharmacies(mapped);
      setSearchProducts(products);
      setHasLocalized(true);
      setShowNearbyPharmacies(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    } finally {
      setIsLocating(false);
    }
  }, [token, isSearchMode, searchTerm, items]);

  const handleLocaliser = async () => {
    await runProductSearch();
  };

  useEffect(() => {
    if (!shouldAutoSearch || !searchTerm || hasLocalized || isLocating) {
      return;
    }

    void runProductSearch();
  }, [shouldAutoSearch, searchTerm, hasLocalized, isLocating, runProductSearch]);

  const handleAddSearchProductToCart = async (result: SearchProductResult) => {
    if (!token) {
      return;
    }

    const previousQty = items.find((entry) => entry.produitId === result.produitId)?.qty ?? 0;
    setBusySearchProductKey(result.key);
    setMessage("");
    try {
      await addPanierItem(token, result.produitId, 1, result.rechercheId);
      const refreshed = await loadPanier();
      const currentQty =
        refreshed.find((entry) => entry.produitId === result.produitId)?.qty ?? (previousQty + 1);
      setMessage(`Produit ajouté (x${currentQty}).`);
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    } finally {
      setBusySearchProductKey(null);
    }
  };

  return (
    <>
      {/* Supprimer tout */}
      <div className="mb-6">
        <button
          onClick={removeAll}
          disabled={globalBusy}
          className="text-toni-green-dark-2 text-base font-medium hover:underline"
        >
          Supprimer tout
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-red-500">{message}</p>}

      {/* Products grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ maxWidth: "920px" }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="relative border border-gray-200 rounded-2xl p-6 bg-white"
          >
            {item.requiresPrescription && (
              <FileText size={18} className="absolute right-4 top-4 text-red-500" />
            )}
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-400">{item.type}</p>
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
      <div className="mt-6" style={{ maxWidth: "920px" }}>
        {!isSearchMode && (
          <button
            onClick={handleLocaliser}
            disabled={isLocating}
            className="w-2/5 mx-auto py-3 bg-toni-green-dark-2 text-white rounded-full text-lg font-bold hover:bg-toni-green-dark transition"
          >
            Localiser
          </button>
        )}

        {!isSearchMode && hasLocalized && showNearbyPharmacies && (
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Pharmacies à moins de {searchRadiusKm !== null ? `${searchRadiusKm.toString().replace(".", ",")} km` : "20 km"}
            </h3>
            {localizationSummary && (
              <p className="mb-4 text-sm text-gray-600">{localizationSummary}</p>
            )}
            <div className="space-y-4">
              {nearbyPharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.id}
                  className="group flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition-colors hover:bg-[#008F4F]"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{pharmacy.name}</p>
                    <p className="flex items-center gap-2 text-sm text-gray-500 group-hover:text-white">
                      <MapPin size={14} className="text-gray-500 group-hover:text-white" />
                      {pharmacy.address}
                    </p>
                    <div className="mt-2 space-y-1">
                      {pharmacy.produits.map((produit) => (
                        <p key={`${pharmacy.id}-${produit.id}`} className="text-xs text-gray-500 group-hover:text-white">
                          {produit.nom} · Qté demandée: {produit.quantiteDemandee} · Stock: {produit.quantiteDisponible}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-toni-green-dark-2 group-hover:text-white">
                      {pharmacy.distance}
                    </span>
                    <Link
                      href={`/client/dashboard/cart/checkout?pharmacy=${encodeURIComponent(pharmacy.name)}`}
                      className="px-4 py-2 rounded-full bg-white text-[#008F4F] text-sm font-semibold border border-white hover:bg-gray-50 transition"
                    >
                      Commander
                    </Link>
                  </div>
                </div>
              ))}

              {nearbyPharmacies.length === 0 && (
                <p className="text-sm text-gray-500">Aucune pharmacie trouvée pour cette recherche.</p>
              )}
            </div>
          </div>
        )}

        {hasLocalized && isSearchMode && (
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Médicaments trouvés pour "{searchTerm}"
            </h3>
            {searchProducts.length > 0 ? (
              <div className="space-y-3">
                {searchProducts.map((produit) => (
                  <div
                    key={produit.key}
                    className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {produit.nom}
                        {produit.ordonnance && <FileText size={14} className="text-red-500" />}
                      </p>
                      <p className="text-sm text-gray-500">{produit.type}</p>
                      <p className="text-sm text-gray-500">
                        {produit.pharmacieNom} · Stock: {produit.stock}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-toni-green-dark-2">
                        {Number(produit.prix ?? 0).toLocaleString("fr-FR")} FCFA
                      </span>
                      <button
                        onClick={() => handleAddSearchProductToCart(produit)}
                        disabled={busySearchProductKey === produit.key}
                        className="px-4 py-2 rounded-full bg-toni-green-dark-2 text-white text-sm font-semibold hover:bg-toni-green-dark transition"
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
  );
}
