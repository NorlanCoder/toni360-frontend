"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { registerPatient } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { saveAuthSession } from "@/lib/api/session";
import { toast } from "sonner";

export default function InscriptionPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: undefined as string | undefined,
    password: "",
    confirmPassword: "",
  });

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

    if (formData.password.length < 8) {
      toast.warning("Le mot de passe doit contenir au moins 8 caracteres.");
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
                className="mx-auto h-20 w-auto sm:h-24"
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
            <div>
              <input
                type="text"
                placeholder="Nom complet"
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                className="w-full rounded-md border border-black px-4 py-2.5 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
              />
            </div>

            {/* Email */}
            <div className="relative flex items-center">
              <User className="absolute left-4 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-md border border-black py-2.5 pl-12 pr-4 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
              />
            </div>

            {/* Téléphone avec indicatif */}
            <div className="flex rounded-md border border-black px-3 py-2.5 text-black transition-colors focus-within:border-toni-green-dark-2 sm:py-3">
              <PhoneInput
                international
                defaultCountry="BJ"
                placeholder="Numéro de téléphone"
                value={formData.telephone}
                onChange={(value) => setFormData({ ...formData, telephone: value })}
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
                className="w-full rounded-md border border-black py-2.5 pl-12 pr-12 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
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
                className="w-full rounded-md border border-black py-2.5 pl-12 pr-12 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
              />
            </div>

            {/* Bouton S'inscrire */}
            <button
              type="submit"
              disabled={submitting}
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

          {/* Texte légal */}
          <p className="mt-3 text-center text-xs text-gray-500 sm:mt-4 sm:text-sm">
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
