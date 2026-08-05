"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import { loginPatient } from "@/lib/api/auth";
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
      toast.warning("Veuillez renseigner vos identifiants.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await loginPatient({
        login: loginValue,
        password: formData.password,
        remember: formData.rememberMe,
      });

      const token = response.data?.token;
      if (!token) {
        toast.error(response.message ?? "Réponse de connexion invalide: token manquant.");
        return;
      }

      saveAuthSession({
        userType: "patient",
        token,
        tokenType: response.data?.token_type ?? "Bearer",
        profile: response.data?.patient ?? null,
        expiresAt: response.data?.expires_at,
      }, formData.rememberMe);

      toast.success(response.message ?? "Connexion réussie.");
      router.push("/client/accueil");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue pendant la connexion.");
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
            Connexion
          </h2>

          {/* Tabs pour choisir la méthode de connexion */}
          <div className="flex mb-6 border-b-2 border-gray-300">
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 py-3 text-sm font-semibold transition ${
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
              className={`flex-1 py-3 text-sm font-semibold transition ${
                loginMethod === "email"
                  ? "border-b-4 border-toni-green-dark-2 text-toni-green-dark-2"
                  : "text-gray-600"
              }`}
            >
              ADDRESSE MAIL
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Téléphone ou Email selon l'onglet actif */}
            {loginMethod === "phone" ? (
              <div className="relative flex gap-2">
                <select
                  value={formData.indicatif}
                  onChange={e => setFormData({ ...formData, indicatif: e.target.value })}
                  className="px-2 py-3 border border-black rounded-md text-black focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                  style={{ fontSize: '0.75rem', width: '70px' }}
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
                  className="flex-1 bg-white px-4 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
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
                  className="w-full bg-white px-4 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
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
                className="w-full bg-white pl-12 pr-12 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
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
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="w-4 h-4 border-gray-300 rounded focus:ring-toni-green-dark-2"
                />
                <span className="text-gray-700">Se souvenir de moi</span>
              </label>
              <Link href="/mot-de-passe-oublie?from=client" className="text-gray-700 hover:text-toni-green-dark-2">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton Se connecter */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-toni-green-dark-2 text-white font-bold py-3 rounded-md hover:bg-toni-green-dark transition"
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Lien vers inscription */}
          <p className="text-center text-sm text-gray-700 mt-6">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="text-toni-green-dark-2 font-semibold hover:underline">
              Inscrivez-vous.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
