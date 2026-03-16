"use client";

import { useState } from "react";
import {
  FileText,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

type CartItem = {
  id: number;
  name: string;
  type: string;
  qty: number;
  requiresPrescription?: boolean;
};

export default function ClientCartPage() {
  const [items, setItems] = useState<CartItem[]>([
    { id: 1, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 2, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 3, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2 },
    { id: 4, name: "Ibuprofen 400 mg", type: "Plaquette", qty: 2, requiresPrescription: true },
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

  return (
    <>
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
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ maxWidth: "920px" }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="relative border border-gray-200 rounded-2xl p-6 bg-white"
          >
            {item.requiresPrescription && (
              <FileText size={18} className="absolute right-4 top-4 text-red-500" />
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
    </>
  );
}
