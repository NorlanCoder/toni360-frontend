"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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
  ArrowLeft,
} from "lucide-react";

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/commandes", active: true },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
];

/* ════════════════════════════ PAGE ════════════════════════════ */
export default function OrdonnancePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [decision, setDecision] = useState<"valide" | "refuse" | null>(null);

  function handleValider() {
    setDecision("valide");
    // TODO: appel API – valider l'ordonnance
    router.push(`/partenaire/commandes/${id}`);
  }

  function handleRefuser() {
    setDecision("refuse");
  }

  function handleEnvoyer() {
    if (!notification.trim()) return;
    // TODO: appel API – envoyer la notification au patient
    alert("Notification envoyée au patient.");
    setNotification("");
    setDecision(null);
  }

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
          <Link href="/partenaire/dashboard" className="flex items-center gap-2">
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

          <div className="flex-1" />

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
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="flex shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-lg">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médicament"
              className="w-full rounded-full border-0 bg-emerald-50/60 py-3 pl-14 pr-4 text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10 bg-emerald-50">

          {/* Back + Title */}
          <div className="mb-8 flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-gray-500 hover:text-emerald-700 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Ordonnance
            </h1>
          </div>

          {/* ─── MAIN LAYOUT : aperçu gauche + actions droite ─── */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Aperçu ordonnance ── */}
            <div className="flex-1 max-w-[520px]">
              <div className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
                {/* Document */}
                <div className="p-8 font-serif text-[13px] text-gray-800 min-h-[580px] flex flex-col">

                  {/* En-tête médecin */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-bold text-sm">Dr Arnaud PROVO</p>
                      <p className="text-gray-600 text-xs">Médecin généraliste</p>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <p>121 Rue d&apos;Aguesseau</p>
                      <p>92100 Boulogne-Billancourt</p>
                      <p>Tél : 01 49 09 22 00</p>
                    </div>
                  </div>

                  {/* Codes-barres */}
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex flex-col items-start gap-0.5">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-gray-900"
                          style={{
                            height: "2px",
                            width: `${40 + ((i * 7) % 24)}px`,
                            marginBottom: "1px",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-gray-900"
                          style={{
                            height: "2px",
                            width: `${35 + ((i * 11) % 28)}px`,
                            marginBottom: "1px",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1" />

                  {/* Infos patient */}
                  <div className="mb-6 mt-4">
                    <p className="font-bold">Madame Diane LANE</p>
                    <p className="text-gray-600 text-xs">55 ans</p>
                  </div>

                  {/* Médicament */}
                  <div className="mb-6">
                    <p className="font-bold text-sm tracking-wide">DOLIPRANE 1 000MG CPR 8</p>
                    <p className="text-xs text-gray-600 italic">
                      1 comprimé matin, midi et soir pendant 3 jours
                    </p>
                  </div>

                  {/* Date + Signature */}
                  <div className="flex justify-between items-end mt-6">
                    <span className="text-xs text-gray-500">
                      Boulogne-Billancourt, le 21/03/2022
                    </span>
                    <div className="text-right">
                      {/* Signature stylisée */}
                      <svg
                        width="80"
                        height="40"
                        viewBox="0 0 80 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M10 30 Q20 5 30 20 Q40 35 50 15 Q60 5 70 25"
                          stroke="#374151"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <path
                          d="M15 34 Q30 28 50 32 Q60 34 68 30"
                          stroke="#374151"
                          strokeWidth="1"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Numéro de page */}
                  <div className="flex justify-end mt-4">
                    <span className="border border-gray-400 px-2 py-0.5 text-xs text-gray-500">
                      1
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Actions droite ── */}
            <div className="flex flex-col gap-6 w-full lg:w-[360px]">

              {/* Boutons Valider / Refuser */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleValider}
                  className={`flex-1 rounded-full px-8 py-3 text-base font-semibold transition-colors ${
                    decision === "valide"
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  Valider
                </button>
                <button
                  type="button"
                  onClick={handleRefuser}
                  className={`flex-1 rounded-full border-2 px-8 py-3 text-base font-semibold transition-colors ${
                    decision === "refuse"
                      ? "border-red-600 bg-red-50 text-red-700"
                      : "border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  Refuser
                </button>
              </div>

              {/* Zone de notification */}
              <div className="flex flex-col gap-3">
                <textarea
                  value={notification}
                  onChange={(e) => setNotification(e.target.value)}
                  placeholder="Notifier une incohérence au patient..."
                  rows={10}
                  className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-5 py-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleEnvoyer}
                    disabled={!notification.trim()}
                    className="rounded-full border-2 border-emerald-600 px-10 py-3 text-base font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Envoyer
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
