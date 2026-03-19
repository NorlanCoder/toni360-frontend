"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import { getPatientProfile, loginPatient } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { saveAuthSession } from "@/lib/api/session";

export default function ConnexionPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    indicatif: COUNTRY_CODES[0].code,
    telephone: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    const loginValue = loginMethod === "phone"
      ? `${formData.indicatif}${formData.telephone}`.replace(/\s+/g, "")
      : formData.email.trim();

    if (!loginValue || !formData.password) {
      window.alert("Veuillez renseigner vos identifiants.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await loginPatient({
        login: loginValue,
        password: formData.password,
      });

      const profileResponse = await getPatientProfile(response.data.token);

      saveAuthSession({
        userType: "patient",
        token: response.data.token,
        tokenType: response.data.token_type,
        profile: profileResponse.data.patient ?? response.data.patient ?? null,
      });

      window.alert(response.message ?? "Connexion réussie.");
      router.push("/client/accueil");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        window.alert(error.message);
      } else {
        window.alert("Une erreur est survenue pendant la connexion.");
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
            Connexion
          </h2>

          {/* Tabs pour choisir la méthode de connexion */}
          <div className="mb-5 grid grid-cols-2 border-b-2 border-gray-300 sm:mb-6">
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`px-1 py-2.5 text-xs font-semibold tracking-wide transition sm:py-3 sm:text-sm ${
                loginMethod === "phone"
                  ? "border-b-4 border-toni-green-dark-2 text-toni-green-dark-2"
                  : "text-gray-600"
              }`}
            >
              NUMERO DE TELEPHONE
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`px-1 py-2.5 text-xs font-semibold tracking-wide transition sm:py-3 sm:text-sm ${
                loginMethod === "email"
                  ? "border-b-4 border-toni-green-dark-2 text-toni-green-dark-2"
                  : "text-gray-600"
              }`}
            >
              ADDRESSE MAIL
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Téléphone ou Email selon l'onglet actif */}
            {loginMethod === "phone" ? (
              <div className="relative flex gap-2">
                <select
                  value={formData.indicatif}
                  onChange={e => setFormData({ ...formData, indicatif: e.target.value })}
                  className="w-[78px] rounded-md border border-black px-1.5 py-2.5 text-xs text-black focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 sm:w-[88px] sm:py-3"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="Numéro de téléphone"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                  className="min-w-0 flex-1 rounded-md border border-black px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 sm:py-3 sm:text-base"
                />
              </div>
            ) : (
              <div>
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-md border border-black px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 sm:py-3 sm:text-base"
                />
              </div>
            )}

            {/* Mot de passe */}
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full rounded-md border border-black py-2.5 pl-12 pr-12 text-sm text-black focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 sm:py-3 sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Se souvenir de moi & Mot de passe oublié */}
            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="w-4 h-4 border-gray-300 rounded focus:ring-toni-green-dark-2"
                />
                <span className="text-sm text-gray-700">Se souvenir de moi</span>
              </label>
              <Link href="/mot-de-passe-oublie" className="text-sm text-gray-700 hover:text-toni-green-dark-2 sm:text-right">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton Se connecter */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-toni-green-dark-2 py-2.5 text-sm font-bold text-white transition hover:bg-toni-green-dark sm:py-3 sm:text-base"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Lien vers inscription */}
          <p className="mt-5 text-center text-sm text-gray-700 sm:mt-6">
            Pas encore de compte ?{" "}
            <Link href="/client/inscription" className="text-toni-green-dark-2 font-semibold hover:underline">
              Inscrivez-vous.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
