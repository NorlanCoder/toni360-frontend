"use client";

import { Home, User, Package, Bell, ShoppingCart, HelpCircle, LogOut } from "lucide-react";
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
      {/* ...existing code... */}
    </div>
  );
}
