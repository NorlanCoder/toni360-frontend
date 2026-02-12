"use client";

import { useState } from "react";
import { Bell, ShoppingCart, Search, Home, User, Package, HelpCircle, LogOut } from "lucide-react";

export default function AccueilPage() {
  const [userName, setUserName] = useState("Vagelas");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="w-64"></div>
          
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="w-full pl-4 pr-14 py-3 bg-gray-100 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
              />
              <button className="absolute right-1 bg-toni-green-dark-2 text-white w-10 h-10 rounded-full flex items-center justify-center">
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mr-8">
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
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] flex flex-col justify-between">
          <div>
            <div className="px-6 py-6">
              <img src="/images/logo.png" alt="Toni360" className="h-20" />
            </div>
            <nav>
            <a
              href="/accueil"
              className="flex items-center gap-3 px-6 py-3 bg-toni-green-light text-toni-green-dark-2 font-semibold"
            >
              <Home size={20} />
              Accueil
            </a>
            <a
              href="/profil"
              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              <User size={20} />
              Mon compte
            </a>
            <a
              href="/commandes"
              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              <Package size={20} />
              Mes commandes
            </a>
            <a
              href="/notifications"
              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              <Bell size={20} />
              Notifications
            </a>
            <a
              href="/panier"
              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              <ShoppingCart size={20} />
              Mon Panier
            </a>
            <a
              href="/aide"
              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              <HelpCircle size={20} />
              Centre d&apos;aide
            </a>
            <a
              href="/connexion"
              className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={20} />
              Déconnexion
            </a>
          </nav>
          </div>

          <div className="border-t border-gray-200 py-4 px-6 text-sm text-toni-green">
            <a href="/confidentialite" className="block py-2 hover:text-toni-green-dark-2">
              Politiques de confidentialité,
            </a>
            <a href="/retour" className="block py-2 hover:text-toni-green-dark-2">
              Conditions générales de retour,
            </a>
            <a href="/contact" className="block py-2 hover:text-toni-green-dark-2">
              Contactez-nous
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 px-16">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">
            Bienvenue, Mr {userName}
          </h1>

          {/* Hero Section */}
          <div
            className="relative h-[550px] max-w-4xl rounded-2xl overflow-hidden shadow-sm"
            style={{
              backgroundImage: "url('/images/ph7.png')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-toni-green-dark-2 to-transparent flex items-end pb-16">
              <h2 className="text-white text-5xl font-bold px-12">
                Trouvez facilement votre médicament.
              </h2>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
