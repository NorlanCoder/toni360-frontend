"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CartItem {
  id: number;
  name: string;
  type: string;
  qty: number;
  price: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: "Paracetamol 500 mg", type: "Plaquette", qty: 2, price: 1000 },
    { id: 2, name: "Tramadol 500 mg", type: "Plaquette", qty: 2, price: 1000 },
    { id: 3, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2, price: 800 },
    { id: 4, name: "Aspirin 300 mg", type: "Plaquette", qty: 2, price: 600 },
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

  const formatPrice = (value: number) =>
    value.toLocaleString("fr-FR").replace(/,/g, " ");

  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

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
          <Image src="/images/logo.png" alt="Toni360" width={140} height={48} />
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-lg font-medium transition-colors ${
                link.label === "Mes commandes"
                  ? "py-2"
                  : "py-3"
              } ${
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
          <Link href="/privacy" className="text-base text-[#0fa37f] hover:underline">
            Politiques de confidentialité,
          </Link>
          <Link href="/return-policy" className="text-base text-[#0fa37f] hover:underline">
            Conditions générales de retour,
          </Link>
          <Link href="/contact" className="text-base text-[#0fa37f] hover:underline">
            Contactez-nous
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[220px] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-end gap-4 px-8 py-4">
          <Link
            href="/notifications"
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#0fa37f] text-[#0fa37f] rounded-full text-lg font-semibold hover:bg-green-50 transition-colors"
          >
            <BellHeaderIcon />
            Notifications
          </Link>
          <Link
            href="/dashboard/cart"
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#0fa37f] text-[#0fa37f] rounded-full text-lg font-semibold hover:bg-green-50 transition-colors"
          >
            <CartHeaderIcon />
            Mon Panier
          </Link>
        </header>

        {/* Content */}
        <div className="px-8 pb-10 flex-1">
          {/* Pharmacy Card */}
          <div className="rounded-2xl overflow-hidden mb-8"
            style={{
              background: "linear-gradient(135deg, #137551 0%, #0fa37f 50%, #11ca8c 100%)",
            }}
          >
            <div className="flex items-center justify-between px-8 py-6 gap-8">
              {/* Bloc infos pharmacie */}
              <div className="text-white flex-1 min-w-[200px]">
                <h2 className="text-3xl font-bold mb-1">Pharmacie</h2>
                <h2 className="text-3xl font-bold mb-2">Hubert Maga</h2>
                <p className="text-sm text-white/80 max-w-[280px] leading-relaxed">
                  Sittué à 200m da la von du quartier de la zone résidentielle du pays
                </p>
              </div>
              {/* Email & téléphone au centre */}
              <div className="flex flex-col items-center flex-1 min-w-[180px]">
                <p className="text-white text-xl font-semibold">Hubertmaga@gmail.com</p>
                <p className="text-white text-xl font-semibold mt-1">+229 65 65 65 65</p>
              </div>
              {/* Bouton itinéraire */}
              <div className="flex flex-col items-end flex-1 min-w-[180px]">
                <button className="flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-full text-xl font-bold hover:shadow-md transition-shadow">
                  <LocationIcon />
                  Itinéraire
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-4 py-3 text-lg text-gray-400 border-b border-gray-100 font-semibold">
              <span>Nom du produit</span>
              <span className="text-center">Qte</span>
              <span className="text-center">Prix</span>
              <span className="text-center">Total</span>
              <span className="w-10"></span>
            </div>

            {/* Table Rows */}
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-4 py-5 border-b border-gray-50 text-lg"
              >
                {/* Product Name */}
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.type}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 text-lg font-medium transition-colors"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 font-semibold text-gray-800 min-w-[28px] text-center bg-gray-50">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="px-3 py-1.5 text-[#0fa37f] hover:bg-green-50 text-lg font-medium transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price */}
                <p className="text-gray-600 text-center">
                  {formatPrice(item.price)} XOF CFA
                </p>

                {/* Total */}
                <p className="font-semibold text-gray-800 text-center">
                  {formatPrice(item.qty * item.price)} XOF CFA
                </p>

                {/* Delete */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-10 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          {/* Total Bar */}
          <div className="flex items-center justify-between bg-[#e8faf3] rounded-xl px-8 py-5 mt-6">
            <h3 className="text-xl font-bold text-gray-800">Montant total</h3>
            <p className="text-xl font-bold text-gray-800">
              {formatPrice(total)} XOF CFA
            </p>
          </div>

          {/* Add Prescription */}
          <div className="flex items-center gap-3 mt-6 px-4">
            <button className="flex items-center gap-3 text-lg text-gray-700 font-medium hover:text-[#0fa37f] transition-colors">
              <span className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#e8faf3] text-[#0fa37f]">
                <Image src="/fluent.svg" alt="Plus" width={28} height={28} />
              </span>
              Ajouter une ordonnance
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-6 mt-10 w-full">
            <button className="flex-1 mx-2 px-10 py-4 border-2 border-[#0fa37f] text-[#0fa37f] rounded-full text-xl font-semibold hover:bg-green-50 transition-colors">
              Terminer
            </button>
            <button className="flex-1 mx-2 px-10 py-4 bg-gray-200 text-gray-600 rounded-full text-xl font-semibold hover:bg-gray-300 transition-colors">
              Mettre en attente
            </button>
            <button className="flex-1 mx-2 px-10 py-4 bg-[#0fa37f] text-white rounded-full text-xl font-semibold hover:bg-[#0e9272] transition-colors">
              Valider la commande
            </button>
          </div>
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

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0fa37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
