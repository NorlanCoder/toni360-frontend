"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bell,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  User,
  ListOrdered,
} from "lucide-react";

type CartItem = {
  id: number;
  name: string;
  type: string;
  qty: number;
  requiresPrescription?: boolean;
};

export default function ClientCartPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 2, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 3, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 4, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2, requiresPrescription: true },
    { id: 5, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 6, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
  ]);

  const navItems = useMemo(
    () => [
      { label: "Accueil", href: "/client/accueil", icon: Home },
      { label: "Mon compte", href: "/client/profil", icon: User },
      { label: "Mes commandes", href: "/client/dashboard", icon: ListOrdered },
      { label: "Notifications", href: "/client/notifications", icon: Bell },
      { label: "Mon Panier", href: "/client/dashboard/cart", icon: ShoppingCart },
      { label: "Centre d'aide", href: "/client/faq", icon: HelpCircle },
      { label: "Déconnexion", href: "/client/connexion", icon: LogOut },
    ],
    []
  );

  const updateQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const removeAll = () => {
    setItems([]);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-72 flex flex-col justify-between py-8 px-6 border-r-2 border-gray-300 bg-white shrink-0">
        <div>
          {/* Logo */}
          <div className="mb-12 mt-6">
            <img src="/images/logo.png" alt="Toni360" className="h-20" />
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
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
              );
            })}
          </nav>
        </div>

        {/* Footer sidebar */}
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
          {/* Supprimer tout */}
          <div className="mb-6">
            <button
              onClick={removeAll}
              className="text-toni-green-dark-2 text-base font-medium hover:underline"
            >
              Supprimer tout
            </button>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" style={{ maxWidth: "920px" }}>
            {items.map((item) => (
              <div
                key={item.id}
                className="relative border border-gray-200 rounded-2xl p-6 bg-white"
              >
                {item.requiresPrescription && (
                  <FileText
                    size={18}
                    className="absolute right-4 top-4 text-red-500"
                  />
                )}
                <div className="mb-6">
                  <h3 className="text-base font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-400">{item.type}</p>
                </div>

                <div className="flex items-center justify-between">
                  {/* Qty */}
                  <div className="inline-flex items-center rounded-full border border-gray-200 px-2 py-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50"
                      aria-label="Diminuer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-semibold text-gray-800 min-w-[24px] text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-toni-green-dark-2 hover:bg-toni-green-light"
                      aria-label="Augmenter"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Prescription message */}
          <p className="mt-8 text-[#ff6b5c] text-base font-medium">
            Ayez votre ordonnance prête pour les produits soumis à prescription.
          </p>

          {/* Localiser */}
          <div className="mt-6" style={{ maxWidth: "920px" }}>
            <button className="w-2/5 mx-auto py-3 bg-toni-green-dark-2 text-white rounded-full text-lg font-bold hover:bg-toni-green-dark transition">
              Localiser
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
