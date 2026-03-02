"use client";

import Image from "next/image";
import { useState } from "react";
import { Bell, User, Search, Menu } from "lucide-react";
import PartenaireSidebar from "@/components/partenaire/Sidebar";

/* ──────────────────────────── Types ──────────────────────────── */
interface Permission {
  label: string;
  enabled: boolean;
}

/* ──────────────────────── Mock data ──────────────────────────── */
const mockEmployee = {
  id: 1,
  nom: "Luc ASSOGBA",
  role: "Gestionnaire opérationnel",
  statut: "Actif" as const,
  email: "lucassogba@gmail.com",
  telephone: "+229 01 25 00 00 00",
  dateAjout: "12-05-2024",
};

const defaultPermissions: Permission[] = [
  { label: "Gestion des commandes", enabled: true },
  { label: "Gestion des médicaments", enabled: true },
  { label: "Gestion des employés", enabled: true },
  { label: "Gestion des données de la pharmacie", enabled: true },
  { label: "Gestion des interactions avec les patients", enabled: true },
  { label: "Gestion des performances", enabled: true },
];

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireEmployeDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);

  /* ── Modal state ── */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");

  /* ── Toggle a permission ── */
  const togglePermission = (index: number) => {
    setPermissions((prev) =>
      prev.map((p, i) => (i === index ? { ...p, enabled: !p.enabled } : p)),
    );
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
          <div className="relative min-w-0 flex-1 max-w-lg">
            <Search className="absolute left-3 sm:left-5 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médicament"
              className="w-full rounded-full border-0 bg-emerald-50/60 py-2 sm:py-3 pl-9 sm:pl-14 pr-3 sm:pr-4 text-sm sm:text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
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
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-32 py-6 lg:py-12">
          <div className="mx-auto w-full max-w-[860px] space-y-8">
            {/* ════════ EMPLOYEE CARD ════════ */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
              {/* Top row: name + badge + trash */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {mockEmployee.nom}
                    </h1>
                    <span className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-0.5 text-xs font-medium text-gray-600">
                      {mockEmployee.statut}
                    </span>
                  </div>
                  <p className="mt-1 text-base text-gray-500">{mockEmployee.role}</p>
                </div>

                {/* Trash icon */}
                <button
                  type="button"
                  aria-label="Supprimer cet employé"
                  className="p-2 text-red-500 transition-colors hover:text-red-700"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Image
                    src="/Vector.svg"
                    alt="Supprimer"
                    width={22}
                    height={22}
                  />
                </button>
              </div>

              {/* Info row */}
              <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-600">
                <span>{mockEmployee.email}</span>
                <span>{mockEmployee.telephone}</span>
                <span>{mockEmployee.dateAjout}</span>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  type="button"
                  className="rounded-full border-2 border-emerald-600 px-8 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="rounded-full bg-gray-200 px-8 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-300"
                  onClick={() => setShowDeactivateModal(true)}
                >
                  Désactiver
                </button>
              </div>
            </div>

            {/* ════════ PERMISSIONS SECTION ════════ */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Gérer les permissions
              </h2>

              <div className="rounded-2xl bg-emerald-50/70 px-6 py-2">
                {permissions.map((perm, idx) => (
                  <div key={perm.label}>
                    <div className="flex items-center justify-between py-4">
                      <span className="text-sm font-medium text-gray-700">
                        {perm.label}
                      </span>

                      {/* Toggle switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={perm.enabled}
                        aria-label={perm.label}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                          perm.enabled ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                        onClick={() => togglePermission(idx)}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                            perm.enabled ? "translate-x-6" : "translate-x-1"
                          } mt-1`}
                        />
                      </button>
                    </div>

                    {/* Separator — not after last item */}
                    {idx < permissions.length - 1 && (
                      <hr className="border-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ═══════════ MODAL 1 — Delete confirmation ═══════════ */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white px-8 py-8 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 text-base font-bold text-gray-800">
              Voulez-vous supprimer cet employé ?
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="min-w-[100px] rounded-full bg-emerald-600 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                onClick={() => {
                  /* TODO: handle delete */
                  setShowDeleteModal(false);
                }}
              >
                Oui
              </button>
              <button
                type="button"
                className="min-w-[100px] rounded-full border-2 border-emerald-600 px-8 py-2.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                onClick={() => setShowDeleteModal(false)}
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 2 — Deactivation confirmation ═══════════ */}
      {showDeactivateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={() => setShowDeactivateModal(false)}
        >
          <div
            className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark green header */}
            <div className="bg-emerald-700 px-6 py-4">
              <h3 className="text-center text-base font-bold text-white">
                Confirmer la désactivation
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Entrez votre mot de passe
              </label>
              <input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                type="button"
                className="mt-5 w-full rounded-full bg-emerald-600 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                onClick={() => {
                  /* TODO: handle deactivation */
                  setShowDeactivateModal(false);
                  setDeactivatePassword("");
                }}
              >
                Désactiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

