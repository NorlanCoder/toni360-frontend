"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ConfirmationModal";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { createPartnerUser, getPartnerRoles, PartnerRole } from "@/lib/api/partner";
import { getPasswordRuleResults, getPasswordStrength, isPasswordStrong } from "@/lib/passwordPolicy";
import { toast } from "sonner";
import { Check, ChevronDown, Eye, EyeOff, X } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

/* ── Field-error helpers ── */
type FieldErrors = Partial<Record<"nom" | "email" | "telephone" | "role" | "motDePasse", string>>;

const EMAIL_RE = /^[^\s@]+@[^^\s@]+\.[^\s@]+$/;

function validateFields(
  nom: string,
  email: string,
  telephone: string | undefined,
  role: string,
  motDePasse: string,
  passwordStrong: boolean,
): FieldErrors {
  const errors: FieldErrors = {};
  const parts = nom.trim().split(/\s+/).filter(Boolean);
  if (!nom.trim()) {
    errors.nom = "Le nom complet est obligatoire.";
  } else if (parts.length < 2) {
    errors.nom = "Veuillez saisir le nom ET le prénom (ex : AGOSSOU Jonathan).";
  }
  if (!email.trim()) {
    errors.email = "L'adresse e-mail est obligatoire.";
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = "Format d'e-mail invalide (ex : jean@exemple.com).";
  }
  const num = (telephone ?? "").trim();
  if (!num) {
    errors.telephone = "Le numéro de téléphone est obligatoire.";
  } else if ((num.replace(/\D/g, "").length) < 10) {
    errors.telephone = "Le numéro de téléphone doit contenir au moins 10 chiffres.";
  }
  if (!role) {
    errors.role = "Veuillez sélectionner un rôle.";
  }
  if (!motDePasse) {
    errors.motDePasse = "Le mot de passe est obligatoire.";
  } else if (!passwordStrong) {
    errors.motDePasse = "Le mot de passe ne respecte pas les critères de sécurité ci-dessous.";
  }
  return errors;
}

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
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [roles, setRoles] = useState<PartnerRole[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  /* ── Form state ── */
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState<string | undefined>(undefined);
  const [role, setRole] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  const passwordRules = getPasswordRuleResults(motDePasse);
  const passwordStrength = getPasswordStrength(motDePasse);
  const passwordStrong = isPasswordStrong(motDePasse);

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

    const errors = validateFields(nom, email, telephone, role, motDePasse, passwordStrong);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.motDePasse) setPasswordTouched(true);
      return;
    }
    setFieldErrors({});

    const parts = nom.trim().split(/\s+/).filter(Boolean);
    const prenomPart = parts[0];
    const nomPart = parts.slice(1).join(" ");
    const numero = (telephone ?? "").trim();

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
      if (err instanceof ApiError) {
        // Map API field errors when available
        const detail = (err as ApiError & { errors?: Record<string, string[]> }).errors;
        if (detail) {
          const mapped: FieldErrors = {};
          if (detail.nom || detail.prenom) mapped.nom = (detail.nom ?? detail.prenom ?? [])[0];
          if (detail.email) mapped.email = detail.email[0];
          if (detail.telephone) mapped.telephone = detail.telephone[0];
          if (detail.role_id) mapped.role = detail.role_id[0];
          if (detail.password) mapped.motDePasse = detail.password[0];
          if (Object.keys(mapped).length > 0) {
            setFieldErrors(mapped);
          } else {
            toast.error(err.message);
          }
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Erreur lors de la création de l'employé.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-2 sm:px-6 lg:px-32 py-4 sm:py-8 lg:py-16">
          {/* Retour */}
          <div className="mb-4 lg:mb-6 mx-auto w-full max-w-[920px]">
            <Link
              href="/partenaire/employes"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-toni-green-dark-2 hover:underline"
            >
              ← Retour aux employés
            </Link>
          </div>

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
                  placeholder="Prénom + Nom"
                  value={nom}
                  onChange={(e) => { setNom(e.target.value); clearError("nom"); }}
                  className={`w-full rounded-md border bg-white px-3 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                    fieldErrors.nom
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  }`}
                />
                {fieldErrors.nom && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.nom}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-base font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="monemail@gmail.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                  className={`w-full rounded-md border bg-white px-3 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                    fieldErrors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-base font-medium text-gray-600">
                  Téléphone
                </label>
                <div className={`rounded-md border bg-white px-3 py-2.5 text-base text-gray-800 focus-within:outline-none focus-within:ring-1 ${
                  fieldErrors.telephone
                    ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500"
                    : "border-gray-300 focus-within:border-emerald-500 focus-within:ring-emerald-500"
                }`}>
                  <PhoneInput
                    international
                    defaultCountry="BJ"
                    placeholder="Numéro de téléphone"
                    value={telephone}
                    onChange={(val) => { setTelephone(val); clearError("telephone"); }}
                  />
                </div>
                {fieldErrors.telephone && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.telephone}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-base font-medium text-gray-600">
                  Rôle
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => { setRole(e.target.value); clearError("role"); }}
                    className={`w-full appearance-none rounded-md border bg-white pl-3 pr-12 py-2.5 text-base text-gray-800 focus:outline-none focus:ring-1 ${
                      fieldErrors.role
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    }`}
                  >
                    <option value="">Sélectionnez un rôle</option>
                    {roles.map((item) => (
                      <option key={item.id} value={item.id}>{getRoleDisplayLabel(item)}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-700"
                  />
                </div>
                {fieldErrors.role && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.role}</p>
                )}
              </div>
            </div>

            {/* Row 3 — password (half-width on desktop) */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1 block text-base font-medium text-gray-600">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="***************"
                    value={motDePasse}
                    onChange={(e) => { setMotDePasse(e.target.value); clearError("motDePasse"); }}
                    onBlur={() => setPasswordTouched(true)}
                    className={`w-full rounded-md border bg-white px-3 py-2.5 pr-10 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                      fieldErrors.motDePasse
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    }`}
                  />
                  {fieldErrors.motDePasse && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.motDePasse}</p>
                  )}
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

                {(passwordTouched || motDePasse.length > 0) && !passwordStrong && (
                  <div className="mt-2 space-y-2 rounded-md border border-gray-200 bg-white p-2.5">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-600">Robustesse</span>
                        <span className="font-semibold text-gray-700">{passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full ${passwordStrength.colorClass} transition-all duration-200`}
                          style={{ width: `${passwordStrength.percent}%` }}
                        />
                      </div>
                    </div>
                    <ul className="space-y-0.5">
                      {passwordRules.map((rule) => (
                        <li
                          key={rule.id}
                          className={`flex items-center gap-1.5 text-[11px] leading-tight ${rule.valid ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {rule.valid ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 sm:mt-10 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !passwordStrong}
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


