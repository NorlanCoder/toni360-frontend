"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Pill,
  History,
  HelpCircle,
  LogOut,
  Bell,
  User,
  Search,
  Menu,
  ChevronDown,
} from "lucide-react";

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/commandes", active: true },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
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
          <h2 className="text-lg font-bold text-white">Confirmer la supression</h2>
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
              <span className="font-bold">Stock actuek :</span> {stock}
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* ── Form state (pre-filled with mock data) ── */
  const [nom, setNom] = useState("Paracétamol 500mg");
  const [nomGenerique, setNomGenerique] = useState("Paracétamol");
  const [forme, setForme] = useState("Comprimés");
  const [prix, setPrix] = useState("700 XOF CFA");
  const [stockActuel, setStockActuel] = useState("100");
  const [seuil, setSeuil] = useState("100");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle save
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    router.push("/partenaire/medicaments");
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* ───────────── MOBILE OVERLAY ───────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ───────────── SIDEBAR ───────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:relative lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center px-5">
          <Link href="/partenaire/commandes" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Toni 360°"
              width={180}
              height={56}
              priority
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 px-3 pt-4" aria-label="Navigation partenaire">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-4 text-base font-medium transition-colors ${
                  item.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-6 w-6 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Déconnexion */}
          <Link
            href="#"
            className="mb-6 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Déconnexion
          </Link>
        </nav>
      </aside>

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
        <main className="flex-1 overflow-y-auto p-2 px-4 sm:px-12 lg:px-32 py-16 lg:py-24">
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
                    className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-3 text-lg text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                  >
                    <option value="Comprimés">Comprimés</option>
                    <option value="Gélules">Gélules</option>
                    <option value="Sirop">Sirop</option>
                    <option value="Injectable">Injectable</option>
                    <option value="Pommade">Pommade</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  Prix unitaire
                </label>
                <input
                  type="text"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-lg text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
                />
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
                  value={stockActuel}
                  onChange={(e) => setStockActuel(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="mt-1 text-xs text-emerald-600">
                  Ajouté le 14-25-2024 à 15h30
                </p>
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
                <p className="mt-1 text-xs text-emerald-600">
                  Mis à jour le 14-25-2024 à 15h30
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 sm:gap-8 lg:gap-40">
              <button
                type="button"
                onClick={() => router.push("/partenaire/medicaments")}
                className="rounded-full border border-gray-400 bg-white px-12 py-3.5 text-base font-semibold text-emerald-700 transition-colors hover:bg-gray-50 text-center"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-12 py-3.5 text-base font-semibold text-white transition-colors hover:bg-emerald-700 text-center"
              >
                Sauvegarder
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="rounded-full bg-red-500 px-12 py-3.5 text-base font-semibold text-white transition-colors hover:bg-red-600 text-center"
              >
                Supprimer
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* ───────────── DELETE CONFIRMATION MODAL ───────────── */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        nom={nomGenerique}
        stock={stockActuel}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

