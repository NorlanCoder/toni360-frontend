"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, FileText, Minus, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  annulerCommande,
  getCommande,
  modifierProduitCommande,
  supprimerProduitCommande,
  uploadOrdonnanceForProduitCommande,
  validerCommande,
  verifierDisponibiliteCommande,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";
import PharmacieHeader from "@/components/client/PharmacieHeader";

interface OrderItem {
  id: string;
  name: string;
  type: string;
  qty: number;
  price: number;
  requiresPrescription: boolean;
  hasOrdonnance: boolean;
  ordonnanceUrl: string | null;
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="px-6 pb-8 flex-1" />}>
      <OrderDetailContent />
    </Suspense>
  );
}

function OrderDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const commandeId = String(params.id);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyAdresse, setPharmacyAdresse] = useState("");
  const [pharmacyTelephone, setPharmacyTelephone] = useState("");
  const [pharmacyEmail, setPharmacyEmail] = useState("");
  const [commandeNumero, setCommandeNumero] = useState("");
  const [commandeStatut, setCommandeStatut] = useState("");
  const [ordonnanceFile, setOrdonnanceFile] = useState<File | null>(null);
  const [ordonnancePreviewUrl, setOrdonnancePreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showServerPreviewModal, setShowServerPreviewModal] = useState(false);
  const [pendingAnnuler, setPendingAnnuler] = useState(false);
  const [pendingHold, setPendingHold] = useState(false);
  const [pendingValider, setPendingValider] = useState(false);
  const [pendingVerif, setPendingVerif] = useState(false);
  const [pendingUploadOrdonnance, setPendingUploadOrdonnance] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [adjustedItems, setAdjustedItems] = useState<Record<string, { oldQty: number; newQty: number }>>({});
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const ordonnanceUploadModeRef = useRef<"missing" | "replace">("missing");

  const token = useMemo(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") return null;
    return session.token;
  }, []);

  const loadCommande = async () => {
    if (!token) {
      clearAuthSession();
      router.replace("/client/connexion");
      return;
    }
    try {
      const response = await getCommande(token, commandeId);
      const commande = response.data.commande;
      setCommandeNumero(commande.numero_commande ?? "");
      setCommandeStatut(String(commande.statut ?? "").toLowerCase());
      setPharmacyName(commande.pharmacie?.nom ?? "");
      setPharmacyAdresse([commande.pharmacie?.adresse, commande.pharmacie?.ville].filter(Boolean).join(", "));
      setPharmacyTelephone(commande.pharmacie?.telephone ?? "");
      setPharmacyEmail(commande.pharmacie?.email ?? "");

      const mappedItems: OrderItem[] = commande.produits.map((p) => ({
        id: p.id,
        name: p.produit?.nom ?? "Produit",
        type: "Produit",
        qty: Number(p.quantite ?? 1),
        price: Number(p.prix_unitaire ?? 0),
        requiresPrescription: Boolean(p.ordonnance_requise),
        hasOrdonnance: Boolean(p.ordonnance),
        ordonnanceUrl: p.ordonnance?.fichier_url ?? null,
      }));
      setItems(mappedItems);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCommande();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, commandeId]);

  const missingPrescriptionItems = items.filter((i) => i.requiresPrescription && !i.hasOrdonnance);
  const hasMissingPrescription = missingPrescriptionItems.length > 0;
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const formatPrice = (v: number) =>
    Math.round(Number(v))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

  const canValidate = commandeStatut === "en_attente_paiement" || commandeStatut === "en_attente_client";
  const isEnAttenteClient = commandeStatut === "en_attente_client";
  const isEnCoursStatus = ["en_cours", "payee", "en_preparation", "prete"].includes(commandeStatut);

  const returnTab = useMemo(() => {
    const fromUrl = searchParams.get("tab");
    if (fromUrl === "en_cours" || fromUrl === "recuperees" || fromUrl === "en_attente") {
      return fromUrl;
    }

    if (commandeStatut === "recuperee") {
      return "recuperees";
    }

    if (isEnCoursStatus) {
      return "en_cours";
    }

    return "en_attente";
  }, [searchParams, commandeStatut, isEnCoursStatus]);

  const ordersListUrl = `/client/orders?tab=${returnTab}`;

  const handleVerifierDisponibilite = async () => {
    if (!token || pendingVerif) return;
    setPendingVerif(true);
    try {
      const res = await verifierDisponibiliteCommande(token, commandeId);
      if (res.data?.commande_annulee) {
        toast.error("Tous les produits sont en rupture de stock. La commande a été annulée.");
        router.push(ordersListUrl);
        return;
      }
      const supprimes = res.data?.produits_supprimes ?? [];
      const ajustes = res.data?.produits_ajustes ?? [];
      if (supprimes.length > 0) {
        toast.warning(`${supprimes.length} ${supprimes.length > 1 ? "produits retirés" : "produit retiré"} : ${supprimes.map((p) => p.nom).join(", ")}.`);
      }
      if (ajustes.length > 0) {
        toast.warning(`${ajustes.length} ${ajustes.length > 1 ? "produits ajustés" : "produit ajusté"} : ${ajustes.map((p) => `${p.nom} (${p.quantite_demandee}→${p.quantite_ajustee})`).join(", ")}.`);
      }
      if (supprimes.length === 0 && ajustes.length === 0) {
        toast.success("Tous les produits sont disponibles !");
      }
      // Construire la map des ajustements avant rechargement
      if (ajustes.length > 0) {
        const newAdjusted: Record<string, { oldQty: number; newQty: number }> = {};
        for (const ajuste of ajustes) {
          newAdjusted[ajuste.id] = { oldQty: ajuste.quantite_demandee, newQty: ajuste.quantite_ajustee };
        }
        setAdjustedItems(newAdjusted);
      } else {
        setAdjustedItems({});
      }
      // Recharger les données de la commande mises à jour
      await loadCommande();
      setVerificationDone(true);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
    } finally {
      setPendingVerif(false);
    }
  };

  const uploadOrdonnances = async (file: File, mode: "missing" | "replace") => {
    if (!token) return;
    const targetItems = mode === "replace"
      ? items.filter((i) => i.requiresPrescription && i.hasOrdonnance)
      : missingPrescriptionItems;

    for (const item of targetItems) {
      try {
        await uploadOrdonnanceForProduitCommande(token, item.id, file);
      } catch (error) {
        if (error instanceof ApiError) {
          const msg = error.message.toLowerCase();
          const already = msg.includes("deja en cours") || msg.includes("déjà en cours");
          if (!already) throw error;
        } else {
          throw error;
        }
      }
    }
  };

  const resetOrdonnanceLocalSelection = () => {
    setOrdonnanceFile(null);
    if (ordonnancePreviewUrl) URL.revokeObjectURL(ordonnancePreviewUrl);
    setOrdonnancePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    ordonnanceUploadModeRef.current = "missing";
  };

  const handleUploadOrdonnance = async (file: File, mode: "missing" | "replace" = "missing") => {
    if (!token || pendingUploadOrdonnance) return;

    const targetItems = mode === "replace"
      ? items.filter((i) => i.requiresPrescription && i.hasOrdonnance)
      : missingPrescriptionItems;

    if (targetItems.length === 0) {
      toast.warning("Aucun produit éligible pour cette action.");
      return;
    }

    setPendingUploadOrdonnance(true);
    try {
      await uploadOrdonnances(file, mode);
      toast.success(mode === "replace" ? "Ordonnance modifiée et enregistrée." : "Ordonnance envoyée et enregistrée.");
      resetOrdonnanceLocalSelection();
      await loadCommande();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("L'ordonnance n'a pas pu être envoyée.");
      }
    } finally {
      setPendingUploadOrdonnance(false);
    }
  };

  const handleOrdonnanceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
    const MAX_SIZE = 5 * 1024 * 1024;
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    const mimeOk = file.type ? ALLOWED_TYPES.includes(file.type) : false;
    const extOk = ALLOWED_EXTENSIONS.includes(ext);

    if (!mimeOk && !extOk) {
      toast.error("Format non supporté. Seuls JPG, PNG et PDF sont acceptés.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Max : 5 Mo.`);
      e.target.value = "";
      return;
    }

    if (ordonnancePreviewUrl) URL.revokeObjectURL(ordonnancePreviewUrl);
    setOrdonnancePreviewUrl(URL.createObjectURL(file));
    setOrdonnanceFile(file);
    void handleUploadOrdonnance(file, ordonnanceUploadModeRef.current);
  };

  const anyPending =
    pendingAnnuler || pendingHold || pendingValider || pendingUploadOrdonnance || pendingItemId !== null;

  const handleValider = async () => {
    if (!token || anyPending) return;

    if (hasMissingPrescription && !ordonnanceFile) {
      toast.warning("Veuillez ajouter l'ordonnance avant de valider.");
      return;
    }

    setPendingValider(true);
    try {
      await validerCommande(token, commandeId);
      router.push(`/client/orders/${commandeId}/qrcode?tab=en_cours`);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
    } finally {
      setPendingValider(false);
    }
  };

  const handleAnnuler = async () => {
    if (!token || anyPending) return;
    setPendingAnnuler(true);
    try {
      await annulerCommande(token, commandeId);
      toast.success("Commande annulée.");
      router.push("/client/localisation");
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
    } finally {
      setPendingAnnuler(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="w-8 h-8 rounded-full border-2 border-[#00955F] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-3 pb-6 sm:px-6 sm:pb-8">

      {/* Retour */}
      <button
        type="button"
        onClick={() => router.push(ordersListUrl)}
        className="flex items-center gap-2 mb-4 text-sm font-medium text-[#00955F] hover:underline"
      >
        <ArrowLeft size={16} />
        Retour aux commandes
      </button>

      {/* Titre */}
      <h1 className="mb-5 text-xl font-bold text-gray-900 sm:text-2xl">
        Commande {commandeNumero}
      </h1>

      {/* Header pharmacie */}
      <PharmacieHeader
        nom={pharmacyName}
        adresse={pharmacyAdresse}
        telephone={pharmacyTelephone}
        email={pharmacyEmail}
      />

      {/* Table produits */}
      <div className="overflow-hidden bg-white">
        <div className={`hidden gap-2 px-6 py-3 text-base font-bold text-[#B5B5B5] border-b border-[#66666680] ${isEnAttenteClient && !verificationDone ? "sm:grid sm:grid-cols-[3fr_2fr_2fr_2fr_40px]" : "sm:grid sm:grid-cols-[3fr_2fr_2fr_2fr]"}`}>
          <span>Nom du produit</span>
          <span className="text-left">Qté</span>
          <span>P.U</span>
          <span>Total</span>
          {isEnAttenteClient && !verificationDone && <span />}
        </div>

        {items.map((item, idx) => (
          <div
            key={item.id}
            className={idx < items.length - 1 ? "border-b border-[#66666680]" : ""}
          >
            <div className={`flex flex-col gap-2 px-6 py-4 sm:gap-2 sm:items-center ${isEnAttenteClient && !verificationDone ? "sm:grid sm:grid-cols-[3fr_2fr_2fr_2fr_40px]" : "sm:grid sm:grid-cols-[3fr_2fr_2fr_2fr]"}`}>
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
              </div>

              <div className="flex sm:justify-start">
                {isEnAttenteClient && !verificationDone ? (
                  <div className="inline-flex items-center rounded-full border border-gray-200 px-2 py-1">
                    <button
                      type="button"
                      disabled={pendingItemId === item.id || item.qty <= 1}
                      onClick={async () => {
                        if (!token || pendingItemId) return;
                        const newQty = item.qty - 1;
                        if (newQty < 1) return;
                        setPendingItemId(item.id);
                        try {
                          await modifierProduitCommande(token, commandeId, item.id, newQty);
                          setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, qty: newQty } : i));
                          setAdjustedItems((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
                          setVerificationDone(false);
                        } catch (error) {
                          if (error instanceof ApiError) toast.error(error.message);
                        } finally {
                          setPendingItemId(null);
                        }
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3 text-sm font-semibold min-w-[24px] text-center relative group/adj">
                      {pendingItemId === item.id
                        ? <span className="inline-block w-3 h-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                        : adjustedItems[item.id]
                          ? (
                            <span className="text-orange-500 cursor-help">
                              {item.qty}
                              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/adj:block whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs text-white z-10 shadow-lg">
                                Quantité réduite&nbsp;: {adjustedItems[item.id].oldQty} {adjustedItems[item.id].oldQty > 1 ? "demandés" : "demandé"}, seulement {adjustedItems[item.id].newQty} {adjustedItems[item.id].newQty > 1 ? "disponibles" : "disponible"}
                              </span>
                            </span>
                          )
                          : <span className="text-gray-800">{item.qty}</span>
                      }
                    </span>
                    <button
                      type="button"
                      disabled={pendingItemId === item.id}
                      onClick={async () => {
                        if (!token || pendingItemId) return;
                        const newQty = item.qty + 1;
                        setPendingItemId(item.id);
                        try {
                          await modifierProduitCommande(token, commandeId, item.id, newQty);
                          setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, qty: newQty } : i));
                          setAdjustedItems((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
                          setVerificationDone(false);
                        } catch (error) {
                          if (error instanceof ApiError) toast.error(error.message);
                        } finally {
                          setPendingItemId(null);
                        }
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-toni-green-dark-2 hover:bg-toni-green-light disabled:opacity-40"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-700 text-left">
                    <span className="sm:hidden text-gray-400 mr-1">Qté :</span>
                    {item.qty}
                  </span>
                )}
              </div>

              <span className="text-sm text-gray-700 whitespace-nowrap">
                <span className="sm:hidden text-gray-400 mr-1">P.U :</span>
                {formatPrice(item.price)} FCFA
              </span>

              <span className="text-sm text-gray-700 whitespace-nowrap">
                <span className="sm:hidden text-gray-400 mr-1">Total :</span>
                {formatPrice(item.qty * item.price)} FCFA
              </span>

              {isEnAttenteClient && !verificationDone && (
                <button
                  type="button"
                  disabled={pendingItemId === item.id || items.length <= 1}
                  onClick={async () => {
                    if (!token || pendingItemId) return;
                    setPendingItemId(item.id);
                    try {
                      await supprimerProduitCommande(token, commandeId, item.id);
                      setItems((prev) => prev.filter((i) => i.id !== item.id));
                      setAdjustedItems((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
                      setVerificationDone(false);
                    } catch (error) {
                      if (error instanceof ApiError) toast.error(error.message);
                    } finally {
                      setPendingItemId(null);
                    }
                  }}
                  className="flex sm:justify-center text-red-500 hover:text-red-600 transition disabled:opacity-40"
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>


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

      {/* Ordonnance déjà soumise */}
      {items.some((i) => i.ordonnanceUrl) && (() => {
        const url = items.find((i) => i.ordonnanceUrl)!.ordonnanceUrl!;        const isPdf = url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("pdf");
        return (
          <div className="mt-5 flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-700">Ordonnance soumise :</p>
            <div className="flex items-center gap-3 rounded-xl border border-toni-green-dark-2/30 bg-green-50 px-4 py-3">
              {/* Miniature */}
              <button
                type="button"
                onClick={() => setShowServerPreviewModal(true)}
                className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center hover:opacity-80 transition"
                title="Prévisualiser"
              >
                {!isPdf ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="aperçu" className="w-full h-full object-cover" />
                ) : (
                  <FileText size={22} className="text-toni-green-dark-2" />
                )}
              </button>
              {/* Nom */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{isPdf ? "Ordonnance.pdf" : "Ordonnance"}</p>
                <p className="text-xs text-gray-400">Déjà soumise</p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {canValidate && (
                  <button
                    type="button"
                    onClick={() => {
                      ordonnanceUploadModeRef.current = "replace";
                      fileInputRef.current?.click();
                    }}
                    disabled={pendingUploadOrdonnance}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-toni-green-dark-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Modifier"
                  >
                    <Pencil size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isPdf) {
                      window.open(url, "_blank", "noopener,noreferrer");
                    } else {
                      setShowServerPreviewModal(true);
                    }
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-toni-green-dark-2 transition"
                  title={isPdf ? "Ouvrir dans un nouvel onglet" : "Prévisualiser"}
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>

            {/* Modal preview ordonnance serveur */}
            {showServerPreviewModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                onClick={() => setShowServerPreviewModal(false)}
              >
                <div
                  className="relative max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">Ordonnance soumise</p>
                    <button
                      type="button"
                      onClick={() => setShowServerPreviewModal(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="p-4 flex justify-center">
                    {!isPdf ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="Ordonnance" className="max-h-[70vh] w-auto rounded-lg object-contain" />
                    ) : (
                      <iframe src={url} title="Ordonnance PDF" className="w-full h-[70vh] rounded-lg" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={handleOrdonnanceFileChange}
      />

      {/* Section ordonnance — uniquement si des produits manquent une ordonnance et commande active */}
      {hasMissingPrescription && canValidate && (
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-sm text-gray-600 mb-1">
            {missingPrescriptionItems.length > 1
              ? `${missingPrescriptionItems.length} médicaments de cette commande nécessitent une ordonnance.`
              : `${missingPrescriptionItems.length} médicament de cette commande nécessite une ordonnance.`}
          </p>

          {/* Fichier sélectionné : prévisualisation */}
          {ordonnanceFile ? (
            <div className="flex items-center gap-3 rounded-xl border border-toni-green-dark-2/30 bg-green-50 px-4 py-3">
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{ordonnanceFile.name}</p>
                <p className="text-xs text-gray-400">{(ordonnanceFile.size / 1024).toFixed(0)} Ko</p>
              </div>
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
                  disabled={pendingUploadOrdonnance}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-toni-green-dark-2 transition"
                  title="Remplacer"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={resetOrdonnanceLocalSelection}
                  disabled={pendingUploadOrdonnance}
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
              onClick={() => {
                ordonnanceUploadModeRef.current = "missing";
                fileInputRef.current?.click();
              }}
              disabled={pendingUploadOrdonnance}
              className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-toni-green-dark-2 transition"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-toni-green-dark-2 text-white shrink-0">
                {pendingUploadOrdonnance ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
              </span>
              {pendingUploadOrdonnance ? "Envoi en cours..." : "Ajouter une ordonnance"}
            </button>
          )}

          <p className="text-xs text-gray-400 mt-1">
            Formats acceptés : JPG, PNG, PDF — Taille max : 5 Mo
          </p>

          {/* Modal preview fichier local */}
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
                      if (ordonnancePreviewUrl) URL.revokeObjectURL(ordonnancePreviewUrl);
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

      {/* Ordonnance supprimée après finalisation */}
      {!canValidate && items.some((i) => i.requiresPrescription) && !items.some((i) => i.ordonnanceUrl) && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <FileText size={16} className="shrink-0 text-gray-400" />
          <p className="text-sm italic text-gray-400">Ordonnance supprimée après finalisation de la commande.</p>
        </div>
      )}

      {/* Actions */}
      {isEnAttenteClient && !verificationDone ? (
        /* Étape 1 : Vérifier la disponibilité avant de valider */
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAnnuler}
            disabled={pendingVerif || anyPending}
            className="flex-1 rounded-full border-2 border-[#00955F] py-3 text-base font-bold text-[#00955F] transition hover:bg-green-50 disabled:opacity-50"
          >
            {pendingAnnuler ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 border-[#00955F] border-t-transparent animate-spin" />
                Annulation…
              </span>
            ) : "Terminer"}
          </button>

          <Link
            href={ordersListUrl}
            className="flex-1 rounded-full bg-gray-200 py-3 text-base font-bold text-gray-500 transition hover:bg-gray-300 text-center"
          >
            Garder en attente
          </Link>

          <button
            type="button"
            onClick={handleVerifierDisponibilite}
            disabled={pendingVerif || anyPending}
            className="flex-1 rounded-full bg-toni-green-dark-2 py-3 text-base font-bold text-white transition hover:bg-toni-green-dark disabled:opacity-70"
          >
            {pendingVerif ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Vérification…
              </span>
            ) : "Vérifier disponibilité"}
          </button>
        </div>
      ) : canValidate ? (
        /* Étape 2 : 3 boutons standard après vérification */
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAnnuler}
            disabled={anyPending}
            className="flex-1 rounded-full border-2 border-[#00955F] py-3 text-base font-bold text-[#00955F] transition hover:bg-green-50 disabled:opacity-50"
          >
            {pendingAnnuler ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 border-[#00955F] border-t-transparent animate-spin" />
                Annulation…
              </span>
            ) : "Terminer"}
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!token || anyPending) return;
              // Si déjà EN_ATTENTE_CLIENT, pas besoin d'appel API — juste retourner.
              if (isEnAttenteClient) {
                router.push(ordersListUrl);
                return;
              }
              setPendingHold(true);
              try {
                const { mettreEnAttenteCommande } = await import("@/lib/api/client");
                await mettreEnAttenteCommande(token, commandeId);
                toast.success("Commande mise en attente.");
                router.push(ordersListUrl);
              } catch (error) {
                if (error instanceof ApiError) toast.error(error.message);
              } finally {
                setPendingHold(false);
              }
            }}
            disabled={anyPending}
            className="flex-1 rounded-full bg-gray-200 py-3 text-base font-bold text-gray-500 transition hover:bg-gray-300 disabled:opacity-50"
          >
            {pendingHold ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />
                Traitement…
              </span>
            ) : isEnAttenteClient ? "Garder en attente" : "Mettre en attente"}
          </button>

          <button
            type="button"
            onClick={handleValider}
            disabled={anyPending || (hasMissingPrescription && !ordonnanceFile)}
            className="flex-1 rounded-full bg-toni-green-dark-2 py-3 text-base font-bold text-white transition hover:bg-toni-green-dark disabled:opacity-70"
          >
            {pendingValider ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Traitement…
              </span>
            ) : "Valider la commande"}
          </button>
        </div>
      ) : null}

      {canValidate && hasMissingPrescription && !ordonnanceFile && (
        <p className="text-sm text-red-500 text-center mt-2">
          Veuillez ajouter votre ordonnance avant de valider.
        </p>
      )}
    </section>
  );
}
