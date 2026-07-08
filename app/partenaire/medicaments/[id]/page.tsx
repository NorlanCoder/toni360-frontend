"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import {
  addPartnerStockQuantity,
  deactivatePartnerProduit,
  getPartnerProduit,
  getPartnerProduitFormes,
  updatePartnerProduit,
  updatePartnerProduitSeuil,
  type PartnerProduit,
} from "@/lib/api/partner";
import { toast } from "sonner";


/* ──────────────── Helpers numériques ────────────────────────── */
function formatPrix(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(",");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return decPart !== undefined ? `${formatted},${decPart}` : formatted;
}

function StockQuantityModal({
  show,
  quantite,
  onQuantiteChange,
  onConfirm,
  onCancel,
  isSubmitting,
  produitNom,
}: {
  show: boolean;
  quantite: string;
  onQuantiteChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  produitNom: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-emerald-700 px-6 py-4 text-center">
          <h2 className="text-lg font-bold text-white">Ajouter au stock</h2>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm text-gray-700">
            Ajouter une quantité au stock du médicament <span className="font-semibold">{produitNom}</span>.
          </p>
          <div className="mt-4">
            <label className="mb-1 block text-sm text-gray-500">Quantité à ajouter</label>
            <input
              type="text"
              inputMode="numeric"
              value={formatMilliers(quantite)}
              onChange={(e) => onQuantiteChange(onlyDigits(e.target.value))}
              placeholder="Ex: 100"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting || Number(quantite) < 1}
              className="rounded-full bg-emerald-600 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? "Ajout..." : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-gray-300 bg-gray-200 px-8 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function onlyPrixChars(value: string): string {
  const cleaned = value.replace(/[\s\u00a0]/g, "");
  const withoutInvalid = cleaned.replace(/[^\d,]/g, "");
  const parts = withoutInvalid.split(",");
  if (parts.length > 2) return parts[0] + "," + parts.slice(1).join("");
  return withoutInvalid;
}

