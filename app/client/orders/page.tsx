"use client";

import { useState } from "react";
import { CheckCircle2, Clock, MapPin, Plus, Trash2 } from "lucide-react";

const orders = [
  {
    id: "233U4YT4UII4",
    date: "12 - 12 - 2024",
    time: "15h: 23",
    status: "Terminée",
    pharmacy: "Pharmacie Zongo",
  },
  {
    id: "233U4YT4UII4",
    date: "12 - 12 - 2024",
    time: "15h: 23",
    status: "Terminée",
    pharmacy: "Pharmacie Zongo",
  },
  {
    id: "233U4YT4UII4",
    date: "12 - 12 - 2024",
    time: "15h: 23",
    status: "Terminée",
    pharmacy: "Pharmacie Zongo",
  },
  {
    id: "233U4YT4UII4",
    date: "12 - 12 - 2024",
    time: "15h: 23",
    status: "Terminée",
    pharmacy: "Pharmacie Zongo",
  },
];

export default function ClientOrdersPage() {
  const [activeTab, setActiveTab] = useState<"Terminees" | "En attente" | "Recuperees">(
    "Terminees"
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl rounded-3xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes commandes</h1>

      {/* Summary + Orders section */}
      <div className="rounded-3xl p-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 transition hover:shadow-sm hover:border-[#008F4F] hover:bg-[#d8f5ea]">
          <div className="w-11 h-11 rounded-full bg-[#e8faf3] flex items-center justify-center">
            <CheckCircle2 className="text-[#008F4F]" size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commandes terminées</p>
            <p className="text-xl font-bold text-gray-900">200</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 transition hover:shadow-sm hover:border-[#008F4F] hover:bg-[#d8f5ea]">
          <div className="w-11 h-11 rounded-full bg-[#fff3e8] flex items-center justify-center">
            <Clock className="text-[#f97316]" size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commandes en attentes</p>
            <p className="text-xl font-bold text-gray-900">50</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 transition hover:shadow-sm hover:border-[#008F4F] hover:bg-[#d8f5ea]">
          <div className="w-11 h-11 rounded-full bg-[#e8faf3] flex items-center justify-center">
            <MapPin className="text-[#008F4F]" size={18} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commandes récupérées</p>
            <p className="text-xl font-bold text-gray-900">80</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[#008F4F] font-semibold hover:bg-[#d8f5ea] transition">
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 mb-10 text-base text-gray-600">
        <div className="flex items-center gap-2">
          <span>Du</span>
          <div className="flex items-center gap-2">
            <select className="w-16 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>JJ</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={`du-j-${i + 1}`} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select className="w-16 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>MM</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={`du-m-${i + 1}`} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select className="w-24 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>AAAA</option>
              {[2024, 2025, 2026].map((year) => (
                <option key={`du-y-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>Au</span>
          <div className="flex items-center gap-2">
            <select className="w-16 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>JJ</option>
              {Array.from({ length: 31 }, (_, i) => (
                <option key={`au-j-${i + 1}`} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select className="w-16 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>MM</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={`au-m-${i + 1}`} value={i + 1}>
                  {String(i + 1).padStart(2, "0")}
                </option>
              ))}
            </select>
            <select className="w-24 px-3 py-2 pr-6 rounded-full border border-gray-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 bg-white">
              <option>AAAA</option>
              {[2024, 2025, 2026].map((year) => (
                <option key={`au-y-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-20 mb-8 text-lg font-semibold text-gray-600">
        {[
          { label: "Terminées", value: "Terminees" as const, icon: CheckCircle2 },
          { label: "En attente", value: "En attente" as const, icon: Clock },
          { label: "Récupérées", value: "Recuperees" as const, icon: MapPin },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.value
                ? "border-[#008F4F] text-[#008F4F]"
                : "border-transparent hover:text-gray-900"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="bg-[#e8faf3] border-2 border-gray-300 rounded-2xl overflow-hidden">
        <div className="max-h-[420px] overflow-y-auto">
          {orders.map((order, index) => (
            <div
              key={`${order.id}-${index}`}
              className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-300 last:border-b-0"
            >
              <div>
                <p className="text-base font-bold text-gray-900">
                  Commande NO {order.id}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Votre commande a été localisée à la {order.pharmacy}.
                </p>
                <div className="text-sm text-gray-400 mt-2">
                  {order.date} &nbsp; {order.time}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {activeTab === "En attente" ? (
                  <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-600 text-sm font-semibold">
                    En attente
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full bg-[#dff1ea] text-[#1f8a5b] text-sm font-semibold">
                    {activeTab === "Recuperees" ? "Récupérée" : "Terminée"}
                  </span>
                )}
                <button className="text-red-500 hover:text-red-600 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
