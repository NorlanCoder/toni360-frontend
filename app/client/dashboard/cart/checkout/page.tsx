"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Eye, FileText, Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { annulerCommande,
  createCommande,
  getCommande,
  getPanier,
  mettreEnAttenteCommande,
  removePanierItem,
  updatePanierItemQuantity,
  uploadOrdonnanceForProduitCommande,
  validerCommande,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";
import { useCart } from "@/lib/cart-context";
import PharmacieHeader from "@/components/client/PharmacieHeader";

interface CartItem {
  id: string;
  name: string;
  type: string;
  qty: number;
  maxQty: number;
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
  const [pendingCancel, setPendingCancel] = useState(false);
  const [pendingHold, setPendingHold] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [pendingItems, setPendingItems] = useState(false);
  const anyPending = pendingCancel || pendingHold || pendingCheckout || pendingItems;
  const [ordonnanceFile, setOrdonnanceFile] = useState<File | null>(null);
  const [ordonnancePreviewUrl, setOrdonnancePreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadRetryCandidateId, setUploadRetryCandidateId] = useState<string | null>(null);
  const [uploadRetryCandidateNumero, setUploadRetryCandidateNumero] = useState<string | null>(null);
  const [pharmacyName, setPharmacyName] = useState(pharmacyNameFromUrl);
  const [pharmacyAdresse, setPharmacyAdresse] = useState("");
  const [pharmacyTelephone, setPharmacyTelephone] = useState("");
  const [pharmacyEmail, setPharmacyEmail] = useState("");
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const maxQtyByIdRef = useRef<Record<string, number>>({});
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
      setPharmacyEmail(firstPharmacie?.email ?? "");

      const mappedItems = panier.pharmacies.flatMap((pharmacieBloc) =>
        pharmacieBloc.produits.map((item) => {
          if (!(item.id in maxQtyByIdRef.current)) {
            maxQtyByIdRef.current[item.id] = item.quantite;
          }
          return {
            id: item.id,
            name: item.produit.nom,
            type: [item.produit.forme, item.produit.dosage].filter(Boolean).join(" ") || "Produit",
            qty: item.quantite,
            maxQty: maxQtyByIdRef.current[item.id],
            price: Number(item.prix_unitaire ?? 0),
            requiresPrescription: Boolean(item.produit.necessite_ordonnance),
          };
        }),
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
      setPharmacyEmail((commande.pharmacie as { email?: string })?.email ?? "");

      const mappedItems: CartItem[] = commande.produits.map((item) => {
        if (!(item.id in maxQtyByIdRef.current)) {
          maxQtyByIdRef.current[item.id] = Number(item.quantite ?? 1);
        }
        return {
          id: item.id,
          name: item.produit?.nom ?? "Produit",
          type: "Produit",
          qty: Number(item.quantite ?? 1),
          maxQty: maxQtyByIdRef.current[item.id],
          price: Number(item.prix_unitaire ?? 0),
          requiresPrescription: Boolean(item.ordonnance_requise),
        };
      });

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

    if (delta > 0 && item.qty >= item.maxQty) {
      toast.warning("Vous ne pouvez pas dépasser la quantité initiale.");
      return;
    }

    const nextQty = Math.max(1, item.qty + delta);
    setPendingItems(true);
    try {
      await updatePanierItemQuantity(token, id, nextQty);
      await loadPanier();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setPendingItems(false);
    }
  };

  const removeItem = async (id: string) => {
    if (!token) {
      return;
    }

    setPendingItems(true);
    try {
      await removePanierItem(token, id);
      await loadPanier();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setPendingItems(false);
    }
  };

  const handleCancel = async () => {
    if (anyPending) {
      return;
    }

    if (!token) {
      clearAuthSession();
      router.replace("/client/connexion");
      return;
    }

    if (items.length === 0) {
      router.push("/client/localisation");
      return;
    }

    setPendingCancel(true);
    try {
      const livePanierId = await resolveActivePanierId();
      if (!livePanierId) {
        router.push("/client/localisation");
        return;
      }

      const creation = await createCommande(token, livePanierId);
      const commandeId = creation.data.commande.id;

      await annulerCommande(token, commandeId, "Annulée par le patient depuis le checkout");

      clearLocalCart();
      router.push("/client/localisation");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setPendingCancel(false);
    }
  };

  const handleCheckout = async () => {
    if (anyPending) {
      return;
    }

    if (isCommandeValidationMode && commandeIdFromUrl) {
      if (!token) {
        clearAuthSession();
        router.replace("/client/connexion");
        return;
      }

      setPendingCheckout(true);
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

        await validerCommande(token, commandeIdFromUrl);

        router.push(`/client/orders/${commandeIdFromUrl}/qrcode`);
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
      } finally {
        setPendingCheckout(false);
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
      setPendingCheckout(true);
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
        setPendingCheckout(false);
      }
      return;
    }

