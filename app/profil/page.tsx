"use client";

import { useState } from "react";
import { Home, User, Package, Bell, ShoppingCart, HelpCircle, LogOut, Search, Lock } from "lucide-react";
import Link from "next/link";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState<"info" | "delete">("info");
  const [formData, setFormData] = useState({
    nomComplet: "",
    email: "",
    telephone: "",
    ville: "",
  });
  const [deletePassword, setDeletePassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Delete account with password:", deletePassword);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <img src="/images/logo.png" alt="Toni360" className="h-14" />
          
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
            <Link href="/profil" className="flex items-center gap-3 px-4 py-3 bg-toni-green-light text-toni-green-dark-2 rounded-lg font-semibold text-base">
              <User size={20} />
              <span>Mon compte</span>
            </Link>
            <Link href="/commandes" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <Package size={20} />
              <span>Mes commandes</span>
            </Link>
            <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <Bell size={20} />
              <span>Notifications</span>
            </Link>
            <Link href="/panier" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <ShoppingCart size={20} />
              <span>Mon Panier</span>
            </Link>
            <Link href="/aide" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <HelpCircle size={20} />
              <span>Centre d&apos;aide</span>
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
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            {/* Tabs */}
            <div className="flex gap-20 border-b border-gray-300 mb-8">
              <button
                onClick={() => setActiveTab("info")}
                className={`pb-4 font-semibold text-lg transition ${
                  activeTab === "info"
                    ? "border-b-4 border-toni-green-dark-2 text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Mes informations
              </button>
              <button
                onClick={() => setActiveTab("delete")}
                className={`pb-4 font-semibold text-lg transition ${
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
                    <label className="block text-base text-gray-500 mb-2">Nom complet</label>
                    <input
                      type="text"
                      value={formData.nomComplet}
                      onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-base text-gray-500 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>

                  {/* Numéro de téléphone */}
                  <div>
                    <label className="block text-base text-gray-500 mb-2">Numéro de téléphone</label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-base text-gray-500 mb-2">Ville</label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className="px-12 py-3 bg-toni-green-dark-2 text-white font-bold text-lg rounded-full hover:bg-toni-green-dark transition"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            )}

            {activeTab === "delete" && (
              <div className="max-w-xl mx-auto">
                <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
                  Êtes-vous sûr de vouloir supprimer votre compte ?
                </h3>

                <form onSubmit={handleDeleteAccount} className="space-y-8">
                  {/* Password Input */}
                  <div className="relative max-w-md mx-auto flex items-center">
                    <Lock className="absolute left-4 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="Entrez votre mot de passe"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-400 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab("info")}
                      className="px-12 py-3 border-2 border-toni-green-dark-2 text-toni-green-dark-2 font-bold text-lg rounded-full hover:bg-toni-green-dark-2 hover:text-white transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-12 py-3 bg-red-600 text-white font-bold text-lg rounded-full hover:bg-red-700 transition"
                    >
                      Supprimer
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
