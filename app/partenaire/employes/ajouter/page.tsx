"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ConfirmationModal";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { createPartnerUser, getPartnerRoles, PartnerRole } from "@/lib/api/partner";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const ASSIGNABLE_ROLE_CODES = [
  "GESTIONNAIRE_OPERATIONNEL",
  "RESPONSABLE_STOCKS",
  "RESPONSABLE_COMMANDES",
] as const;

const roleLabelsByCode: Record<(typeof ASSIGNABLE_ROLE_CODES)[number], string> = {
  GESTIONNAIRE_OPERATIONNEL: "Gestionnaire Opérationnel",
  RESPONSABLE_STOCKS: "Responsable des Stocks",
  RESPONSABLE_COMMANDES: "Responsable des Commandes",
};

function getRoleDisplayLabel(roleItem: PartnerRole): string {
  if (roleItem.code in roleLabelsByCode) {
    return roleLabelsByCode[roleItem.code as keyof typeof roleLabelsByCode];
  }

  return roleItem.libelle;
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireAjouterEmployePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<PartnerRole[]>([]);

  /* ── Form state ── */
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState<string | undefined>(undefined);
  const [role, setRole] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  useEffect(() => {
    const loadRoles = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        toast.error("Session partenaire invalide.");
        return;
      }

      try {
        const response = await getPartnerRoles(session.token);
        const roleMap = new Map(response.data.roles.map((item) => [item.code, item]));
        const availableRoles = ASSIGNABLE_ROLE_CODES
          .map((code) => roleMap.get(code))
          .filter((item): item is PartnerRole => Boolean(item));

        setRoles(availableRoles);
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger les rôles.");
      }
    };

    void loadRoles();
  }, []);

  /* ── Auto-close modal after 3 s ── */
  useEffect(() => {
    if (!showModal) return;
    const timer = setTimeout(() => {
      setShowModal(false);
      router.push("/partenaire/employes");
    }, 3000);
    return () => clearTimeout(timer);
  }, [showModal, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      toast.error("Session partenaire invalide.");
      return;
    }

    const [nomPart, ...prenomParts] = nom.trim().split(" ");
    const prenomPart = prenomParts.join(" ") || nomPart;
    const numero = (telephone ?? "").trim();

    if (!nomPart || !prenomPart || !email || !numero || !role || motDePasse.length < 8) {
      toast.warning("Veuillez remplir correctement tous les champs.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPartnerUser(session.token, {
        nom: nomPart,
        prenom: prenomPart,
        email,
        telephone: numero,
        password: motDePasse,
        password_confirmation: motDePasse,
        role_id: role,
      });

      setShowModal(true);
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la création de l'employé.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-2 sm:px-6 lg:px-32 py-4 sm:py-8 lg:py-16">
          <form
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-[920px] rounded-xl bg-white p-4 sm:p-8"
          >
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-base font-medium text-gray-600">
                  Nom complet
                </label>
                <input
                  type="text"
                  placeholder="AGOSSOU"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-base font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="jonathan@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-base font-medium text-gray-600">
                  Téléphone
                </label>
                <div className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus-within:border-emerald-500 focus-within:outline-none focus-within:ring-1 focus-within:ring-emerald-500">
                  <PhoneInput
                    international
                    defaultCountry="BJ"
                    placeholder="Numéro de téléphone"
                    value={telephone}
                    onChange={setTelephone}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-base font-medium text-gray-600">
                  Rôle
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Sélectionnez un rôle</option>
                  {roles.map((item) => (
                    <option key={item.id} value={item.id}>{getRoleDisplayLabel(item)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3 — password (half-width on desktop) */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-base font-medium text-gray-600">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="***************"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 pr-10 text-base text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 sm:mt-10 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-full bg-emerald-700 px-4 sm:px-10 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white transition-colors hover:bg-emerald-800"
              >
                {isSubmitting ? "Ajout en cours..." : "Ajouter cet employé"}
              </button>
            </div>
          </form>
        </main>

      {/* ───────────── CONFIRMATION MODAL ───────────── */}
      <ConfirmationModal
        show={showModal}
        message={"Employé ajouté\navec succès."}
        iconPath="/images/checkmark.svg"
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}


