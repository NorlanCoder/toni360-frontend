"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Camera, Upload } from "lucide-react";
import {
  clearPanier,
  createCommande,
  getCommande,
  getPanier,
  removePanierItem,
  updatePanierItemQuantity,
  uploadOrdonnanceForProduitCommande,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

interface CartItem {
  id: string;
  name: string;
  type: string;
  qty: number;
  price: number;
  requiresPrescription: boolean;
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="px-6 pb-8 flex-1" />}>
      <CartPageContent />
    </Suspense>
  );
}

function CartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pharmacyNameFromUrl = searchParams.get("pharmacy") || "Pharmacie";
  const commandeIdFromUrl = searchParams.get("commande");
  const isCommandeValidationMode = Boolean(commandeIdFromUrl);

  const [panierId, setPanierId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [ordonnanceFile, setOrdonnanceFile] = useState<File | null>(null);
  const [pharmacyName, setPharmacyName] = useState(pharmacyNameFromUrl);
  const [prescriptionCount, setPrescriptionCount] = useState(0);

  const token = useMemo(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") {
      return null;
    }
    return session.token;
  }, []);

  const loadPanier = async () => {
    if (!token) {
      clearAuthSession();
      router.replace("/client/connexion");
      return;
    }

    try {
      const response = await getPanier(token);
      const panier = response.data.panier;
      setPanierId(panier.id);
      const resolvedPharmacyName = panier.pharmacies[0]?.pharmacie?.nom ?? pharmacyNameFromUrl;
      setPharmacyName(resolvedPharmacyName);

      const mappedItems = panier.pharmacies.flatMap((pharmacieBloc) =>
        pharmacieBloc.produits.map((item) => ({
          id: item.id,
          name: item.produit.nom,
          type: [item.produit.forme, item.produit.dosage].filter(Boolean).join(" ") || "Produit",
          qty: item.quantite,
          price: Number(item.prix_unitaire ?? 0),
          requiresPrescription: Boolean(item.produit.necessite_ordonnance),
        })),
      );

      setItems(mappedItems);
      setPrescriptionCount(panier.produits_avec_ordonnance.length);
      if (mappedItems.length === 0) {
        setMessage("Votre panier est vide.");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    }
  };

  const loadCommande = async (commandeId: string) => {
    if (!token) {
      clearAuthSession();
      router.replace("/client/connexion");
      return;
    }

    try {
      const response = await getCommande(token, commandeId);
      const commande = response.data.commande;
      setPanierId(null);
      setPharmacyName(commande.pharmacie?.nom ?? pharmacyNameFromUrl);

      const mappedItems: CartItem[] = commande.produits.map((item) => ({
        id: item.id,
        name: item.produit?.nom ?? "Produit",
        type: "Produit",
        qty: Number(item.quantite ?? 1),
        price: Number(item.prix_unitaire ?? 0),
        requiresPrescription: Boolean(item.ordonnance_requise),
      }));

      setItems(mappedItems);
      setPrescriptionCount(mappedItems.filter((item) => item.requiresPrescription).length);
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    }
  };

  useEffect(() => {
    if (isCommandeValidationMode && commandeIdFromUrl) {
      void loadCommande(commandeIdFromUrl);
      return;
    }

    void loadPanier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isCommandeValidationMode, commandeIdFromUrl]);

  const uploadOrdonnances = async (commandeId: string, file: File) => {
    if (!token) {
      return;
    }

    const commandeDetail = await getCommande(token, commandeId);
    const produitsAvecOrdonnance = commandeDetail.data.commande.produits.filter(
      (produit) => produit.ordonnance_requise,
    );

    for (const produit of produitsAvecOrdonnance) {
      await uploadOrdonnanceForProduitCommande(token, produit.id, file);
    }
  };

  const updateQty = async (id: string, delta: number) => {
    if (!token) {
      return;
    }

    const item = items.find((entry) => entry.id === id);
    if (!item) {
      return;
    }

    const nextQty = Math.max(1, item.qty + delta);
    setPending(true);
    try {
      await updatePanierItemQuantity(token, id, nextQty);
      await loadPanier();
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    } finally {
      setPending(false);
    }
  };

  const removeItem = async (id: string) => {
    if (!token) {
      return;
    }

    setPending(true);
    try {
      await removePanierItem(token, id);
      await loadPanier();
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    } finally {
      setPending(false);
    }
  };

  const handleCancel = async () => {
    if (!token) {
      return;
    }

    setPending(true);
    try {
      await clearPanier(token);
      router.push("/client/dashboard/cart");
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    } finally {
      setPending(false);
    }
  };

  const handleCheckout = async () => {
    if (pending) {
      return;
    }

    if (isCommandeValidationMode && commandeIdFromUrl) {
      if (prescriptionCount > 0 && !ordonnanceFile) {
        setMessage("Cette commande nécessite une ordonnance. Veuillez importer un fichier.");
        return;
      }

      setPending(true);
      setMessage("");
      try {
        if (ordonnanceFile) {
          await uploadOrdonnances(commandeIdFromUrl, ordonnanceFile);
        }

        router.push("/client/orders");
      } catch (error) {
        if (error instanceof ApiError) {
          setMessage(error.message);
        }
      } finally {
        setPending(false);
      }

      return;
    }

    if (!token || !panierId || items.length === 0) {
      setMessage("Votre panier est vide.");
      return;
    }

    setPending(true);
    setMessage("");
    try {
      const creation = await createCommande(token, panierId);
      const commandeId = creation.data.commande.id;

      if (creation.data.necessite_ordonnance && ordonnanceFile) {
        await uploadOrdonnances(commandeId, ordonnanceFile);
      }

      router.push(`/client/orders?commande=${encodeURIComponent(creation.data.commande.numero_commande)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    } finally {
      setPending(false);
    }
  };

  const handlePutOnHold = async () => {
    if (pending) {
      return;
    }

    if (!token || !panierId || items.length === 0) {
      setMessage("Votre panier est vide.");
      return;
    }

    setPending(true);
    setMessage("");
    try {
      const creation = await createCommande(token, panierId, "Commande mise en attente par le patient");
      if (creation.data.necessite_ordonnance && ordonnanceFile) {
        await uploadOrdonnances(creation.data.commande.id, ordonnanceFile);
      }
      router.push(`/client/orders?commande=${encodeURIComponent(creation.data.commande.numero_commande)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    } finally {
      setPending(false);
    }
  };

  const formatPrice = (value: number | null | undefined) =>
    Number(value ?? 0).toLocaleString("fr-FR").replace(/,/g, " ");

  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <div className="px-6 pb-8 flex-1">
          {message && <p className="mb-4 text-sm text-red-500">{message}</p>}
          {/* Pharmacy Card */}
          <div className="rounded-xl overflow-hidden mb-5 max-w-4xl"
            style={{
              background: "linear-gradient(135deg, #137551 0%, #0fa37f 50%, #11ca8c 100%)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-3">
              <div className="text-white">
                <h2 className="text-lg font-bold mb-1">Pharmacie</h2>
                <h2 className="text-xl font-bold mb-1">{pharmacyName}</h2>
                <p className="text-xs text-white/80 max-w-[200px] leading-relaxed">
                  Sittué à 200m da la von du quartier de la zone résidentielle du pays
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-white text-sm text-center">
                  <p className="text-sm">Hubertmaga@gmail.com</p>
                  <p className="mt-1 text-sm">+229 65 65 65 65</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button className="flex items-center gap-2 bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold mt-1 hover:shadow-md transition-shadow">
                  <LocationIcon />
                  Itinéraire
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="w-full max-w-4xl">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-3 py-2 text-xs text-gray-400 border-b border-gray-100 font-medium">
              <span>Nom du produit</span>
              <span className="text-center">Qte</span>
              <span className="text-center">Prix</span>
              <span className="text-center">Total</span>
              <span className="w-10"></span>
            </div>

            {/* Table Rows */}
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-3 py-3 border-b border-gray-50 text-sm"
              >
                {/* Product Name */}
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.type}</p>
                  {item.requiresPrescription && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[11px] font-semibold">
                      Ordonnance requise
                    </span>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      disabled={isCommandeValidationMode}
                      className="px-2 py-1.5 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      −
                    </button>
                    <span className="px-2 py-1.5 text-sm font-semibold text-gray-800 min-w-[28px] text-center bg-gray-50">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      disabled={isCommandeValidationMode}
                      className="px-2 py-1.5 text-[#0fa37f] hover:bg-green-50 text-sm font-medium transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price */}
                <p className="text-sm text-gray-600 text-center">
                  {formatPrice(item.price)} XOF CFA
                </p>

                {/* Total */}
                <p className="text-sm font-semibold text-gray-800 text-center">
                  {formatPrice(item.qty * item.price)} XOF CFA
                </p>

                {/* Delete */}
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={isCommandeValidationMode}
                  className="w-8 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          {/* Total Bar */}
          <div className="flex items-center justify-between bg-[#e8faf3] rounded-xl px-8 py-5 mt-6 max-w-4xl">
            <h3 className="text-xl font-bold text-gray-800">Montant total</h3>
            <p className="text-xl font-bold text-gray-800">
              {formatPrice(total)} XOF CFA
            </p>
          </div>

          {/* Add Prescription */}
          <div className="flex flex-col gap-3 mt-6 px-4">
            <p className="text-sm text-gray-600">
              {prescriptionCount > 0
                ? `${prescriptionCount} médicament(s) de cette commande nécessitent une ordonnance.`
                : "Aucun médicament de cette commande ne nécessite d'ordonnance."}
            </p>
            <p className="text-sm font-semibold text-gray-700">Ajouter une ordonnance</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#e8faf3] text-[#0fa37f] hover:bg-[#d9f5ea] transition-colors"
                aria-label="Prendre une photo"
              >
                <Camera size={20} />
              </button>
              <label
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#e8faf3] text-[#0fa37f] hover:bg-[#d9f5ea] transition-colors cursor-pointer"
                aria-label="Importer un fichier"
              >
                <Upload size={20} />
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(event) => setOrdonnanceFile(event.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-start gap-3 mt-10 w-full px-4">
            <button
              onClick={handleCancel}
              disabled={pending || isCommandeValidationMode}
              className="px-10 py-3 border-2 border-red-500 text-red-600 rounded-full text-lg font-semibold hover:bg-red-50 transition-colors min-w-[180px]"
            >
              Annuler
            </button>
            <button
              onClick={handlePutOnHold}
              disabled={pending || items.length === 0}
              className="px-10 py-3 bg-gray-200 text-gray-600 rounded-full text-lg font-semibold hover:bg-gray-300 transition-colors min-w-[180px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Mettre en attente
            </button>
            <button
              onClick={handleCheckout}
              disabled={pending || items.length === 0}
              className="px-10 py-3 bg-[#0fa37f] text-white rounded-full text-lg font-semibold hover:bg-[#0e9272] transition-colors min-w-[200px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? "Traitement..." : isCommandeValidationMode ? "Valider cette commande" : "Valider la commande"}
            </button>
          </div>
    </div>
  );
}

/* ─── SVG Icon Components ─── */

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0fa37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

