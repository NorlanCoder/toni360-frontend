"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Bell, User, Search, Menu } from "lucide-react";
import PartenaireSidebar from "@/components/partenaire/Sidebar";


/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireAjouterMedicamentPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* ── Form state ── */
  const [nom, setNom] = useState("Paracétamol 500mg");
  const [nomGenerique, setNomGenerique] = useState("Paracétamol");
  const [forme, setForme] = useState("Comprimés");
  const [prix, setPrix] = useState("700 XOF CFA");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <PartenaireSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ───────────── MAIN AREA ──────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── HEADER ─── */}
        <header className="flex h-16 lg:h-20 shrink-0 items-center gap-3 justify-between border-b border-gray-200 bg-white px-4 md:px-8">
          {/* Hamburger (mobile) */}
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="flex shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médicament"
              className="w-full rounded-full border-0 bg-emerald-50/60 py-3 pl-14 pr-4 text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Voir les notifications"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Notifications</span>
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Accéder à mon compte"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Mon Compte</span>
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

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
              className="mt-10 w-full rounded-full bg-emerald-600 py-4 text-lg font-bold text-white transition-colors hover:bg-emerald-700"
            >
              Ajouter au stock
            </button>
          </form>
        </main>
      </div>

      {/* ───────────── CONFIRMATION MODAL ───────────── */}
      <ConfirmationModal
        show={showModal}
        message={`Le médicament ${nom} a été ajouté au stock avec succès.`}
        iconPath="/images/checkmark.svg"
        onClose={() => setShowModal(false)}
      />
    </div>
  );

  
}
