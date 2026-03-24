"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, User, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSidebarContext } from "@/app/partenaire/_sidebar-context";

export default function SupprimerComptePage() {
  const router = useRouter();
  useSidebarContext();
  const [password, setPassword] = useState<string>("");

  const handleCancel = (): void => {
    setPassword("");
    router.push("/partenaire/profil");
  };

  const handleDelete = (): void => {
    if (!password.trim()) return;
    // TODO: call API to delete account
    console.log("Account deletion requested");
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <header className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-0 px-4 md:px-6 pt-4 pb-3">
          {/* Search bar */}
          <div className="flex-1 flex justify-center md:mr-4">
            <input
              type="text"
              placeholder="Rechercher un médicament"
              autoComplete="off"
              className="w-full max-w-[700px] px-5 py-[17px] rounded-full bg-[#ecf9f4] border border-[#b8e4d4] text-[17px] text-[#6b7280] placeholder-[#9ca3af] outline-none focus:border-[#10b981] transition-colors"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <Link href="/partenaire/notifications" className="flex items-center gap-3 pl-4 md:pl-6 pr-3 py-[10px] rounded-full border-[2px] border-[#10b981] text-[#10b981] hover:bg-[#ecf9f4] transition-colors">
              <span className="text-[15px] md:text-[18px] font-bold">Notifications</span>
              <span className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-[#10b981]">
                <Bell
                  className="w-[22px] h-[22px] text-white"
                  fill="white"
                  strokeWidth={0}
                />
              </span>
            </Link>

            {/* Mon Compte */}
            <Link href="/partenaire/profil" className="flex items-center gap-3 pl-4 md:pl-6 pr-3 py-[10px] rounded-full border-[2px] border-[#10b981] text-[#10b981] hover:bg-[#ecf9f4] transition-colors">
              <span className="text-[15px] md:text-[18px] font-bold">Mon Compte</span>
              <span className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-[#10b981]">
                <User
                  className="w-[22px] h-[22px] text-white"
                  fill="white"
                  strokeWidth={2}
                />
              </span>
            </Link>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 flex flex-col items-center px-4 md:px-8 pt-6 md:pt-10 pb-10">
          {/* Tabs */}
          <div className="flex justify-start items-center gap-30 mb-8 md:mb-10 w-full max-w-[1000px]">
            <Link
              href="/partenaire/profil"
              className="relative pb-3 text-[18px] md:text-[21px] font-bold transition-colors text-[#9ca3af] hover:text-[#1f2937]"
            >
              Mes informations
            </Link>
            <Link
              href="/partenaire/profil/supprimer-compte"
              className="relative pb-3 text-[18px] md:text-[21px] font-bold transition-colors text-[#1f2937]"
            >
              Supprimer mon compte
              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[#10b981]" />
            </Link>
          </div>

          {/* Delete account confirmation */}
          <div className="flex flex-col items-start justify-start flex-1 w-full max-w-[1000px] ml-20 mt-12">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-[36px] font-semibold text-[#1f2937] text-center leading-snug mb-8 md:mb-10 w-full max-w-[550px]">
              Êtes-vous sûr de vouloir
              <br />
              supprimer votre compte ?
            </h1>

            {/* Password input */}
            <div className="relative w-full max-w-[550px] mb-8">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9ca3af]" />
              <input
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-4 py-[15px] border-2 border-[#10b981] rounded-xl text-[18px] text-[#374151] placeholder-[#9ca3af] outline-none focus:border-[#10b981] transition-colors"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-5 w-full max-w-[550px]">
              <button
                onClick={handleCancel}
                className="px-10 py-[14px] rounded-full border-[2px] border-[#10b981] text-[#10b981] font-bold text-[18px] hover:bg-[#ecf9f4] transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-10 py-[14px] rounded-full bg-[#ef4444] text-white font-bold text-[18px] hover:bg-[#dc2626] transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </main>
    </div>
  );
}
