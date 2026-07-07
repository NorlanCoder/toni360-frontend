"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, Check, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import { registerPatient } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { saveAuthSession } from "@/lib/api/session";
import { getPasswordRuleResults, getPasswordStrength, isPasswordStrong } from "@/lib/passwordPolicy";

export default function InscriptionPage() {
  type FieldErrors = Partial<Record<"nom" | "email" | "telephone" | "password", string>>;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    indicatif: COUNTRY_CODES[0].code,
    telephone: "",
    password: "",
  });

  const clearError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const mapApiErrorsToFields = (error: ApiError): FieldErrors => {
    const mapped: FieldErrors = {};
    const details = error.details as { errors?: Record<string, unknown> } | undefined;
    const apiErrors = details?.errors;

    if (apiErrors && typeof apiErrors === "object") {
      Object.entries(apiErrors).forEach(([key, value]) => {
        const message = Array.isArray(value)
          ? value.find((item) => typeof item === "string")
          : typeof value === "string"
            ? value
            : undefined;

        if (!message) return;

        if (key === "nom" || key === "prenom") mapped.nom ??= message;
        if (key === "email") mapped.email = message;
        if (key === "telephone") mapped.telephone = message;
        if (key === "password" || key === "password_confirmation") mapped.password ??= message;
      });
    }

    if (Object.keys(mapped).length > 0) {
      return mapped;
    }

    const lower = error.message.toLowerCase();
    if (lower.includes("email")) return { email: error.message };
    if (lower.includes("téléphone") || lower.includes("telephone")) return { telephone: error.message };
    if (lower.includes("mot de passe") || lower.includes("password")) return { password: error.message };
    return { nom: error.message };
  };

  const passwordRules = getPasswordRuleResults(formData.password);
  const passwordStrength = getPasswordStrength(formData.password);
  const passwordValid = isPasswordStrong(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    const fullName = formData.nom.trim();
    const nextErrors: FieldErrors = {};

    if (!fullName) {
      nextErrors.nom = "Le nom complet est obligatoire.";
    }

    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      nextErrors.email = "L'adresse email est obligatoire.";
    } else if (!EMAIL_RE.test(cleanEmail)) {
      nextErrors.email = "Le format de l'adresse email est invalide.";
    }

    const cleanPhone = formData.telephone.trim();
    if (!cleanPhone) {
      nextErrors.telephone = "Le numéro de téléphone est obligatoire.";
    } else if (cleanPhone.replace(/\D/g, "").length < 8) {
      nextErrors.telephone = "Le numéro de téléphone est invalide.";
    }

    if (!formData.password) {
      nextErrors.password = "Le mot de passe est obligatoire.";
    } else if (!passwordValid) {
      nextErrors.password = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      if (nextErrors.password) setPasswordTouched(true);
      return;
    }

    setFieldErrors({});

    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const prenom = nameParts[0] ?? fullName;
    const nom = nameParts.slice(1).join(" ") || nameParts[0] || fullName;
    const telephone = `${formData.indicatif}${formData.telephone}`.replace(/\s+/g, "");

    setSubmitting(true);
    try {
      const response = await registerPatient({
        nom,
        prenom,
        email: formData.email.trim(),
        telephone,
        password: formData.password,
        password_confirmation: formData.password,
      });

      saveAuthSession({
        userType: "patient",
        token: response.data.token,
        tokenType: response.data.token_type,
        profile: response.data.patient ?? null,
      });

      router.push("/client/accueil");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setFieldErrors(mapApiErrorsToFields(error));
      } else {
        setFieldErrors({ nom: "Une erreur est survenue pendant l'inscription." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Section Image - Gauche - Cachée sur mobile */}
      <div className="hidden lg:block lg:w-3/5 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/ph6.png')" }}
        />
      </div>

      {/* Section Formulaire - Droite */}
      <div className="w-full lg:w-2/5 flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: '#eafff8' }}>
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8 text-center">
            <img src="/images/logo.png" alt="Toni360" className="h-28 mx-auto" />
          </div>

          {/* Titre */}
          <h2 className="text-5xl text-gray-800 text-center mb-12">
            Inscription
          </h2>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom complet */}
            <div>
              <input
                type="text"
                placeholder="Nom complet"
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                onInput={() => clearError("nom")}
                className={`w-full bg-white px-4 py-3 border rounded-md focus:outline-none focus:ring-2 text-black ${
                  fieldErrors.nom
                    ? "border-red-500 focus:ring-red-500"
                    : "border-black focus:ring-toni-green-dark-2"
                }`}
              />
              {fieldErrors.nom && <p className="mt-1 text-xs text-red-600">{fieldErrors.nom}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="relative flex items-center">
                <User className="absolute left-4 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  onInput={() => clearError("email")}
                  className={`w-full bg-white pl-12 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 text-black ${
                    fieldErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-black focus:ring-toni-green-dark-2"
                  }`}
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>

            {/* Téléphone avec indicatif */}
            <div>
              <div className="relative flex gap-2">
              <div className="relative">
                <select
                  value={formData.indicatif}
                  onChange={e => setFormData({ ...formData, indicatif: e.target.value })}
                  className={`appearance-none pl-2 pr-10 py-3 border rounded-md text-black focus:outline-none focus:ring-2 ${
                    fieldErrors.telephone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-black focus:ring-toni-green-dark-2"
                  }`}
                  style={{ fontSize: '0.75rem', minWidth: '92px' }}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-700"
                />
              </div>
              <input
                type="tel"
                placeholder="Numéro de téléphone"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                onInput={() => clearError("telephone")}
                className={`flex-1 bg-white px-4 py-3 border rounded-md focus:outline-none focus:ring-2 text-black ${
                  fieldErrors.telephone
                    ? "border-red-500 focus:ring-red-500"
                    : "border-black focus:ring-toni-green-dark-2"
                }`}
              />
              </div>
              {fieldErrors.telephone && <p className="mt-1 text-xs text-red-600">{fieldErrors.telephone}</p>}
            </div>

            {/* Mot de passe */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Créer un mot de passe"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  onInput={() => clearError("password")}
                  onBlur={() => setPasswordTouched(true)}
                  className={`w-full bg-white pl-12 pr-12 py-3 border rounded-md focus:outline-none focus:ring-2 text-black ${
                    fieldErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-black focus:ring-toni-green-dark-2"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600"
                  style={{ marginTop: '1px' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}

              {(passwordTouched || formData.password.length > 0) && !passwordValid && (
                <div className="space-y-2 pl-1">
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
                      <li key={rule.id} className={`flex items-center gap-1.5 text-xs leading-tight transition-colors ${rule.valid ? "text-emerald-600" : "text-red-500"}`}>
                        {rule.valid
                          ? <Check size={12} className="shrink-0" />
                          : <X size={12} className="shrink-0" />}
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bouton S'inscrire */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-toni-green-dark-2 text-white font-bold py-3 rounded-md hover:bg-toni-green-dark transition"
            >
              {submitting ? "Inscription..." : "S\'inscrire"}
            </button>
          </form>

          {/* Lien connexion */}
          <p className="text-center mt-6 text-gray-600">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="text-toni-green-dark-2 font-semibold hover:underline">
              Connectez-vous.
            </Link>
          </p>

          {/* Texte légal */}
          <p className="text-center mt-4 text-sm text-gray-500">
            En vous inscrivant, vous acceptez nos{" "}
            <Link href="#" className="text-toni-green-dark-2 hover:underline">
              Conditions d&apos;utilisation
            </Link>{" "}
            et la{" "}
            <Link href="#" className="text-toni-green-dark-2 hover:underline">
              Politique de confidentialité.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
