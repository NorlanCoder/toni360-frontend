"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ConfirmationModal";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { createPartnerProduit } from "@/lib/api/partner";
import { toast } from "sonner";


/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireAjouterMedicamentPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Form state ── */
  const [nom, setNom] = useState("Paracétamol 500mg");
  const [nomGenerique, setNomGenerique] = useState("Paracétamol");
  const [forme, setForme] = useState("Comprimés");
  const [prix, setPrix] = useState("700");
  const [stockInitial, setStockInitial] = useState("100");
  const [seuil, setSeuil] = useState("100");
  const [ordonnance, setOrdonnance] = useState(true);

  /* ── Auto-close modal after 3 s ── */
  useEffect(() => {
    if (!showModal) return;
    const timer = setTimeout(() => {
      setShowModal(false);
      router.push("/partenaire/medicaments");
    }, 3000);
    return () => clearTimeout(timer);
  }, [showModal, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      toast.error("Session partenaire invalide.");
      return;
    }

    const prixVente = Number(prix.replace(/\s|[^\d.]/g, ""));
    const quantite = Number(stockInitial);
    const seuilAlerte = Number(seuil);

    if (!nom || !forme || Number.isNaN(prixVente) || Number.isNaN(quantite) || Number.isNaN(seuilAlerte)) {
      toast.warning("Veuillez remplir correctement le formulaire.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPartnerProduit(session.token, {
        nom,
        dci: nomGenerique,
        forme,
        dosage: "500mg",
        prix_achat: prixVente,
        prix_vente: prixVente,
        necessite_ordonnance: ordonnance,
        quantite_initiale: quantite,
        seuil_alerte: seuilAlerte,
      });
      setShowModal(true);
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de l'ajout du médicament.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-12 lg:px-32 py-10 lg:py-16">
          <form
            onSubmit={handleSubmit}
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
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Forme pharmaceutique
                </label>
                <input
                  type="text"
                  value={forme}
                  onChange={(e) => setForme(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Prix unitaire
                </label>
                <input
                  type="text"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Stock initial
                </label>
                <input
                  type="text"
                  value={stockInitial}
                  onChange={(e) => setStockInitial(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Seuil de réapprovisionnement
                </label>
                <input
                  type="text"
                  value={seuil}
                  onChange={(e) => setSeuil(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Toggle row */}
            <div className="mt-8 flex items-center gap-4 py-4">
              <span className="text-base text-gray-500">
                Médicament soumis à ordonnance ?
              </span>
              <span className={`text-sm font-medium ${!ordonnance ? "text-gray-800" : "text-gray-400"}`}>
                Non
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={ordonnance}
                onClick={() => setOrdonnance(!ordonnance)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                  ordonnance ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    ordonnance ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`ml-6 text-sm font-medium ${ordonnance ? "text-gray-800" : "text-gray-400"}`}>
                Oui
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-10 w-full rounded-full bg-emerald-600 py-4 text-lg font-bold text-white transition-colors hover:bg-emerald-700"
            >
              {isSubmitting ? "Ajout en cours..." : "Ajouter au stock"}
            </button>
          </form>
        </main>

      {/* ───────────── CONFIRMATION MODAL ───────────── */}
      <ConfirmationModal
        show={showModal}
        message={`Le médicament ${nom} a été ajouté au stock avec succès.`}
        iconPath="/images/checkmark.svg"
        onClose={() => setShowModal(false)}
      />
    </>
  );

  
}
