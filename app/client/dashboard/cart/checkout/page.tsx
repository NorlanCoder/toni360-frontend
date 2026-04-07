"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { FileText, MapPin, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  annulerCommande,
  createCommande,
  getCommande,
  getPanier,
  initierCommandePaiement,
  mettreEnAttenteCommande,
  removePanierItem,
  updatePanierItemQuantity,
  uploadOrdonnanceForProduitCommande,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";
import { useCart } from "@/lib/cart-context";

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

  const [items, setItems] = useState<CartItem[]>([]);
  const [pending, setPending] = useState(false);
  const [ordonnanceFile, setOrdonnanceFile] = useState<File | null>(null);
  const [uploadRetryCandidateId, setUploadRetryCandidateId] = useState<string | null>(null);
  const [uploadRetryCandidateNumero, setUploadRetryCandidateNumero] = useState<string | null>(null);
  const [pharmacyName, setPharmacyName] = useState(pharmacyNameFromUrl);
  const [pharmacyAdresse, setPharmacyAdresse] = useState("");
  const [pharmacyTelephone, setPharmacyTelephone] = useState("");
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { clearLocalCart } = useCart();

  const resolvePaymentPhone = (): string => {
    const session = getAuthSession();
    const rawPhone = session && typeof session.profile === "object" && session.profile
      ? String((session.profile as { telephone?: unknown }).telephone ?? "")
      : "";

    const digits = rawPhone.replace(/\D/g, "");
    const last8 = digits.length >= 8 ? digits.slice(-8) : "";
    return last8 || "97000000";
  };

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
      const firstPharmacie = panier.pharmacies[0]?.pharmacie;
      setPharmacyName(firstPharmacie?.nom ?? pharmacyNameFromUrl);
      setPharmacyAdresse([firstPharmacie?.adresse, firstPharmacie?.ville].filter(Boolean).join(", "));
      setPharmacyTelephone(firstPharmacie?.telephone ?? "");

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
        toast.warning("Votre panier est vide.");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
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
      setPharmacyName(commande.pharmacie?.nom ?? pharmacyNameFromUrl);
      setPharmacyAdresse(commande.pharmacie?.adresse ?? "");
      setPharmacyTelephone(commande.pharmacie?.telephone ?? "");

      const mappedItems: CartItem[] = commande.produits.map((item) => ({
        id: item.id,
        name: item.produit?.nom ?? "Produit",
        type: "Produit",
        qty: Number(item.quantite ?? 1),
        price: Number(item.prix_unitaire ?? 0),
        requiresPrescription: Boolean(item.ordonnance_requise),
      }));

      setItems(mappedItems);
      const missingPrescriptionCount = commande.produits.filter(
        (item) => item.ordonnance_requise && !item.ordonnance,
      ).length;
      setPrescriptionCount(missingPrescriptionCount);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
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
    const produitsSansOrdonnance = commandeDetail.data.commande.produits.filter(
      (produit) => produit.ordonnance_requise && !produit.ordonnance,
    );

    for (const produit of produitsSansOrdonnance) {
      try {
        await uploadOrdonnanceForProduitCommande(token, produit.id, file);
      } catch (error) {
        if (!(error instanceof ApiError)) {
          throw error;
        }

        const normalized = error.message.toLowerCase();
        const alreadySubmitted =
          normalized.includes("deja en cours de traitement")
          || normalized.includes("déjà en cours de traitement");

        if (!alreadySubmitted) {
          throw error;
        }
      }
    }
  };

  const resolveActivePanierId = async (): Promise<string | null> => {
    if (!token) {
      return null;
    }

    const response = await getPanier(token);
    const livePanierId = response.data.panier.id ?? null;

    return livePanierId;
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
        toast.error(error.message);
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
        toast.error(error.message);
      }
    } finally {
      setPending(false);
    }
  };

  const handleCancel = async () => {
    if (pending) {
      return;
    }

    if (!token) {
      clearAuthSession();
      router.replace("/client/connexion");
      return;
    }

    if (items.length === 0) {
      router.push("/client/orders");
      return;
    }

    setPending(true);
    try {
      const livePanierId = await resolveActivePanierId();
      if (!livePanierId) {
        router.push("/client/orders");
        return;
      }

      const creation = await createCommande(token, livePanierId);
      const commandeId = creation.data.commande.id;

      await annulerCommande(token, commandeId, "Annulée par le patient depuis le checkout");

      clearLocalCart();
      router.push("/client/orders");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
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
      if (!token) {
        clearAuthSession();
        router.replace("/client/connexion");
        return;
      }

      setPending(true);
      try {
        if (ordonnanceFile) {
          try {
            await uploadOrdonnances(commandeIdFromUrl, ordonnanceFile);
          } catch (uploadError) {
            setOrdonnanceFile(null);
            if (uploadError instanceof ApiError) {
              toast.error("L'ordonnance n'a pas pu être envoyée. Veuillez sélectionner un nouveau fichier et réessayer.");
            }
            return;
          }
        }

        const paiement = await initierCommandePaiement(
          token,
          commandeIdFromUrl,
          "MTN",
          resolvePaymentPhone(),
        );

        if (!paiement.data.reference && !paiement.data.qr_code?.code) {
          toast.warning("Paiement validé mais QR code non généré. Réessayez dans quelques secondes.");
        }

        router.push("/client/orders");
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
      } finally {
        setPending(false);
      }

      return;
    }

    if (!token || items.length === 0) {
      toast.warning("Votre panier est vide.");
      return;
    }

    // Retry : commande déjà créée mais upload d'ordonnance échoué
    if (uploadRetryCandidateId && uploadRetryCandidateNumero) {
      if (!ordonnanceFile) {
        toast.warning("Veuillez sélectionner un nouveau fichier d'ordonnance.");
        return;
      }
      setPending(true);
      try {
        await uploadOrdonnances(uploadRetryCandidateId, ordonnanceFile);
        const numero = uploadRetryCandidateNumero;
        setUploadRetryCandidateId(null);
        setUploadRetryCandidateNumero(null);
        router.push(`/client/orders?commande=${encodeURIComponent(numero)}`);
      } catch (error) {
        setOrdonnanceFile(null);
        if (error instanceof ApiError) {
          toast.error("L'ordonnance n'a pas pu être envoyée. Veuillez sélectionner un nouveau fichier et réessayer.");
        }
      } finally {
        setPending(false);
      }
      return;
    }

    setPending(true);
    try {
      const livePanierId = await resolveActivePanierId();
      if (!livePanierId) {
        toast.error("Panier introuvable. Rechargez la page puis réessayez.");
        return;
      }

      const creation = await createCommande(token, livePanierId);
      const commandeId = creation.data.commande.id;
      const commandeNumero = creation.data.commande.numero_commande;

      if (creation.data.necessite_ordonnance && ordonnanceFile) {
        try {
          await uploadOrdonnances(commandeId, ordonnanceFile);
        } catch (uploadError) {
          setUploadRetryCandidateId(commandeId);
          setUploadRetryCandidateNumero(commandeNumero);
          setOrdonnanceFile(null);
          if (uploadError instanceof ApiError) {
            toast.error("L'ordonnance n'a pas pu être envoyée. Veuillez sélectionner un nouveau fichier et réessayer.");
          }
          return;
        }
      }

      clearLocalCart();
      router.push(`/client/orders?commande=${encodeURIComponent(commandeNumero)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setPending(false);
    }
  };

  const handlePutOnHold = async () => {
    if (pending) {
      return;
    }

    if (!token || items.length === 0) {
      toast.warning("Votre panier est vide.");
      return;
    }

    setPending(true);
    try {
      const livePanierId = await resolveActivePanierId();
      if (!livePanierId) {
        toast.error("Panier introuvable. Rechargez la page puis réessayez.");
        return;
      }

      const creation = await createCommande(token, livePanierId);
      const holdCommandeId = creation.data.commande.id;
      const holdCommandeNumero = creation.data.commande.numero_commande;

      await mettreEnAttenteCommande(token, holdCommandeId);

      clearLocalCart();
      router.push(`/client/orders?commande=${encodeURIComponent(holdCommandeNumero)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setPending(false);
    }
  };

  const formatPrice = (value: number | null | undefined) =>
    Number(value ?? 0).toLocaleString("fr-FR").replace(/,/g, " ");

  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const hasPrescription = prescriptionCount > 0;
  const mapsUrl = pharmacyAdresse
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacyAdresse)}`
    : "#";

  return (
    <section className="mx-auto w-full max-w-6xl px-3 pb-6 sm:px-6 sm:pb-8">

      {/* ── Header pharmacie ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#004B2F] to-[#00B16F] px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white sm:text-2xl leading-snug">{pharmacyName}</h2>
          {pharmacyAdresse && (
            <p className="mt-1 text-sm text-green-100 leading-snug">{pharmacyAdresse}</p>
          )}
        </div>
        <div className="flex flex-col gap-1 sm:text-right">
          {pharmacyTelephone && (
            <p className="text-white text-sm font-medium">{pharmacyTelephone}</p>
          )}
        </div>
        {pharmacyAdresse && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-white px-5 py-2.5 text-sm font-bold text-toni-green-dark-2 hover:bg-gray-50 transition shrink-0"
          >
            <MapPin size={16} />
            Itinéraire
          </a>
        )}
      </div>

      {/* ── Table produits ── */}
      <div className="overflow-hidden bg-white">

        {/* En-têtes colonnes (desktop) */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_180px_150px_150px_44px] gap-2 px-6 py-3 text-base font-bold text-[#B5B5B5] border-b border-[#66666680]">
          <span>Nom du produit</span>
          <span className="text-center">Qté</span>
          <span>Prix</span>
          <span>Total</span>
          <span />
        </div>

        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex flex-col gap-3 px-6 py-4 sm:grid sm:grid-cols-[1fr_180px_150px_150px_44px] sm:gap-2 sm:items-center ${
              idx < items.length - 1 ? "border-b border-[#66666680]" : ""
            }`}
          >
            {/* Nom */}
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                {item.name}
                {item.requiresPrescription && <FileText size={15} className="text-red-500 shrink-0" />}
              </p>
              <p className="text-sm text-gray-500">{item.type}</p>
            </div>

            {/* Qté */}
            <div className="flex sm:justify-center">
              <div className="inline-flex items-center rounded-full border border-gray-200 px-2 py-1">
                <button
                  type="button"
                  onClick={() => updateQty(item.id, -1)}
                  disabled={pending || isCommandeValidationMode}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <Minus size={13} />
                </button>
                <span className="px-3 text-sm font-semibold text-gray-800 min-w-[24px] text-center">{item.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.id, 1)}
                  disabled={pending || isCommandeValidationMode}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-toni-green-dark-2 hover:bg-toni-green-light"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Prix */}
            <span className="text-sm text-gray-700 whitespace-nowrap">
              <span className="sm:hidden text-gray-400 mr-1">Prix :</span>
              {formatPrice(item.price)} XOF CFA
            </span>

            {/* Total */}
            <span className="text-sm text-gray-700 whitespace-nowrap">
              <span className="sm:hidden text-gray-400 mr-1">Total :</span>
              {formatPrice(item.qty * item.price)} XOF CFA
            </span>

            {/* Delete */}
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              disabled={pending || isCommandeValidationMode}
              className="flex sm:justify-center text-red-400 hover:text-red-600"
              aria-label="Supprimer"
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}

        {/* Montant total */}
        <div className="flex items-center justify-between bg-[#D7EFDA] px-6 py-5">
          <span className="text-lg md:text-2xl font-bold text-gray-900">Montant total</span>
          <span className="text-lg md:text-2xl font-bold text-gray-900">
            {formatPrice(total)} XOF CFA
          </span>
        </div>
      </div>

      {/* Ajouter une ordonnance */}
      {hasPrescription && (
        <div className="mt-5 flex flex-col gap-2">
          {uploadRetryCandidateId && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>L&apos;envoi de l&apos;ordonnance a échoué. Sélectionnez un nouveau fichier puis cliquez sur &quot;Valider&quot;.</span>
            </div>
          )}
          <p className="text-sm text-gray-600 mb-1">
            {prescriptionCount} médicament(s) de cette commande nécessitent une ordonnance.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-toni-green-dark-2 transition"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-toni-green-dark-2 text-white shrink-0">
              <Plus size={18} />
            </span>
            {ordonnanceFile
              ? <span className="text-toni-green-dark-2 truncate max-w-[240px]">{ordonnanceFile.name}</span>
              : "Ajouter une ordonnance"
            }
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (!file) return;
              const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
              const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
              if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error("Format non supporté. Seuls les fichiers JPG, PNG et PDF sont acceptés.");
                e.target.value = "";
                return;
              }
              if (file.size > MAX_SIZE) {
                toast.error(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). La taille maximale est de 5 Mo.`);
                e.target.value = "";
                return;
              }
              setOrdonnanceFile(file);
            }}
          />
          <p className="text-xs text-gray-400 mt-1">
            Formats acceptés : JPG, PNG, PDF — Taille max : 5 Mo
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleCancel}
          disabled={pending}
          className="flex-1 rounded-full border-2 border-[#00955F] py-3 text-base font-bold text-[#00955F] transition hover:bg-green-50 disabled:opacity-50"
        >
          Terminer
        </button>

        <button
          type="button"
          onClick={handlePutOnHold}
          disabled={pending || items.length === 0}
          className="flex-1 rounded-full bg-[#E0E0E0] py-3 text-base font-bold text-[#6B6B6B] transition hover:bg-[#d0d0d0] disabled:opacity-50"
        >
          Mettre en attente
        </button>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={pending || items.length === 0 || (hasPrescription && !ordonnanceFile)}
          className="flex-1 rounded-full bg-toni-green-dark-2 py-3 text-base font-bold text-white transition hover:bg-toni-green-dark disabled:opacity-70"
        >
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Traitement…
            </span>
          ) : isCommandeValidationMode ? "Valider cette commande" : "Valider la commande"}
        </button>
      </div>
      {hasPrescription && !ordonnanceFile && (
        <p className="text-sm text-red-500 text-center mt-2">
          Veuillez ajouter votre ordonnance avant de valider.
        </p>
      )}
    </section>
  );
}