function formatMilliers(raw: string): string {
  if (!raw) return "";
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const date = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${date} à ${time}`;
}

const FORMES_DEFAUT = [
  "Comprimés", "Gélules", "Sirop", "Suspension buvable", "Injectable",
  "Crème", "Pommade", "Gel", "Suppositoire", "Solution buvable", "Poudre", "Patch", "Spray",
];

/* ──────────────── Delete confirmation modal ─────────────────── */
function DeleteConfirmationModal({
  show,
  nom,
  stock,
  onConfirm,
  onCancel,
}: {
  show: boolean;
  nom: string;
  stock: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Green header */}
        <div className="bg-emerald-700 px-6 py-4 text-center">
          <h2 className="text-lg font-bold text-white">Confirmer la suppression</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center">
          <p className="text-sm text-gray-700">
            Êtes-vous sûr de vouloir supprimer le médicament actuel de votre stock ?
          </p>
          <div className="mt-4 text-sm text-gray-800">
            <p>
              <span className="font-bold">Nom :</span> {nom}
            </p>
            <p>
              <span className="font-bold">Stock actuel :</span> {stock}
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full border border-gray-300 bg-gray-200 px-8 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300"
            >
              Oui
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full bg-emerald-600 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Non
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireMedicamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [produit, setProduit] = useState<PartnerProduit | null>(null);

  /* ── Form state ── */
  const [nom, setNom] = useState("");
  const [nomGenerique, setNomGenerique] = useState("");
  const [forme, setForme] = useState("");
  const [prix, setPrix] = useState("");
  const [stockActuel, setStockActuel] = useState("0");
  const [stockAAjouter, setStockAAjouter] = useState("0");
  const [seuil, setSeuil] = useState("0");
  const [formes, setFormes] = useState<string[]>(FORMES_DEFAUT);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const loadProduit = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token || !id) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const [response, formesRes] = await Promise.all([
          getPartnerProduit(session.token, id),
          getPartnerProduitFormes(session.token),
        ]);
        const p = response.data.produit;
        setProduit(p);
        setNom(p.nom);
        setNomGenerique(p.nom_generique ?? "");
        setForme(p.forme ?? "");
        setPrix(p.stock?.prix_unitaire != null ? String(p.stock.prix_unitaire).replace(".", ",") : "");
        setStockActuel(String(p.stock?.quantite ?? 0));
        setSeuil(String(p.stock?.seuil_alerte ?? 0));
        setCreatedAt(p.created_at ?? null);
        setUpdatedAt(p.updated_at ?? null);

        const apiFormes = formesRes.data?.formes ?? [];
        if (apiFormes.length > 0) {
          const merged = [...FORMES_DEFAUT];
          for (const f of apiFormes) {
            if (!merged.some((d) => d.toLowerCase() === f.toLowerCase())) merged.push(f);
          }
          setFormes(merged.sort());
        }
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger le médicament.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProduit();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    setIsSubmitting(true);
    try {
      const prixVente = prix ? Number(prix.replace(",", ".")) : undefined;
      await updatePartnerProduit(session.token, id, {
        nom,
        dci: nomGenerique,
        forme,
        prix_vente: prixVente && !Number.isNaN(prixVente) ? prixVente : undefined,
      });
      const seuilNum = Number(seuil);
      if (!Number.isNaN(seuilNum)) {
        await updatePartnerProduitSeuil(session.token, id, seuilNum);
      }
      toast.success("Médicament mis à jour.");
      router.push("/partenaire/medicaments");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Sauvegarde impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    setIsSubmitting(true);
    try {
      await deactivatePartnerProduit(session.token, id);
      setShowDeleteModal(false);
      setProduit((current) => current ? { ...current, is_active: false } : current);
      toast.success("Médicament désactivé. Le stock n'est plus disponible à la vente.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Désactivation impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id || !produit) {
      toast.error("Session partenaire invalide.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePartnerProduit(session.token, id, { is_active: !produit.is_active });
      setProduit((current) => current ? { ...current, is_active: !current.is_active } : current);
      toast.success(produit.is_active ? "Médicament désactivé." : "Médicament réactivé.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Impossible de modifier l'état du produit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStock = async () => {
    const session = getAuthSession();
    const quantite = Number(stockAAjouter);

    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    if (!Number.isFinite(quantite) || quantite < 1) {
      toast.warning("Veuillez saisir une quantité valide.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addPartnerStockQuantity(session.token, id, quantite);
      setStockActuel((prev) => String(Number(prev.replace(/\s/g, "")) + quantite));
      setShowStockModal(false);
      setStockAAjouter("0");
      toast.success("Quantité ajoutée au stock avec succès.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Ajout au stock impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Chargement du médicament...</div>;
  }

  return (
    <>
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto p-2 px-4 sm:px-12 lg:px-32 py-10 lg:py-16">
          <Link
            href="/partenaire/medicaments"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-toni-green-dark-2 hover:underline mb-6"
          >
            ← Retour aux médicaments
          </Link>
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStockModal(true)}
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Ajouter au stock
              </button>
            </div>
          <form
            onSubmit={handleSave}
            className="mx-auto w-full max-w-[920px] rounded-xl bg-white p-6 sm:p-8"
          >
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Nom du médicament
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  disabled
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-lg text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Nom générique
                </label>
                <input
                  type="text"
                  value={nomGenerique}
                  onChange={(e) => setNomGenerique(e.target.value)}
                  disabled
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-lg text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Forme pharmaceutique
                </label>
                <div className="relative">
                  <select
                    value={forme}
                    onChange={(e) => setForme(e.target.value)}
                    disabled
                    className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-3 text-lg text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                  >
                    <option value="">Sélectionner...</option>
                    {formes.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Prix unitaire
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formatPrix(prix)}
                    onChange={(e) => setPrix(onlyPrixChars(e.target.value))}
                    placeholder="Ex: 1 500,50"
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 pr-16 text-lg text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-gray-400">
                    FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Stock actuel
                </label>
                <input
                  type="text"
                  value={formatMilliers(stockActuel)}
                  disabled
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-base text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-emerald-600">
                  Ajouté le {formatDateTime(createdAt)}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Seuil de réapprovisionnement
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMilliers(seuil)}
                  onChange={(e) => setSeuil(onlyDigits(e.target.value))}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="mt-1 text-xs text-emerald-600">
                  Mis à jour le {formatDateTime(updatedAt)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/partenaire/medicaments")}
                className="rounded-full border border-gray-400 bg-white px-12 py-3.5 text-base font-semibold text-emerald-700 transition-colors hover:bg-gray-50 text-center"
              >
                Annuler
              </button>

              <div className="flex gap-4 sm:ml-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-emerald-600 px-12 py-3.5 text-base font-semibold text-white transition-colors hover:bg-emerald-700 text-center"
                >
                  {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
                </button>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={isSubmitting}
                  className={`rounded-full px-12 py-3.5 text-base font-semibold transition-colors disabled:opacity-60 text-center ${
                    produit?.is_active
                      ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {produit?.is_active ? "Désactiver" : "Réactiver"}
                </button>
              </div>
            </div>
          </form>
        </main>

      {/* ───────────── DELETE CONFIRMATION MODAL ───────────── */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        nom={nom}
        stock={stockActuel}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <StockQuantityModal
        show={showStockModal}
        quantite={stockAAjouter}
        onQuantiteChange={setStockAAjouter}
        onConfirm={handleAddStock}
        onCancel={() => setShowStockModal(false)}
        isSubmitting={isSubmitting}
        produitNom={nom}
      />
    </>
  );
}