    setPendingCheckout(true);
    try {
      const livePanierId = await resolveActivePanierId();
      if (!livePanierId) {
        toast.error("Panier introuvable. Rechargez la page puis réessayez.");
        return;
      }

      const creation = await createCommande(token, livePanierId);
      const commandeId = creation.data.commande.id;
      const commandeNumero = creation.data.commande.numero_commande;

      if (!creation.data.necessite_ordonnance) {
        await validerCommande(token, commandeId);
        clearLocalCart();
        router.push(`/client/orders/${commandeId}/qrcode`);
        return;
      }

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

      await validerCommande(token, commandeId);
      clearLocalCart();
      router.push(`/client/orders/${commandeId}/qrcode`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setPendingCheckout(false);
    }
  };

  const handlePutOnHold = async () => {
    if (anyPending) {
      return;
    }

    if (!token || items.length === 0) {
      toast.warning("Votre panier est vide.");
      return;
    }

    setPendingHold(true);
    try {
      const livePanierId = await resolveActivePanierId();
      if (!livePanierId) {
        toast.error("Panier introuvable. Rechargez la page puis réessayez.");
        return;
      }

      const creation = await createCommande(token, livePanierId);
      const holdCommandeId = creation.data.commande.id;
      const holdCommandeNumero = creation.data.commande.numero_commande;

      // Mettre en attente AVANT l'upload : l'upload change le statut vers
      // ORDONNANCE_EN_VERIFICATION, ce qui bloquerait mettreEnAttente.
      await mettreEnAttenteCommande(token, holdCommandeId);

      if (creation.data.necessite_ordonnance && ordonnanceFile) {
        try {
          await uploadOrdonnances(holdCommandeId, ordonnanceFile);
        } catch (uploadError) {
          // La commande est déjà en attente, on mémorise le retry pour l'ordonnance.
          setUploadRetryCandidateId(holdCommandeId);
          setUploadRetryCandidateNumero(holdCommandeNumero);
          setOrdonnanceFile(null);
          if (uploadError instanceof ApiError) {
            toast.warning("Commande mise en attente, mais l'ordonnance n'a pas pu être envoyée. Veuillez la joindre depuis « Mes commandes ».");
          }
          clearLocalCart();
          router.push(`/client/orders?commande=${encodeURIComponent(holdCommandeNumero)}`);
          return;
        }
      }

      clearLocalCart();
      router.push(`/client/orders?commande=${encodeURIComponent(holdCommandeNumero)}`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setPendingHold(false);
    }
  };

  const formatPrice = (value: number | null | undefined) =>
    Math.round(Number(value ?? 0))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const hasPrescription = prescriptionCount > 0;
  const ordonnanceMessage = prescriptionCount === 1
    ? "1 médicament de cette commande nécessite une ordonnance."
    : `${prescriptionCount} médicaments de cette commande nécessitent une ordonnance.`;

  return (
    <section className="mx-auto w-full max-w-6xl px-3 pb-6 sm:px-6 sm:pb-8">

      {/* ── Header pharmacie ── */}
      <PharmacieHeader
        nom={pharmacyName}
        adresse={pharmacyAdresse}
        telephone={pharmacyTelephone}
        email={pharmacyEmail}
        className="rounded-xl px-3 py-3"
      />

      {/* ── Table produits ── */}
      <div className="overflow-hidden bg-white">

        {/* En-têtes colonnes (desktop) */}
        <div className="hidden sm:grid sm:grid-cols-[3fr_2fr_2fr_2fr_44px] gap-2 px-6 py-3 text-base font-bold text-[#B5B5B5] border-b border-[#66666680]">
          <span>Nom du produit</span>
          <span className="text-left">Qté</span>
          <span>P.U</span>
          <span>Total</span>
          <span />
        </div>

        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex flex-col gap-3 px-6 py-4 sm:grid sm:grid-cols-[3fr_2fr_2fr_2fr_44px] sm:gap-2 sm:items-center ${idx < items.length - 1 ? "border-b border-[#66666680]" : ""
              }`}
          >
            {/* Nom */}
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                {item.name}
                {item.requiresPrescription && (
                  <span className="relative group/ordo shrink-0">
                    <FileText size={15} className="text-red-500" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/ordo:block whitespace-nowrap rounded bg-red-500 px-2 py-1 text-xs text-white z-10">
                      Ordonnance requise
                    </span>
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">{item.type}</p>
            </div>

            {/* Qté */}
            <div className="flex sm:justify-start">
              <div className="inline-flex items-center rounded-full border border-gray-200 px-2 py-1">
                <button
                  type="button"
                  onClick={() => updateQty(item.id, -1)}
                  disabled={anyPending || isCommandeValidationMode}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <Minus size={13} />
                </button>
                <span className="px-3 text-sm font-semibold text-gray-800 min-w-[24px] text-center">{item.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.id, 1)}
                  disabled={anyPending || isCommandeValidationMode}
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    item.qty >= item.maxQty
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-toni-green-dark-2 hover:bg-toni-green-light"
                  }`}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Prix */}
            <span className="text-sm text-gray-700 whitespace-nowrap">
              <span className="sm:hidden text-gray-400 mr-1">P.U :</span>
              {formatPrice(item.price)} FCFA
            </span>

