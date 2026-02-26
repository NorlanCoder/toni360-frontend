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
  Download,
} from "lucide-react";

/* ──────────────────────────── Types ──────────────────────────── */
type OrderStatus = "a-preparer" | "prete" | "recuperee";

interface OrderItem {
  medicament: string;
  qte: number;
  pu: number;
  total: number;
}

interface OrderDetail {
  id: string;
  cmdRef: string;
  patient: string;
  telephone: string;
  date: string;
  heure: string;
  paiement: "momo" | "visa" | "cash";
  pieceJointe: string | null;
  items: OrderItem[];
  montantTotal: number;
  statut: OrderStatus;
}

/* ──────────────────────── Mock data ──────────────────────────── */
const mockOrderDetail: OrderDetail = {
  id: "527785445666",
  cmdRef: "CMD 254-656",
  patient: "Franck Aissi",
  telephone: "+229 01 00 00 00 00",
  date: "12-25-2024",
  heure: "10h00",
  paiement: "momo",
  pieceJointe: "ordonnance.pdf",
  items: [
    { medicament: "Paracétamol 500 mg", qte: 2, pu: 100, total: 1000 },
    { medicament: "Paracétamol 500 mg", qte: 2, pu: 100, total: 1000 },
    { medicament: "Paracétamol 500 mg", qte: 2, pu: 100, total: 1000 },
    { medicament: "Paracétamol 500 mg", qte: 2, pu: 100, total: 1000 },
    { medicament: "Paracétamol 500 mg", qte: 2, pu: 100, total: 1000 },
  ],
  montantTotal: 50000,
  statut: "a-preparer",
};

/* ──────────────────── Sidebar nav items ─────────────────────── */
const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, href: "/partenaire/commandes", active: true },
  { label: "Gestion des employés", icon: Users, href: "/partenaire/employes" },
  { label: "Gestion des médicaments", icon: Pill, href: "/partenaire/medicaments" },
  { label: "Historique des actions", icon: History, href: "/partenaire/employes/historique" },
  { label: "Assistance et support", icon: HelpCircle, href: "#" },
];

/* ──────────────────── Format helpers ────────────────────────── */
function formatPrice(n: number) {
  return n.toLocaleString("fr-FR") + " XOF CFA";
}

function formatTotal(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // In real app: fetch order by id. For now use mock.
  const order: OrderDetail = { ...mockOrderDetail, id: id ?? mockOrderDetail.id };
  const [statut, setStatut] = useState<OrderStatus>(order.statut);

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
          <div className="mb-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-gray-500 hover:text-emerald-700 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Détails de la commande{" "}
              <span className="font-normal text-gray-500">{order.cmdRef}</span>
            </h1>
          </div>

          {/* ────── WRAPPER largeur commune ────── */}
          <div className="max-w-4xl">

          {/* ── Info card ── */}
          <div className="mb-4 rounded-xl border border-gray-200 bg-white px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Patient info */}
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500">
                Patient : <span className="font-bold text-gray-900">{order.patient}</span>
              </p>
              <p className="text-sm text-gray-500">
                Téléphone : <span className="font-semibold text-gray-800">{order.telephone}</span>
              </p>
            </div>

            {/* Date */}
            <div className="text-sm text-gray-500 text-center">
              Commandée le :{" "}
              <span className="font-semibold text-gray-800">
                {order.date} à {order.heure}
              </span>
            </div>

            {/* Paiement */}
            <div className="flex flex-col items-end gap-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Méthode de paiement</p>
              {order.paiement === "momo" && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 bg-white">
                  <Image
                    src="/images/momo.jpg"
                    alt="MoMo from MTN"
                    width={120}
                    height={72}
                    className="object-contain h-20 w-28 rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Pièce jointe ── */}
          {order.pieceJointe && (
            <div className="mb-6 flex items-center justify-end gap-3">
              <span className="text-sm text-gray-500">Pièce jointe :</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
                <span className="text-sm text-gray-700 font-medium truncate max-w-[160px]">
                  {order.pieceJointe}
                </span>
                <button
                  type="button"
                  aria-label="Télécharger la pièce jointe"
                  className="flex items-center justify-center rounded-full bg-emerald-600 p-1.5 text-white hover:bg-emerald-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Tableau médicaments ── */}
          <div className="overflow-x-auto rounded-t-lg border border-gray-200 bg-white">
            <table className="min-w-[520px] w-full table-auto text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Médicament</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Qte</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">P.U.</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="px-6 py-5 text-gray-800">{item.medicament}</td>
                    <td className="px-6 py-5 text-gray-600">{String(item.qte).padStart(2, "0")}</td>
                    <td className="px-6 py-5 text-gray-600">{formatPrice(item.pu)}</td>
                    <td className="px-6 py-5 text-right text-gray-800 font-medium">{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Montant total ── */}
          <div className="flex items-center justify-between rounded-b-lg border border-t-0 border-gray-200 bg-emerald-200 px-6 py-5 mb-8">
            <span className="text-lg font-bold text-gray-800">Montant total</span>
            <span className="text-2xl font-extrabold text-gray-900">{formatTotal(order.montantTotal)}</span>
          </div>

          </div>{/* fin wrapper max-w-4xl */}

          {/* ── Boutons d'action ── */}
          <div className="flex flex-wrap items-center gap-4 ml-8">
            {statut === "prete" ? (
              <button
                type="button"
                disabled
                className="rounded-full bg-emerald-50 border-2 border-emerald-400 px-12 py-3 text-base font-semibold text-emerald-700 cursor-default"
              >
                En attente d&apos;être récupérée
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded-full bg-gray-200 px-10 py-3 text-base font-semibold text-gray-600 hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Demander ordonnance
                </button>

                <button
                  type="button"
                  onClick={() => setStatut("prete")}
                  className="rounded-full border-2 border-emerald-600 bg-emerald-600 px-12 py-3 text-base font-semibold text-white hover:bg-emerald-700 hover:border-emerald-700 transition-colors"
                >
                  Prête
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

