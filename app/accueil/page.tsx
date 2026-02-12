"use client";

import { useState } from "react";
import { Bell, ShoppingCart, Search } from "lucide-react";

export default function AccueilPage() {
  const [userName, setUserName] = useState("Vagelas");

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
    </div>
  );
}
