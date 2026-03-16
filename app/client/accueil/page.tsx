"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  User,
  ListOrdered,
  Bell,
  ShoppingCart,
  HelpCircle,
  LogOut,
  Search,
} from "lucide-react";
import { getPatientProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

const navItems = [
  { label: "Accueil", href: "/client/accueil", icon: Home, active: true },
  { label: "Mon compte", href: "/client/profil", icon: User },
  { label: "Mes commandes", href: "/client/dashboard", icon: ListOrdered },
  { label: "Notifications", href: "/client/notifications", icon: Bell },
  { label: "Mon Panier", href: "/client/dashboard/cart", icon: ShoppingCart },
  { label: "Centre d'aide", href: "/client/faq", icon: HelpCircle },
];

export default function AccueilClientPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [patientName, setPatientName] = useState("Mr Vagelas");

  useEffect(() => {
    const session = getAuthSession();

    if (!session || session.userType !== "patient") {
      router.push("/client/connexion");
      return;
    }

    let active = true;

    getPatientProfile(session.token)
      .then((response) => {
        if (!active) {
          return;
        }

        const fallbackName = `${response.data.patient.prenom} ${response.data.patient.nom}`.trim();
        setPatientName(response.data.patient.nom_complet || fallbackName || "Client");
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          clearAuthSession();
          router.push("/client/connexion");
          return;
        }

        window.alert("Impossible de charger votre profil.");
      });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="flex    min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-72 flex flex-col justify-between py-8 px-6 border-r-2 border-gray-300 bg-white shrink-0">
        {/* Logo */}
        <div>
          <div className="mb-12 mt-6">
            <img src="/images/logo.png" alt="Toni360" className="h-20" />
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {navItems.map(({ label, href, icon: Icon, active }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                  active
                    ? "bg-toni-green-light text-toni-green-dark-2 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}            {/* Déconnexion - juste après la navigation */}
            <Link
              href="/client/connexion"
              className="flex items-center gap-3 px-3 py-2.5 text-[15px] text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </Link>          </nav>
        </div>

        {/* Footer sidebar */}
        <div className="flex flex-col gap-3">
          <div className="text-xs text-toni-green-dark-2 leading-relaxed">
            <Link href="/client/privacy" className="hover:underline block">
              Politiques de confidentialité,
            </Link>
            <Link href="/client/return-policy" className="hover:underline block">
              Conditions générales de retour,
            </Link>
            <Link href="/client/contact" className="hover:underline block">
              Contactez-nous
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 pt-16 pb-6 border-b-2 border-gray-300">
          {/* Search */}
          <div className="relative flex-1 max-w-xl ml-10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un médicament..."
              className="w-full pl-5 pr-12 py-3.5 rounded-full border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-gray-700"
            />
            <button className="absolute right-0 top-0 bottom-0 px-4 bg-toni-green-dark-2 rounded-r-full flex items-center justify-center text-white hover:bg-toni-green-dark transition">
              <Search size={20} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 -translate-x-12">
            <Link
              href="/client/notifications"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-toni-green-dark-2 text-toni-green-dark-2 text-base font-semibold hover:bg-toni-green-light transition"
            >
              <Bell size={16} />
              Notifications
            </Link>
            <Link
              href="/client/dashboard/cart"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-toni-green-dark-2 text-toni-green-dark-2 text-base font-semibold hover:bg-toni-green-light transition"
            >
              <ShoppingCart size={16} />
              Mon Panier
            </Link>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-8 py-8 pl-24">
          {/* Welcome */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Bienvenue, {patientName}
          </h1>

          {/* Hero card */}
          <div className="relative rounded-2xl overflow-hidden" style={{ maxWidth: "750px", height: "420px" }}>
            <img
              src="/images/ph7.png"
              alt="Pharmacie"
              className="w-full h-full object-cover"
            />
            {/* Green gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,128,80,0.85) 0%, rgba(0,128,80,0.2) 50%, transparent 100%)",
              }}
            />
            {/* Text on image */}
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-white text-2xl font-bold leading-snug">
                Trouvez facilement votre médicament.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
