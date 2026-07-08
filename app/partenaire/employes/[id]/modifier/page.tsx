"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { getPartnerUser, getPartnerRoles, updatePartnerUser, PartnerRole } from "@/lib/api/partner";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import ConfirmationModal from "@/components/ConfirmationModal";

/* ── Helpers ── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function getRoleDisplayLabel(r: PartnerRole): string {
  if (r.code in roleLabelsByCode) return roleLabelsByCode[r.code as keyof typeof roleLabelsByCode];
  return r.libelle;
}

/** S'assure que le numéro commence par '+' pour PhoneInput */
function normalizePhone(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

/* ── Validation ── */
type FieldErrors = Partial<Record<"nom" | "email" | "telephone" | "role", string>>;

function validateFields(
  nom: string,
  email: string,
  telephone: string | undefined,
  role: string,
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
  } else if (num.replace(/\D/g, "").length < 10) {
    errors.telephone = "Le numéro de téléphone doit contenir au moins 10 chiffres.";
  }
  if (!role) {
    errors.role = "Veuillez sélectionner un rôle.";
  }
  return errors;
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireModifierEmployePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState<string | undefined>(undefined);
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState<PartnerRole[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const clearError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });

  /* ── Load employee + roles ── */
  useEffect(() => {
    const load = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token || !id) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }
      try {
        const [userRes, rolesRes] = await Promise.all([
          getPartnerUser(session.token, id),
          getPartnerRoles(session.token),
        ]);
        const user = userRes.data.user;
        const roleMap = new Map(rolesRes.data.roles.map((r) => [r.code, r]));
        const available = ASSIGNABLE_ROLE_CODES
          .map((code) => roleMap.get(code))
          .filter((r): r is PartnerRole => Boolean(r));
        setRoles(available);
        setNom(user.nom_complet ?? "");
        setEmail(user.email ?? "");
        setTelephone(normalizePhone(user.telephone));
        const currentRole = available.find((r) => r.code === user.role?.code);
        if (currentRole) setRole(currentRole.id);
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger l'employé.");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [id]);

  /* ── Auto-close modal then redirect ── */
  useEffect(() => {
    if (!showModal) return;
    const timer = setTimeout(() => {
      setShowModal(false);
      router.push(`/partenaire/employes/${id}`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showModal, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    const errors = validateFields(nom, email, telephone, role);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const parts = nom.trim().split(/\s+/).filter(Boolean);
    const prenomPart = parts[0];
    const nomPart = parts.slice(1).join(" ");
    const numero = (telephone ?? "").trim();

    setIsSubmitting(true);
    try {
      await updatePartnerUser(session.token, id, {
        nom: nomPart,
        prenom: prenomPart,
        email: email.trim(),
        telephone: numero,
        role_id: role,
      });
      setShowModal(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const detail = (err as ApiError & { errors?: Record<string, string[]> }).errors;
        if (detail) {
          const mapped: FieldErrors = {};
          if (detail.nom || detail.prenom) mapped.nom = (detail.nom ?? detail.prenom ?? [])[0];
          if (detail.email) mapped.email = detail.email[0];
          if (detail.telephone) mapped.telephone = detail.telephone[0];
          if (detail.role_id) mapped.role = detail.role_id[0];
          if (Object.keys(mapped).length > 0) {
            setFieldErrors(mapped);
          } else {
            toast.error(err.message);
          }
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Erreur lors de la modification de l'employé.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Chargement de l&apos;employé...</div>;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto px-2 sm:px-6 lg:px-32 py-4 sm:py-8 lg:py-16">
        {/* Retour */}
        <div className="mb-4 lg:mb-6 mx-auto w-full max-w-[920px]">
          <Link
            href={`/partenaire/employes/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-toni-green-dark-2 hover:underline"
          >
            ← Retour au profil
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-[920px] rounded-xl bg-white p-4 sm:p-8"
        >
          <h1 className="mb-6 text-xl font-bold text-gray-900">Modifier l&apos;employé</h1>

          {/* Ligne 1 : Nom + Email */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-base font-medium text-gray-600">Nom complet</label>
              <input
                type="text"
                placeholder="Penom + Nom"
                value={nom}
                onChange={(e) => { setNom(e.target.value); clearError("nom"); }}
                className={`w-full rounded-md border bg-white px-3 py-2.5 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
                  fieldErrors.nom ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                }`}
              />
              {fieldErrors.nom && <p className="mt-1 text-xs text-red-600">{fieldErrors.nom}</p>}
            </div>
            <div>
              <label className="mb-1 block text-base font-medium text-gray-600">Email</label>
              <input
                type="email"
                placeholder="jonathan@gmail.com"
                value={email}
                readOnly
                className={`w-full rounded-md border bg-gray-100 px-3 py-2.5 text-base text-gray-500 placeholder:text-gray-400 cursor-not-allowed focus:outline-none ${
                  fieldErrors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">L&apos;email ne peut pas être modifié.</p>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>
          </div>

          {/* Ligne 2 : Téléphone + Rôle */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-base font-medium text-gray-600">Téléphone</label>
              <div className={`rounded-md border bg-white px-3 py-2.5 text-base text-gray-800 focus-within:outline-none focus-within:ring-1 ${
                fieldErrors.telephone ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500" : "border-gray-300 focus-within:border-emerald-500 focus-within:ring-emerald-500"
              }`}>
                <PhoneInput
                  international
                  defaultCountry="BJ"
                  placeholder="Numéro de téléphone"
                  value={telephone}
                  onChange={(val) => { setTelephone(val); clearError("telephone"); }}
                />
              </div>
              {fieldErrors.telephone && <p className="mt-1 text-xs text-red-600">{fieldErrors.telephone}</p>}
            </div>
            <div>
              <label className="mb-1 block text-base font-medium text-gray-600">Rôle</label>
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value); clearError("role"); }}
                className={`w-full rounded-md border bg-white px-3 py-2.5 text-base text-gray-800 focus:outline-none focus:ring-1 ${
                  fieldErrors.role ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                }`}
              >
                <option value="">Sélectionnez un rôle</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{getRoleDisplayLabel(r)}</option>
                ))}
              </select>
              {fieldErrors.role && <p className="mt-1 text-xs text-red-600">{fieldErrors.role}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="mt-6 sm:mt-10 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-full bg-emerald-700 px-4 sm:px-10 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </main>

      <ConfirmationModal
        show={showModal}
        message={"Employé modifié\navec succès."}
        iconPath="/images/checkmark.svg"
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
