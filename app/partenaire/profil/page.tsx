"use client";

import Image from "next/image";
import {
  LayoutGrid,
  Users,
  PlusSquare,
  FileText,
  HelpCircle,
  LogOut,
  Bell,
  User,
  Pencil,
  Link2,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { icon: LayoutGrid, label: "Tableau de bord", active: true },
  { icon: Users, label: "Gestion des employés", active: false },
  { icon: PlusSquare, label: "Gestion des médicaments", active: false },
  { icon: FileText, label: "Historique des actions", active: false },
  { icon: HelpCircle, label: "Assistance et support", active: false },
  { icon: LogOut, label: "Déconnexion", active: false },
];

export default function PartenaireProfil() {
  const [activeTab, setActiveTab] = useState<"info" | "delete">("info");

  return (
    <div className="flex h-screen overflow-hidden bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[248px] min-w-[248px] bg-[#f7f8fa] flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-4">
          <Image src="/images/logo.png" alt="Toni360" width={160} height={53} className="h-[48px] w-auto" />
        </div>

        {/* Link icon */}
        <div className="px-5 pt-2 pb-3">
          <Link2 className="w-[18px] h-[18px] text-[#9ca3af]" strokeWidth={2} />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-[2px] px-3">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                className={`flex items-center gap-3 w-full px-4 py-[13px] rounded-xl text-[15px] font-medium text-left transition-colors ${
                  item.active
                    ? "bg-[#e0f8ef] text-[#10b981]"
                    : "text-[#4b5563] hover:bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-[20px] h-[20px] flex-shrink-0 ${
                    item.active ? "text-[#10b981]" : "text-[#6b7280]"
                  }`}
                  strokeWidth={1.8}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto bg-white">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-0 px-4 md:px-6 pt-4 pb-3">
          {/* Search bar */}
          <div className="flex-1 md:mr-4">
            <input
              type="text"
              placeholder="Rechercher un médicament"
              className="w-full px-5 py-[10px] rounded-full bg-[#ecf9f4] border border-[#b8e4d4] text-[13px] text-[#6b7280] placeholder-[#9ca3af] outline-none focus:border-[#10b981] transition-colors"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Notifications */}
            <button className="flex items-center gap-2 pl-3 md:pl-5 pr-2 py-[6px] rounded-full border-[1.5px] border-[#10b981] text-[#10b981] hover:bg-[#ecf9f4] transition-colors">
              <span className="text-[11px] md:text-[13px] font-semibold">Notifications</span>
              <span className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#10b981]">
                <Bell className="w-[16px] h-[16px] text-white" fill="white" strokeWidth={0} />
              </span>
            </button>

            {/* Mon Compte */}
            <button className="flex items-center gap-2 pl-3 md:pl-5 pr-2 py-[6px] rounded-full border-[1.5px] border-[#10b981] text-[#10b981] hover:bg-[#ecf9f4] transition-colors">
              <span className="text-[11px] md:text-[13px] font-semibold">Mon Compte</span>
              <span className="flex items-center justify-center w-[34px] h-[34px] rounded-full bg-[#10b981]">
                <User className="w-[16px] h-[16px] text-white" fill="white" strokeWidth={1.5} />
              </span>
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 flex flex-col items-center px-4 md:px-8 pt-6 md:pt-10 pb-10">
          {/* Tabs */}
          <div className="flex justify-between items-center mb-8 md:mb-10 w-full max-w-[1000px] mx-auto">
            <button
              onClick={() => setActiveTab("info")}
              className={`relative pb-3 text-[13px] md:text-[15.5px] font-semibold transition-colors ${
                activeTab === "info" ? "text-[#1f2937]" : "text-[#9ca3af]"
              }`}
            >
              Mes informations
              {activeTab === "info" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#10b981]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("delete")}
              className={`relative pb-3 text-[13px] md:text-[15.5px] font-semibold transition-colors ${
                activeTab === "delete" ? "text-[#1f2937]" : "text-[#9ca3af]"
              }`}
            >
              Supprimer mon compte
              {activeTab === "delete" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#10b981]" />
              )}
            </button>
          </div>

          {/* Form */}
          {activeTab === "info" && (
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-12 gap-y-5 md:gap-y-7 max-w-[1000px] mx-auto">
                {/* Nom de la pharmacie */}
                <div>
                  <label className="block text-[12.5px] text-[#9ca3af] mb-[6px]">
                    Nom de la pharmacie
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="Pharmaciee Zongo"
                      className="w-full pl-4 pr-10 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[13.5px] text-[#374151] outline-none focus:border-[#10b981]"
                    />
                    <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#9ca3af]" strokeWidth={1.8} />
                  </div>
                </div>

                {/* Adressse */}
                <div>
                  <label className="block text-[12.5px] text-[#9ca3af] mb-[6px]">
                    Adressse
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="123 von à gauche"
                      className="w-full pl-4 pr-10 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[13.5px] text-[#374151] outline-none focus:border-[#10b981]"
                    />
                    <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#9ca3af]" strokeWidth={1.8} />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-[12.5px] text-[#9ca3af] mb-[6px]">
                    Téléphone
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="+229 00 00 00 00"
                      className="w-full pl-4 pr-10 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[13.5px] text-[#374151] outline-none focus:border-[#10b981]"
                    />
                    <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#9ca3af]" strokeWidth={1.8} />
                  </div>
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-[12.5px] text-[#9ca3af] mb-[6px]">
                    E-mail
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      defaultValue="contaact@gmail..com"
                      className="w-full pl-4 pr-10 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[13.5px] text-[#374151] outline-none focus:border-[#10b981]"
                    />
                    <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#9ca3af]" strokeWidth={1.8} />
                  </div>
                </div>

                {/* Licence */}
                <div>
                  <label className="block text-[12.5px] text-[#9ca3af] mb-[6px]">
                    Licence
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="125458866"
                      className="w-full pl-4 pr-10 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[13.5px] text-[#374151] outline-none focus:border-[#10b981]"
                    />
                    <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#9ca3af]" strokeWidth={1.8} />
                  </div>
                </div>

                {/* Horaires d'ouvertures */}
                <div>
                  <label className="block text-[12.5px] text-[#9ca3af] mb-[6px]">
                    Horaires d&apos;ouvertures
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="Lundi - Vendredi 8h00 -18h00"
                      className="w-full pl-4 pr-10 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[13.5px] text-[#374151] outline-none focus:border-[#10b981]"
                    />
                    <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#9ca3af]" strokeWidth={1.8} />
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="mt-8 md:mt-12 max-w-[1000px] w-full mx-auto">
                <button className="w-full py-[12px] md:py-[14px] bg-[#10b981] hover:bg-[#0ea572] text-white font-semibold text-[13px] md:text-[14.5px] rounded-full transition-colors cursor-pointer">
                  Enrégistrer les modifications
                </button>
              </div>
            </div>
          )}

          {activeTab === "delete" && (
            <div className="text-[#6b7280] text-sm">
              Section de suppression de compte.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
