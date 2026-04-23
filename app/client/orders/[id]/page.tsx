"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, FileText, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  annulerCommande,
  getCommande,
  uploadOrdonnanceForProduitCommande,
  validerCommande,
  verifierDisponibiliteCommande,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

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
  const commandeId = String(params.id);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyAdresse, setPharmacyAdresse] = useState("");
  const [pharmacyTelephone, setPharmacyTelephone] = useState("");
  const [commandeNumero, setCommandeNumero] = useState("");
  const [commandeStatut, setCommandeStatut] = useState("");
  const [ordonnanceFile, setOrdonnanceFile] = useState<File | null>(null);
  const [pendingAnnuler, setPendingAnnuler] = useState(false);
  const [pendingHold, setPendingHold] = useState(false);
  const [pendingValider, setPendingValider] = useState(false);
  const [pendingVerif, setPendingVerif] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      setPharmacyAdresse(commande.pharmacie?.adresse ?? "");
      setPharmacyTelephone(commande.pharmacie?.telephone ?? "");

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
  const formatPrice = (v: number) => Number(v).toLocaleString("fr-FR").replace(/,/g, " ");

  const canValidate = commandeStatut === "en_attente_paiement" || commandeStatut === "en_attente_client";
  const isEnAttenteClient = commandeStatut === "en_attente_client";

  const handleVerifierDisponibilite = async () => {
    if (!token || pendingVerif) return;
    setPendingVerif(true);
    try {
      const res = await verifierDisponibiliteCommande(token, commandeId);
      if (res.data?.commande_annulee) {
        toast.error("Tous les produits sont en rupture de stock. La commande a été annulée.");
        router.push("/client/orders");
        return;
      }
      const supprimes = res.data?.produits_supprimes ?? [];
      const ajustes = res.data?.produits_ajustes ?? [];
      if (supprimes.length > 0) {
        toast.warning(`${supprimes.length} produit(s) retiré(s) : ${supprimes.map((p) => p.nom).join(", ")}.`);
      }
      if (ajustes.length > 0) {
        toast.warning(`${ajustes.length} produit(s) ajusté(s) : ${ajustes.map((p) => `${p.nom} (${p.quantite_demandee}→${p.quantite_ajustee})`).join(", ")}.`);
      }
      if (supprimes.length === 0 && ajustes.length === 0) {
        toast.success("Tous les produits sont disponibles !");
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

  const uploadOrdonnances = async (file: File) => {
    if (!token) return;
    for (const item of missingPrescriptionItems) {
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

  const anyPending = pendingAnnuler || pendingHold || pendingValider;

  const handleValider = async () => {
    if (!token || anyPending) return;

    if (hasMissingPrescription && !ordonnanceFile) {
      toast.warning("Veuillez ajouter l'ordonnance avant de valider.");
      return;
    }

    setPendingValider(true);
    try {
      if (ordonnanceFile) {
        try {
          await uploadOrdonnances(ordonnanceFile);
          toast.success("Ordonnance soumise ! La pharmacie va vérifier votre ordonnance.");
          router.push("/client/orders");
          return;
        } catch {
          setOrdonnanceFile(null);
          toast.error("L'ordonnance n'a pas pu être envoyée. Sélectionnez un nouveau fichier et réessayez.");
          return;
        }
      }

      await validerCommande(token, commandeId);
      toast.success("Commande validée ! La pharmacie va prendre en charge votre commande.");
      router.push("/client/orders?tab=en_cours");
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
      router.push("/client/orders");
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
    } finally {
      setPendingAnnuler(false);
    }
  };

  const mapsUrl = pharmacyAdresse
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacyAdresse)}`
    : "#";

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
        onClick={() => router.push("/client/orders")}
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

      {/* Table produits */}
      <div className="overflow-hidden bg-white">
        <div className="hidden sm:grid sm:grid-cols-[1fr_100px_150px_150px] gap-2 px-6 py-3 text-base font-bold text-[#B5B5B5] border-b border-[#66666680]">
          <span>Nom du produit</span>
          <span className="text-center">Qté</span>
          <span>Prix</span>
          <span>Total</span>
        </div>

        {items.map((item, idx) => (
          <div
            key={item.id}
            className={idx < items.length - 1 ? "border-b border-[#66666680]" : ""}
          >
            <div className="flex flex-col gap-2 px-6 py-4 sm:grid sm:grid-cols-[1fr_100px_150px_150px] sm:gap-2 sm:items-center">
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

              <span className="text-sm text-gray-700 text-center">
                <span className="sm:hidden text-gray-400 mr-1">Qté :</span>
                {item.qty}
              </span>

              <span className="text-sm text-gray-700 whitespace-nowrap">
                <span className="sm:hidden text-gray-400 mr-1">Prix :</span>
                {formatPrice(item.price)} XOF CFA
              </span>

              <span className="text-sm text-gray-700 whitespace-nowrap">
                <span className="sm:hidden text-gray-400 mr-1">Total :</span>
                {formatPrice(item.qty * item.price)} XOF CFA
              </span>
            </div>


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

      {/* Ordonnance déjà soumise */}
      {items.some((i) => i.ordonnanceUrl) && (
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-700">Ordonnance soumise :</p>
          <a
            href={items.find((i) => i.ordonnanceUrl)!.ordonnanceUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              src={items.find((i) => i.ordonnanceUrl)!.ordonnanceUrl!}
              alt="Ordonnance"
              className="max-h-60 rounded-xl border border-gray-200 object-contain hover:opacity-90 transition"
            />
          </a>
        </div>
      )}

      {/* Section ordonnance — uniquement si des produits manquent une ordonnance et commande active */}
      {hasMissingPrescription && canValidate && (
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-sm text-gray-600 mb-1">
            {missingPrescriptionItems.length} médicament(s) nécessitent une ordonnance.
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
              const MAX_SIZE = 5 * 1024 * 1024;
              if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error("Format non supporté. Seuls JPG, PNG et PDF sont acceptés.");
                e.target.value = "";
                return;
              }
              if (file.size > MAX_SIZE) {
                toast.error(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Max : 5 Mo.`);
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

          <button
            type="button"
            onClick={handleVerifierDisponibilite}
            disabled={pendingVerif}
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
              setPendingHold(true);
              try {
                const { mettreEnAttenteCommande } = await import("@/lib/api/client");
                await mettreEnAttenteCommande(token, commandeId);
                toast.success("Commande mise en attente.");
                router.push("/client/orders");
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
            ) : "Mettre en attente"}
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
