"use client";

import { useState } from "react";
import { Home, User, Package, Bell, ShoppingCart, HelpCircle, LogOut, Search } from "lucide-react";
import Link from "next/link";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState<"info" | "delete">("info");
  const [formData, setFormData] = useState({
    nomComplet: "AGOSSOU VALENTINE",
    email: "jonathan@gmail.com",
    telephone: "+229 65456565",
    ville: "Parakou",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <img src="/images/logo.png" alt="Toni360" className="h-10" />
          
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un médicament..."
                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-toni-green-dark-2 text-white p-2 rounded-full">
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-2 border-2 border-toni-green-dark-2 text-toni-green-dark-2 rounded-full font-semibold hover:bg-toni-green-dark-2 hover:text-white transition">
              <Bell size={20} />
              Notifications
            </button>
            <button className="flex items-center gap-2 px-6 py-2 border-2 border-toni-green-dark-2 text-toni-green-dark-2 rounded-full font-semibold hover:bg-toni-green-dark-2 hover:text-white transition">
              <ShoppingCart size={20} />
              Mon Panier
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] p-6">
          <nav className="space-y-2">
            <Link href="/accueil" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <Home size={20} />
              <span>Accueil</span>
            </Link>
            <Link href="/profil" className="flex items-center gap-3 px-4 py-3 bg-toni-green-light text-toni-green-dark-2 rounded-lg font-semibold">
              <User size={20} />
              <span>Mon compte</span>
            </Link>
            <Link href="/commandes" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <Package size={20} />
              <span>Mes commandes</span>
            </Link>
            <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} />
              <span>Notifications</span>
            </Link>
            <Link href="/panier" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <ShoppingCart size={20} />
              <span>Mon Panier</span>
            </Link>
            <Link href="/aide" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <HelpCircle size={20} />
              <span>Centre d&apos;aide</span>
            </Link>
            <button className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition w-full">
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            {/* Tabs */}
            <div className="flex gap-8 border-b border-gray-300 mb-8">
              <button
                onClick={() => setActiveTab("info")}
                className={`pb-4 font-semibold transition ${
                  activeTab === "info"
                    ? "border-b-4 border-toni-green-dark-2 text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Mes informations
              </button>
              <button
                onClick={() => setActiveTab("delete")}
                className={`pb-4 font-semibold transition ${
                  activeTab === "delete"
                    ? "border-b-4 border-toni-green-dark-2 text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Supprimer mon compte
              </button>
            </div>

            {/* Form */}
            {activeTab === "info" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">Nom complet</label>
                    <input
                      type="text"
                      value={formData.nomComplet}
                      onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>

                  {/* Numéro de téléphone */}
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">Numéro de téléphone</label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">Ville</label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-8">
                  <button
                    type="submit"
                    className="px-12 py-3 bg-toni-green-dark-2 text-white font-bold rounded-full hover:bg-toni-green-dark transition"
                  >
                    Enrégistrer
                  </button>
                </div>
              </form>
            )}

            {activeTab === "delete" && (
              <div className="text-center py-12">
                <p className="text-gray-600">Section de suppression de compte</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-8">
        <div className="flex gap-4 text-sm text-toni-green-dark-2">
          <Link href="/confidentialite" className="hover:underline">
            Politiques de confidentialité
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/retour" className="hover:underline">
            Conditions générales de retour
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/contact" className="hover:underline">
            Contactez-nous
          </Link>
        </div>
      </footer>
    </div>
  );
}
