"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, Mail, AtSign } from "lucide-react";
import Link from "next/link";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { registerPatient } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { saveAuthSession } from "@/lib/api/session";
import { getPasswordRuleResults, getPasswordStrength, isPasswordStrong } from "@/lib/passwordPolicy";
import { toast } from "sonner";

export default function InscriptionPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [acceptedCGU, setAcceptedCGU] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: undefined as string | undefined,
    password: "",
    confirmPassword: "",
  });

  const passwordRules = getPasswordRuleResults(formData.password);
  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrong = isPasswordStrong(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    const fullName = formData.nom.trim();
    if (!fullName || !formData.email.trim() || !formData.telephone?.trim() || !formData.password) {
      toast.warning("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.warning("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!passwordStrong) {
      setPasswordTouched(true);
      toast.warning("Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule, un chiffre et un caractere special.");
      return;
    }

    if (!acceptedCGU) {
      toast.warning("Vous devez accepter les Conditions Générales d'Utilisation.");
      return;
    }

    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const prenom = nameParts[0] ?? fullName;
    const nom = nameParts.slice(1).join(" ") || nameParts[0] || fullName;
    const telephone = formData.telephone ?? "";

    if (telephone.length > 20) {
      toast.warning("Le numero de telephone est trop long.");
      return;
    }

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

      toast.success(response.message ?? "Inscription réussie.");
      router.push("/client/accueil");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue pendant l'inscription.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Section Image - Gauche - Cachée sur mobile */}
      <div className="relative hidden lg:block lg:w-3/5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/ph6.png')" }}
        />
      </div>

      {/* Section Formulaire - Droite */}
      <div
        className="flex w-full flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:w-2/5 lg:px-8 lg:py-12"
        style={{ backgroundColor: "#eafff8" }}
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 text-center sm:mb-8">
            <Link href="/" aria-label="Accueil">
              <Image
                src="/images/logo.png"
                alt="Toni360"
                width={192}
                height={96}
                priority
                className="mx-auto h-20 w-auto "
              />
            </Link>
          </div>

          {/* Titre */}
          <h2 className="mb-8 text-center text-3xl text-gray-800 sm:mb-10 sm:text-4xl lg:text-5xl">
            Inscription
          </h2>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Nom complet */}

           <div className="relative flex items-center">
              <User className="absolute left-4 text-gray-400" size={18} />

              <input
                type="text"
                placeholder="Nom complet"
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                className="w-full rounded-md border border-black bg-white py-2.5 pl-12 pr-4 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
              />
            </div>

            {/* Email */}
            <div className="relative flex items-center">
              <AtSign className="absolute left-4 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-md border border-black bg-white py-2.5 pl-12 pr-4 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
              />
            </div>

            {/* Téléphone avec indicatif */}
            <div className="flex rounded-md border bg-white border-black px-3 py-2.5 text-black transition-colors focus-within:border-toni-green-dark-2 sm:py-3">
              <PhoneInput
                international
                defaultCountry="BJ"
                placeholder="Numéro de téléphone"
                value={formData.telephone}
                onChange={(value) => setFormData({ ...formData, telephone: value })}
                className="bg-white"
              />
            </div>

            {/* Mot de passe */}
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Créer un mot de passe"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                onBlur={() => setPasswordTouched(true)}
                className="w-full rounded-md border border-black bg-white py-2.5 pl-12 pr-12 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600"
                style={{ marginTop: "1px" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {(passwordTouched || formData.password.length > 0) && (
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
                      className={`text-[11px] leading-tight ${rule.valid ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {rule.valid ? "OK" : "KO"} - {rule.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mot de passe confirmé */}
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full rounded-md border border-black bg-white py-2.5 pl-12 pr-12 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
              />
            </div>

            {/* Case à cocher CGU */}
            <div className="rounded-md border border-gray-200 bg-white p-4 text-xs text-gray-600 sm:text-sm">
              <p className="mb-3">
                <span className="font-bold">Attention !! </span>
                Si vous cochez la case ci-dessous, vous confirmez avoir pris
                connaissance des présentes CGU et acceptez de vous y soumettre
                sans réserve. Il est donc conseillé aux Utilisateurs de lire
                attentivement les{" "}
                <Link href="/terms-of-use" className="text-toni-green-dark-2 font-semibold hover:underline">
                  Conditions Générales d&apos;Utilisation
                </Link>.
              </p>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptedCGU}
                  onChange={(e) => setAcceptedCGU(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-toni-green-dark-2"
                />
                <span>
                  Je reconnais avoir lu et accepté les{" "}
                  <Link href="/terms-of-use" className="text-toni-green-dark-2 font-semibold hover:underline">
                    Conditions Générales d&apos;Utilisation
                  </Link>.
                </span>
              </label>
            </div>

            {/* Bouton S'inscrire */}
            <button
              type="submit"
              disabled={submitting || !passwordStrong}
              className="w-full rounded-md bg-toni-green-dark-2 py-2.5 text-sm font-bold text-white transition hover:bg-toni-green-dark sm:py-3 sm:text-base"
            >
              {submitting ? "Inscription..." : "S\'inscrire"}
            </button>
          </form>

          {/* Lien connexion */}
          <p className="mt-5 text-center text-sm text-gray-600 sm:mt-6 sm:text-base">
            Déjà inscrit ?{" "}
            <Link href="/client/connexion" className="text-toni-green-dark-2 font-semibold hover:underline">
              Connectez-vous.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
