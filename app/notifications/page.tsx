"use client";

import { Home, User, Package, Bell, ShoppingCart, HelpCircle, LogOut, BellOff } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <img src="/images/logo.png" alt="Toni360" className="h-14" />
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-2 border-2 border-toni-green-dark-2 text-toni-green-dark-2 rounded-full font-semibold text-base hover:bg-toni-green-dark-2 hover:text-white transition">
              <Bell size={20} />
              Notifications
            </button>
            <button className="flex items-center gap-2 px-6 py-2 border-2 border-toni-green-dark-2 text-toni-green-dark-2 rounded-full font-semibold text-base hover:bg-toni-green-dark-2 hover:text-white transition">
              <ShoppingCart size={20} />
              Mon Panier
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] p-6 flex flex-col justify-between">
          <nav className="space-y-2">
            <Link href="/accueil" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <Home size={20} />
              <span>Accueil</span>
            </Link>
            <Link href="/profil" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <User size={20} />
              <span>Mon compte</span>
            </Link>
            <Link href="/commandes" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <Package size={20} />
              <span>Mes commandes</span>
            </Link>
            <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 bg-toni-green-light text-toni-green-dark-2 rounded-lg font-semibold text-base">
              <Bell size={20} />
              <span>Notifications</span>
            </Link>
            <Link href="/panier" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <ShoppingCart size={20} />
              <span>Mon Panier</span>
            </Link>
            <Link href="/aide" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <HelpCircle size={20} />
              <span>Centre d'aide</span>
            </Link>
            <button className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition w-full text-base">
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </nav>

          {/* Footer Links in Sidebar */}
          <div className="flex flex-col gap-2 text-sm text-toni-green-dark-2 mt-6">
            <Link href="/confidentialite" className="hover:underline">
              Politiques de confidentialité,
            </Link>
            <Link href="/retour" className="hover:underline">
              Conditions générales de retour,
            </Link>
            <Link href="/contact" className="hover:underline">
              Contactez-nous
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <BellOff size={120} className="text-gray-400 mb-8" />
            <div className="text-2xl text-gray-500 text-center">
              Vous n'avez aucune notification
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
