"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CartItem {
  id: number;
  name: string;
  type: string;
  qty: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 2, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 3, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 4, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 5, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 6, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
  ]);

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

  const sidebarLinks = [
    { label: "Accueil", href: "/", icon: HomeIcon },
    { label: "Mon compte", href: "/profil", icon: UserIcon },
    { label: "Mes commandes", href: "/dashboard", icon: OrdersIcon },
    { label: "Notifications", href: "/notifications", icon: BellSideIcon },
    { label: "Mon Panier", href: "/dashboard/cart", icon: CartSideIcon },
    { label: "Centre d'aide", href: "/faq", icon: HelpIcon },
    { label: "Déconnexion", href: "/connexion", icon: LogoutIcon },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-[220px] min-h-screen border-r border-gray-100 flex flex-col py-6 px-4 fixed left-0 top-0 bottom-0 bg-white z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 px-2">
          <Image src="/images/logo.png" alt="Toni360" width={150} height={50} />
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-3 flex-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-lg font-medium transition-colors ${
                link.href === "/dashboard/cart"
                  ? "text-[#0fa37f] bg-green-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <link.icon active={link.href === "/dashboard/cart"} />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="mt-auto pt-6 px-2 flex flex-col gap-1">
          <Link href="/privacy" className="text-lg text-[#0fa37f] hover:underline">
            Politiques de confidentialité,
          </Link>
          <Link href="/return-policy" className="text-lg text-[#0fa37f] hover:underline">
            Conditions générales de retour,
          </Link>
          <Link href="/contact" className="text-lg text-[#0fa37f] hover:underline">
            Contactez-nous
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[220px] flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-4 px-8 py-4">
          {/* Search bar */}
          <div className="flex-1 max-w-[560px] relative">
            <input
              type="text"
              placeholder="Rechercher un médicament..."
              className="w-full h-[56px] px-7 bg-[#e8f5f1] border-0 rounded-full text-lg text-gray-700 placeholder-gray-400 outline-none transition-colors pr-[68px]"
            />
            <div className="absolute right-[10px] top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-90 transition-opacity">
              <Image src="/search.svg" alt="Search" width={37} height={37} />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/notifications"
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#0fa37f] text-[#0fa37f] rounded-full text-xl font-bold hover:bg-green-50 transition-colors"
            >
              <BellHeaderIcon />
              Notifications
            </Link>
            <Link
              href="/dashboard/cart"
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#0fa37f] text-[#0fa37f] rounded-full text-xl font-bold hover:bg-green-50 transition-colors"
            >
              <CartHeaderIcon />
              Mon Panier
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="px-12 pb-16 flex-1">
          {/* Supprimer tout */}
          <div className="mb-6 p-4">
            <button
              onClick={removeAll}
              className="text-[#0fa37f] text-lg font-medium hover:underline transition-colors"
            >
              Supprimer tout
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-3 gap-5 mb-8 p-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-xl p-7 flex flex-col gap-4"
              >
                <div className="pb-2">
                  <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                  <p className="text-base text-gray-400">{item.type}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  {/* Quantity controller */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden px-2 py-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-lg font-medium transition-colors"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-lg font-semibold text-gray-800 min-w-[28px] text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="px-3 py-1.5 text-[#0fa37f] hover:bg-green-50 text-lg font-medium transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Prescription message */}
          <p className="text-red-500 text-lg mb-6 italic font-semibold p-4">
            Ayez votre ordonnance prête pour les produits soumis à prescription.
          </p>

          {/* Localiser button */}
          <button className="w-full py-5 bg-[#0fa37f] text-white rounded-full text-2xl font-bold hover:bg-[#0e9272] transition-colors mt-2 px-4">
            Localiser
          </button>
        </div>
      </main>
    </div>
  );
}

/* ─── SVG Icon Components ─── */

function HomeIcon({ active }: { active?: boolean }) {
  const color = active ? "#0fa37f" : "#6b7280";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function UserIcon({ active }: { active?: boolean }) {
  const color = active ? "#0fa37f" : "#6b7280";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function OrdersIcon({ active }: { active?: boolean }) {
  const color = active ? "#0fa37f" : "#6b7280";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function BellSideIcon({ active }: { active?: boolean }) {
  const color = active ? "#0fa37f" : "#6b7280";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CartSideIcon({ active }: { active?: boolean }) {
  const color = active ? "#0fa37f" : "#6b7280";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function HelpIcon({ active }: { active?: boolean }) {
  const color = active ? "#0fa37f" : "#6b7280";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function LogoutIcon({ active }: { active?: boolean }) {
  const color = active ? "#0fa37f" : "#6b7280";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function BellHeaderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CartHeaderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
