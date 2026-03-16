"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, Upload } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  type: string;
  qty: number;
  price: number;
}

export default function CartPage() {
  const searchParams = useSearchParams();
  const pharmacyName = searchParams.get("pharmacy") || "Pharmacie";

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

  return (
    <div className="px-6 pb-8 flex-1">
          {/* Pharmacy Card */}
          <div className="rounded-xl overflow-hidden mb-5 max-w-4xl"
            style={{
              background: "linear-gradient(135deg, #137551 0%, #0fa37f 50%, #11ca8c 100%)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-3">
              <div className="text-white">
                <h2 className="text-lg font-bold mb-1">Pharmacie</h2>
                <h2 className="text-xl font-bold mb-1">{pharmacyName}</h2>
                <p className="text-xs text-white/80 max-w-[200px] leading-relaxed">
                  Sittué à 200m da la von du quartier de la zone résidentielle du pays
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-white text-sm text-center">
                  <p className="text-sm">Hubertmaga@gmail.com</p>
                  <p className="mt-1 text-sm">+229 65 65 65 65</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button className="flex items-center gap-2 bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold mt-1 hover:shadow-md transition-shadow">
                  <LocationIcon />
                  Itinéraire
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="w-full max-w-4xl">
            {/* Table Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-3 py-2 text-xs text-gray-400 border-b border-gray-100 font-medium">
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
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-3 py-3 border-b border-gray-50 text-sm"
              >
                {/* Product Name */}
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.type}</p>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="px-2 py-1.5 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      −
                    </button>
                    <span className="px-2 py-1.5 text-sm font-semibold text-gray-800 min-w-[28px] text-center bg-gray-50">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="px-2 py-1.5 text-[#0fa37f] hover:bg-green-50 text-sm font-medium transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price */}
                <p className="text-sm text-gray-600 text-center">
                  {formatPrice(item.price)} XOF CFA
                </p>

                {/* Total */}
                <p className="text-sm font-semibold text-gray-800 text-center">
                  {formatPrice(item.qty * item.price)} XOF CFA
                </p>

                {/* Delete */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-8 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          {/* Total Bar */}
          <div className="flex items-center justify-between bg-[#e8faf3] rounded-xl px-8 py-5 mt-6 max-w-4xl">
            <h3 className="text-xl font-bold text-gray-800">Montant total</h3>
            <p className="text-xl font-bold text-gray-800">
              {formatPrice(total)} XOF CFA
            </p>
          </div>

          {/* Add Prescription */}
          <div className="flex flex-col gap-3 mt-6 px-4">
            <p className="text-sm font-semibold text-gray-700">Ajouter une ordonnance</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#e8faf3] text-[#0fa37f] hover:bg-[#d9f5ea] transition-colors"
                aria-label="Prendre une photo"
              >
                <Camera size={20} />
              </button>
              <label
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#e8faf3] text-[#0fa37f] hover:bg-[#d9f5ea] transition-colors cursor-pointer"
                aria-label="Importer un fichier"
              >
                <Upload size={20} />
                <input type="file" accept="image/*,.pdf" className="hidden" />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-start gap-3 mt-10 w-full px-4">
            <button className="px-10 py-3 border-2 border-red-500 text-red-600 rounded-full text-lg font-semibold hover:bg-red-50 transition-colors min-w-[180px]">
              Annuler
            </button>
            <button className="px-10 py-3 bg-gray-200 text-gray-600 rounded-full text-lg font-semibold hover:bg-gray-300 transition-colors min-w-[180px]">
              Mettre en attente
            </button>
            <button className="px-10 py-3 bg-[#0fa37f] text-white rounded-full text-lg font-semibold hover:bg-[#0e9272] transition-colors min-w-[200px]">
              Valider la commande
            </button>
          </div>
    </div>
  );
}

/* ─── SVG Icon Components ─── */

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

