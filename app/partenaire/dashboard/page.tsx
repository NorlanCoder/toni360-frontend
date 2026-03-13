"use client";

import Image from "next/image";
import Link from "next/link";
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
  Menu,
} from "lucide-react";

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/dashboard", active: true },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
];

/* ─────────────────────── Donut Chart ───────────────────────── */
// r=40 → circumference = 2π×40 ≈ 251.33 | each of 3 equal segments ≈ 83.78
const CIRCUMFERENCE = 251.33;
const SEGMENT = CIRCUMFERENCE / 3; // ≈ 83.78

const donutSegments = [
  { color: "#1e3a8a", label: "Gestionnaire opérationnel (25)", offset: 0 },
  { color: "#a855f7", label: "Responsable des stocks (25)", offset: SEGMENT },
  { color: "#facc15", label: "Responsable des commandes (25)", offset: SEGMENT * 2 },
];

/* ────────────────── Arrow button (green circle) ──────────────── */
function ArrowButton() {
  return (
    <button
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
      aria-label="Voir le détail"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path
          fillRule="evenodd"
          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
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
        <header className="flex h-20 lg:h-24 shrink-0 items-center gap-3 justify-between border-b border-gray-200 bg-white px-4 md:px-8">
          {/* Hamburger (mobile) */}
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="flex shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Welcome text */}
          <h1 className="text-xl font-bold text-gray-900 min-w-0 truncate">
            Bienvenue, Dr Roopesh
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              aria-label="Voir les notifications"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Notifications</span>
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Accéder à mon compte"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Mon Compte</span>
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 lg:py-8">

          {/* ── Row 1: 3 stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">

            {/* Card 1 — Commandes à préparer */}
            <div className="flex flex-col rounded-2xl bg-[#fde8e8] p-6 min-h-[220px]">
              {/* Icon */}
              <div className="mb-4">
                <Image
                  src="/preparer.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>
              {/* Title */}
              <p className="text-xl font-bold text-red-700 leading-snug mb-4">
                Commandes<br />à préparer
              </p>
              {/* Count */}
              <div className="flex items-center gap-3 mt-auto mb-4">
                <span className="text-6xl font-bold text-red-700 leading-none">12</span>
                <span className="text-sm text-red-600 leading-tight max-w-[100px]">
                  commandes en attente de préparation
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton />
              </div>
            </div>

            {/* Card 2 — Commandes en attente */}
            <div className="flex flex-col rounded-2xl bg-[#fef9e7] p-6 min-h-[220px]">
              {/* Icon */}
              <div className="mb-4">
                <Image
                  src="/enattente.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>
              {/* Title */}
              <p className="text-xl font-bold text-[#b7860b] leading-snug mb-4">
                Commandes<br />en attente
              </p>
              {/* Count */}
              <div className="flex items-center gap-3 mt-auto mb-4">
                <span className="text-6xl font-bold text-[#b7860b] leading-none">34</span>
                <span className="text-sm text-[#b7860b] leading-tight max-w-[110px]">
                  commandes prêtes à être récupérées
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton />
              </div>
            </div>

            {/* Card 3 — Commandes récupérées */}
            <div className="flex flex-col rounded-2xl bg-[#e6f7f0] border border-emerald-300 p-6 min-h-[220px]">
              {/* Icon */}
              <div className="mb-4">
                <Image
                  src="/recuperer.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>
              {/* Title */}
              <p className="text-xl font-bold text-emerald-800 leading-snug mb-4">
                Commandes<br />récupérées
              </p>
              {/* Count */}
              <div className="flex items-center gap-3 mt-auto mb-4">
                <span className="text-6xl font-bold text-emerald-800 leading-none">34</span>
                <span className="text-sm text-emerald-700 leading-tight max-w-[110px]">
                  commandes récupérées par les patients
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton />
              </div>
            </div>
          </div>

          {/* ── Row 2: Stock card + Donut chart ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Card 4 — Stocks disponibles */}
            <div className="flex flex-col rounded-2xl bg-[#e6f7f0] border border-emerald-300 p-6 min-h-[220px]">
              {/* Icon */}
              <div className="mb-4">
                <Image
                  src="/stock.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </div>
              {/* Title */}
              <p className="text-xl font-bold text-emerald-800 leading-snug mb-4">
                Stocks<br />disponibles
              </p>
              {/* Count */}
              <div className="flex items-center gap-3 mt-auto mb-4">
                <span className="text-6xl font-bold text-emerald-800 leading-none">2045</span>
                <span className="text-sm text-emerald-700 leading-tight max-w-[110px]">
                  produits actuellement en stock
                </span>
              </div>
              {/* Arrow */}
              <div>
                <ArrowButton />
              </div>
            </div>

            {/* Card 5 — Donut chart */}
            <div className="flex items-center justify-center rounded-2xl border border-emerald-300 bg-white p-6 min-h-[220px]">
              <div className="flex items-center gap-8">
                {/* SVG Donut */}
                <svg
                  viewBox="0 0 100 100"
                  className="h-40 w-40 shrink-0"
                  aria-hidden="true"
                >
                  {/* Background ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="18"
                  />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.label}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="18"
                      strokeDasharray={`${SEGMENT} ${CIRCUMFERENCE - SEGMENT}`}
                      strokeDashoffset={-seg.offset}
                      transform="rotate(-90 50 50)"
                    />
                  ))}
                  {/* White hole in the center */}
                  <circle cx="50" cy="50" r="24" fill="white" />
                </svg>

                {/* Legend */}
                <ul className="flex flex-col gap-3">
                  {donutSegments.map((seg) => (
                    <li key={seg.label} className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 shrink-0 rounded-sm"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-sm text-gray-700">{seg.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
