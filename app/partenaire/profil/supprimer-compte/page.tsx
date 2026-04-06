"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function SupprimerComptePage() {
  const router = useRouter();
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
    <div >
        {/* Content area */}
        <main className="flex-1 flex flex-col items-center px-4 md:px-8 pt-6 md:pt-10 pb-10">
          {/* Tabs */}
          
          <div className="mb-8 flex items-center gap-5 sm:gap-8">
            <Link
              href="/partenaire/profil"
              className="pb-2 sm:pb-3 text-sm sm:text-lg sm:text-xl font-bold text-gray-400 hover:text-gray-700 whitespace-nowrap"
            >
              Mes informations
            </Link>
            <Link
              href="/partenaire/profil/supprimer-compte"
              className="relative pb-2 sm:pb-3 text-sm sm:text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap"
            >
              Supprimer mon compte
              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-emerald-600" />
            </Link>
          </div>

          {/* Delete account confirmation */}
          <div className="flex flex-col items-start justify-start flex-1 w-full max-w-[1000px] ml-0 sm:ml-10 md:ml-20 mt-8 md:mt-12">
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
                className="w-full pl-14 pr-4 py-[15px] border-2 border-[#10b981] rounded-xl text-base sm:text-[18px] text-[#374151] placeholder-[#9ca3af] outline-none focus:border-[#10b981] transition-colors"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-[550px]">
              <button
                onClick={handleCancel}
                className="w-full sm:w-auto px-8 py-[14px] rounded-full border-[2px] border-[#10b981] text-[#10b981] font-bold text-base sm:text-[18px] hover:bg-[#ecf9f4] transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto px-8 py-[14px] rounded-full bg-[#ef4444] text-white font-bold text-base sm:text-[18px] hover:bg-[#dc2626] transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </main>
    </div>
  );
}
