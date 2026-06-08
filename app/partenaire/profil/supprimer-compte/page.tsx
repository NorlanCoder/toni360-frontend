"use client";

import Link from "next/link";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { getAuthSession, clearAuthSession } from "@/lib/api/session";
import { deletePartnerAccount } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";

export default function SupprimerComptePage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancel = (): void => {
    setPassword("");
    router.push("/partenaire/profil");
  };

  const handleDelete = async (): Promise<void> => {
    if (!password.trim()) {
      toast.error("Veuillez entrer votre mot de passe.");
      return;
    }

    const session = getAuthSession();
    if (!session?.token) {
      toast.error("Session invalide. Veuillez vous reconnecter.");
      router.replace("/partenaire/connexion");
      return;
    }

    setIsDeleting(true);
    try {
      await deletePartnerAccount(session.token, password);
      clearAuthSession();
      toast.success("Votre compte a été supprimé avec succès.");
      router.replace("/partenaire/connexion");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toast.error(err.message ?? "Mot de passe incorrect.");
      } else {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 lg:py-8">
          {/* Tabs */}
          <div className="mb-8 flex items-center justify-center gap-5 sm:gap-8">
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
          <div className="flex flex-col items-center justify-center flex-1 w-full mt-8 md:mt-12">
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
                type={showPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-14 pr-12 py-[15px] border-2 border-[#10b981] rounded-xl text-base sm:text-[18px] text-[#374151] placeholder-[#9ca3af] outline-none focus:border-[#10b981] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-[550px]">
              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="w-full sm:w-auto px-8 py-[14px] rounded-full border-[2px] border-[#10b981] text-[#10b981] font-bold text-base sm:text-[18px] hover:bg-[#ecf9f4] transition-colors cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className="w-full sm:w-auto px-8 py-[14px] rounded-full bg-[#ef4444] text-white font-bold text-base sm:text-[18px] hover:bg-[#dc2626] transition-colors cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </main>
    </div>
  );
}
