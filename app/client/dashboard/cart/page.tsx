"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Minus,
  Plus,
  MapPin,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  addPanierItem,
  clearPanier,
  createCommande,
  getBrowserCoordinates,
  getCommande,
  getPanier,
  removePanierItem,
  searchProduits,
  updatePanierItemQuantity,
  uploadOrdonnanceForProduitCommande,
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

type PharmacyDetailResult = {
  id: string;
  rechercheId: string;
  nom: string;
  adresse: string;
  telephone?: string | null;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  produits: Array<{
    key: string;
    id: string;
    nom: string;
    forme?: string | null;
    dosage?: string | null;
    prix: number;
    ordonnance: boolean;
    quantiteDemandee: number;
  }>;
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
  const [pharmacyDetails, setPharmacyDetails] = useState<PharmacyDetailResult[]>([]);
  const [resultQtys, setResultQtys] = useState<Record<string, number>>({});
  const [ordonnanceFiles, setOrdonnanceFiles] = useState<Record<string, File | null>>({});
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
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
    setPharmacyDetails([]);
    setResultQtys({});
    setOrdonnanceFiles({});
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

      const details: PharmacyDetailResult[] = response.data.pharmacies.map((ph) => {
        const coords = ph.pharmacie as typeof ph.pharmacie & { latitude?: number; longitude?: number };
        return {
          id: ph.pharmacie.id,
          rechercheId: response.data.recherche_id,
          nom: ph.pharmacie.nom,
          adresse: [ph.pharmacie.quartier, ph.pharmacie.adresse, ph.pharmacie.ville].filter(Boolean).join(", "),
          telephone: ph.pharmacie.telephone,
          latitude: coords.latitude,
          longitude: coords.longitude,
          distanceKm: ph.pharmacie.distance_km,
          produits: ph.produits.map((p) => ({
            key: `${ph.pharmacie.id}-${p.id}`,
            id: p.id,
            nom: p.nom,
            forme: p.forme,
            dosage: p.dosage,
            prix: Number(p.prix ?? 0),
            ordonnance: Boolean(p.necessite_ordonnance),
            quantiteDemandee: Number(p.quantite_demandee ?? 1),
          })),
        };
      });
      setPharmacyDetails(details);
      const initQtys: Record<string, number> = {};
      details.forEach((ph) => ph.produits.forEach((p) => { initQtys[p.key] = p.quantiteDemandee; }));
      setResultQtys(initQtys);

      setHasLocalized(true);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setIsLocating(false);
    }
  }, [token, isSearchMode, searchTerm, items]);

  const handleLocaliser = async () => {
    await runProductSearch();
  };

  const uploadOrdonnancesForCommande = async (commandeId: string, file: File) => {
    if (!token) return;
    const commandeDetail = await getCommande(token, commandeId);
    const produitsSansOrdonnance = commandeDetail.data.commande.produits.filter(
      (p) => p.ordonnance_requise && !p.ordonnance,
    );
    for (const produit of produitsSansOrdonnance) {
      try {
        await uploadOrdonnanceForProduitCommande(token, produit.id, file);
      } catch (error) {
        if (!(error instanceof ApiError)) throw error;
        const msg = error.message.toLowerCase();
        if (!msg.includes("deja en cours") && !msg.includes("déjà en cours")) throw error;
      }
    }
  };

  const handleValiderCommande = async (pharmacy: PharmacyDetailResult) => {
    if (!token || isValidating) return;
    setIsValidating(true);
    try {
      const panierResp = await getPanier(token);
      const panierId = panierResp.data.panier.id;
      if (!panierId) {
        toast.error("Panier introuvable.");
        return;
      }
      const commandeResp = await createCommande(token, panierId);
      const commandeId = commandeResp.data.commande.id;
      const file = ordonnanceFiles[pharmacy.id];
      if (file) {
        await uploadOrdonnancesForCommande(commandeId, file);
      }
      router.push(`/client/dashboard/cart/checkout?commande=${commandeId}`);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
    } finally {
      setIsValidating(false);
    }
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

      {/* ── Vue Panier (masquée quand localisé hors mode recherche) ── */}
      {!(hasLocalized && !isSearchMode) && (
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
              <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
              <p className="text-base text-black">{item.type}</p>
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
      )}

      {/* ── Vue Pharmacies (après Localiser) ── */}
      {hasLocalized && !isSearchMode && (
        <div className="space-y-10">
          {pharmacyDetails.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              <p>Aucune pharmacie trouvée à proximité.</p>
              <button
                type="button"
                onClick={() => { setHasLocalized(false); setPharmacyDetails([]); }}
                className="mt-3 text-toni-green-dark-2 underline text-sm"
              >
                Retour au panier
              </button>
            </div>
          )}

          {pharmacyDetails.map((pharmacy) => {
            const total = pharmacy.produits.reduce(
              (sum, p) => sum + p.prix * (resultQtys[p.key] ?? p.quantiteDemandee), 0
            );
            const hasPrescription = pharmacy.produits.some((p) => p.ordonnance);
            const mapsUrl = pharmacy.latitude && pharmacy.longitude
              ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.adresse)}`;

            return (
              <div key={pharmacy.id}>

                {/* ── Header pharmacie ── */}
                <div className="rounded-2xl bg-gradient-to-r from-[#004B2F] to-[#00B16F] px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white sm:text-2xl leading-snug">{pharmacy.nom}</h2>
                    <p className="mt-1 text-sm text-green-100 leading-snug">{pharmacy.adresse}</p>
                  </div>
                  <div className="flex flex-col gap-1 sm:text-right">
                    {pharmacy.telephone && (
                      <p className="text-white text-sm font-medium">{pharmacy.telephone}</p>
                    )}
                    {pharmacy.distanceKm != null && (
                      <p className="text-green-200 text-xs">
                        à {pharmacy.distanceKm.toFixed(2).replace(".", ",")} km
                      </p>
                    )}
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-white px-5 py-2.5 text-sm font-bold text-toni-green-dark-2 hover:bg-gray-50 transition shrink-0"
                  >
                    <MapPin size={16} />
                    Itinéraire
                  </a>
                </div>

                {/* ── Table produits ── */}
                <div className="  overflow-hidden bg-white">

                  {/* En-têtes colonnes (desktop) */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_180px_150px_150px_44px] gap-2 px-6 py-3 text-base font-bold text-[#B5B5B5] border-b border-[#66666680]">
                    <span>Nom du produit</span>
                    <span className="text-center">Qté</span>
                    <span>Prix</span>
                    <span>Total</span>
                    <span />
                  </div>

                  {pharmacy.produits.map((produit, idx) => {
                    const qty = resultQtys[produit.key] ?? produit.quantiteDemandee;
                    return (
                      <div
                        key={produit.key}
                        className={`flex flex-col gap-3 px-6 py-4 sm:grid sm:grid-cols-[1fr_180px_150px_150px_44px] sm:gap-2 sm:items-center ${
                          idx < pharmacy.produits.length - 1 ? "border-b border-[#66666680]" : ""
                        }`}
                      >
                        {/* Nom */}
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            {produit.nom}{produit.dosage ? ` ${produit.dosage}` : ""}
                            {produit.ordonnance && <FileText size={15} className="text-red-500 shrink-0" />}
                          </p>
                          <p className="text-sm text-gray-500">{produit.forme ?? "Produit"}</p>
                        </div>

                        {/* Qté */}
                        <div className="flex sm:justify-center">
                          <div className="inline-flex items-center rounded-full border border-gray-200 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => setResultQtys((prev) => ({ ...prev, [produit.key]: Math.max(1, qty - 1) }))}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="px-3 text-sm font-semibold text-gray-800 min-w-[24px] text-center">{qty}</span>
                            <button
                              type="button"
                              onClick={() => setResultQtys((prev) => ({ ...prev, [produit.key]: qty + 1 }))}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-toni-green-dark-2 hover:bg-toni-green-light"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Prix */}
                        <span className="text-sm text-gray-700 whitespace-nowrap">
                          <span className="sm:hidden text-gray-400 mr-1">Prix :</span>
                          {produit.prix.toLocaleString("fr-FR")} XOF CFA
                        </span>

                        {/* Total */}
                        <span className="text-sm text-gray-700 whitespace-nowrap">
                          <span className="sm:hidden text-gray-400 mr-1">Total :</span>
                          {(produit.prix * qty).toLocaleString("fr-FR")} XOF CFA
                        </span>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            setPharmacyDetails((prev) =>
                              prev.map((ph) =>
                                ph.id === pharmacy.id
                                  ? { ...ph, produits: ph.produits.filter((p) => p.key !== produit.key) }
                                  : ph
                              )
                            )
                          }
                          className="flex sm:justify-center text-red-400 hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Montant total */}
                  <div className="flex items-center justify-between bg-[#D7EFDA] px-6 py-5">
                    <span className="text-2xl font-bold text-gray-900">Montant total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {total.toLocaleString("fr-FR")} XOF CFA
                    </span>
                  </div>
                </div>

                {/* Ajouter une ordonnance */}
                {hasPrescription && (
                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[pharmacy.id]?.click()}
                      className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-toni-green-dark-2 transition"
                    >
                      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-toni-green-dark-2 text-white shrink-0">
                        <Plus size={18} />
                      </span>
                      {ordonnanceFiles[pharmacy.id]
                        ? <span className="text-toni-green-dark-2 truncate max-w-[240px]">{ordonnanceFiles[pharmacy.id]!.name}</span>
                        : "Ajouter une ordonnance"
                      }
                    </button>
                    <input
                      ref={(el) => { fileInputRefs.current[pharmacy.id] = el; }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setOrdonnanceFiles((prev) => ({ ...prev, [pharmacy.id]: file }));
                      }}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => { setHasLocalized(false); setPharmacyDetails([]); setResultQtys({}); }}
                    className="flex-1 rounded-full border-2 border-toni-green-dark-2 py-3 text-base font-bold text-toni-green-dark-2 transition hover:bg-[#E6F6F0]"
                  >
                    Retour
                  </button>
                  {/* <button
                    type="button"
                    className="flex-1 rounded-full bg-gray-200 py-3 text-base font-bold text-gray-500 transition hover:bg-gray-300"
                  >
                    Mettre en attente
                  </button> */}
                  <button
                    type="button"
                    onClick={() => handleValiderCommande(pharmacy)}
                    disabled={isValidating || (hasPrescription && !ordonnanceFiles[pharmacy.id])}
                    className="flex-1 rounded-full bg-toni-green-dark-2 py-3 text-base font-bold text-white transition hover:bg-toni-green-dark disabled:opacity-70"
                  >
                    {isValidating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Validation…
                      </span>
                    ) : "Valider la commande"}
                  </button>
                  {hasPrescription && !ordonnanceFiles[pharmacy.id] && (
                    <p className="text-sm text-red-500 text-center mt-2">
                      Veuillez ajouter votre ordonnance avant de valider.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