            {/* Total */}
            <span className="text-sm text-gray-700 whitespace-nowrap">
              <span className="sm:hidden text-gray-400 mr-1">Total :</span>
              {formatPrice(item.qty * item.price)} FCFA
            </span>

            {/* Delete */}
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              disabled={anyPending || isCommandeValidationMode}
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
            {formatPrice(total)} FCFA
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
            {ordonnanceMessage}
          </p>

          {/* Fichier sélectionné : prévisualisation */}
          {ordonnanceFile ? (
            <div className="flex items-center gap-3 rounded-xl border border-toni-green-dark-2/30 bg-green-50 px-4 py-3">
              {/* Miniature ou icône PDF */}
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center hover:opacity-80 transition"
                title="Prévisualiser"
              >
                {ordonnancePreviewUrl && ordonnanceFile.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ordonnancePreviewUrl} alt="aperçu" className="w-full h-full object-cover" />
                ) : (
                  <FileText size={22} className="text-toni-green-dark-2" />
                )}
              </button>

              {/* Nom du fichier */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{ordonnanceFile.name}</p>
                <p className="text-xs text-gray-400">{(ordonnanceFile.size / 1024).toFixed(0)} Ko</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-toni-green-dark-2 transition"
                  title="Prévisualiser"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-toni-green-dark-2 transition"
                  title="Remplacer"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrdonnanceFile(null);
                    if (ordonnancePreviewUrl) URL.revokeObjectURL(ordonnancePreviewUrl);
                    setOrdonnancePreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-red-500 transition"
                  title="Supprimer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-toni-green-dark-2 transition"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-toni-green-dark-2 text-white shrink-0">
                <Plus size={18} />
              </span>
              Ajouter une ordonnance
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (!file) return;
              const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
              const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
              const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
              const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
              const mimeOk = file.type ? ALLOWED_TYPES.includes(file.type) : false;
              const extOk = ALLOWED_EXTENSIONS.includes(ext);
              if (!mimeOk && !extOk) {
                toast.error("Format non supporté. Seuls les fichiers JPG, PNG et PDF sont acceptés.");
                e.target.value = "";
                return;
              }
              if (file.size > MAX_SIZE) {
                toast.error(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). La taille maximale est de 5 Mo.`);
                e.target.value = "";
                return;
              }
              if (ordonnancePreviewUrl) URL.revokeObjectURL(ordonnancePreviewUrl);
              setOrdonnancePreviewUrl(URL.createObjectURL(file));
              setOrdonnanceFile(file);
            }}
          />
          <p className="text-xs text-gray-400 mt-1">
            Formats acceptés : JPG, PNG, PDF — Taille max : 5 Mo
          </p>

          {/* Modal de prévisualisation */}
          {showPreviewModal && ordonnancePreviewUrl && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              onClick={() => setShowPreviewModal(false)}
            >
              <div
                className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate max-w-[80%]">{ordonnanceFile?.name}</p>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4 flex justify-center">
                  {ordonnanceFile?.type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ordonnancePreviewUrl} alt="Ordonnance" className="max-h-[70vh] w-auto rounded-lg object-contain" />
                  ) : (
                    <iframe src={ordonnancePreviewUrl} title="Ordonnance PDF" className="w-full h-[70vh] rounded-lg" />
                  )}
                </div>
                <div className="flex gap-2 px-4 pb-4 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowPreviewModal(false); fileInputRef.current?.click(); }}
                    className="flex items-center gap-2 rounded-full border border-toni-green-dark-2 px-4 py-2 text-sm font-medium text-toni-green-dark-2 hover:bg-green-50 transition"
                  >
                    <Pencil size={14} /> Remplacer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPreviewModal(false);
                      setOrdonnanceFile(null);
                      URL.revokeObjectURL(ordonnancePreviewUrl);
                      setOrdonnancePreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="flex items-center gap-2 rounded-full border border-red-400 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleCancel}
          disabled={anyPending}
          className="flex-1 rounded-full border-2 border-[#00955F] py-3 text-base font-bold text-[#00955F] transition hover:bg-green-50 disabled:opacity-50"
        >
          {pendingCancel ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 rounded-full border-2 border-[#00955F] border-t-transparent animate-spin" />
              Traitement…
            </span>
          ) : "Terminer"}
        </button>

        <button
          type="button"
          onClick={handlePutOnHold}
          disabled={anyPending || items.length === 0}
          className="flex-1 rounded-full bg-[#E0E0E0] py-3 text-base font-bold text-[#6B6B6B] transition hover:bg-[#d0d0d0] disabled:opacity-50"
        >
          {pendingHold ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 rounded-full border-2 border-[#6B6B6B] border-t-transparent animate-spin" />
              Traitement…
            </span>
          ) : "Mettre en attente"}
        </button>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={anyPending || items.length === 0 || (hasPrescription && !ordonnanceFile)}
          className="flex-1 rounded-full bg-toni-green-dark-2 py-3 text-base font-bold text-white transition hover:bg-toni-green-dark disabled:opacity-70"
        >
          {pendingCheckout ? (
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

