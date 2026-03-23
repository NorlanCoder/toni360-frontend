"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getPartnerProfile, loginPartner } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { saveAuthSession } from "@/lib/api/session";
import { toast } from "sonner";

export default function ConnexionPartenairePage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    telephone: undefined as string | undefined,
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
      ? (formData.telephone ?? "")
      : formData.email.trim();

    if (!loginValue || !formData.password) {
      toast.warning("Veuillez renseigner vos identifiants.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await loginPartner({
        login: loginValue,
        password: formData.password,
      });

      const profileResponse = await getPartnerProfile(response.data.token);

      saveAuthSession({
        userType: "user",
        token: response.data.token,
        tokenType: response.data.token_type,
        profile: profileResponse.data.user ?? response.data.user ?? null,
        permissions: profileResponse.data.permissions ?? response.data.permissions ?? [],
      });

      toast.success(response.message ?? "Connexion réussie.");
      router.push("/partenaire/dashboard");
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
    <div className="flex min-h-screen h-screen">
      {/* Section Image - Gauche */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/imgc.jpg"
          alt="Pharmacienne"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Section Formulaire - Droite */}
      <div
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 text-center">
            <Image
              src="/images/logo.png"
              alt="Toni360"
              width={180}
              height={60}
              className="mx-auto"
              priority
            />
          </div>

          {/* Titre */}
          <h1
            className="text-5xl font-bold text-center mb-8"
            style={{ color: "#137551" }}
          >
            Connexion
          </h1>

          {/* Onglets */}
          <div className="flex mb-8">
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 py-3 text-sm font-bold tracking-wide uppercase transition-all rounded-md ${
                loginMethod === "phone"
                  ? "text-white"
                  : "text-gray-600 bg-transparent"
              }`}
              style={
                loginMethod === "phone"
                  ? { backgroundColor: "#137551" }
                  : undefined
              }
            >
              Numero de telephone
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 py-3 text-sm font-bold tracking-wide uppercase transition-all rounded-md ${
                loginMethod === "email"
                  ? "text-white"
                  : "text-gray-600 bg-transparent"
              }`}
              style={
                loginMethod === "email"
                  ? { backgroundColor: "#137551" }
                  : undefined
              }
            >
              Addresse mail
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ téléphone ou email */}
            {loginMethod === "phone" ? (
              <div
                className="flex items-center rounded-lg overflow-hidden px-3 py-2 border border-[#e0e0e0] transition-colors focus-within:border-[#137551]"
                style={{ backgroundColor: "#f1f1f1" }}
              >
                <PhoneInput
                  international
                  defaultCountry="BJ"
                  placeholder="numéro de téléphone"
                  value={formData.telephone}
                  onChange={(value) => setFormData({ ...formData, telephone: value })}
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
                  className="w-full px-4 py-4 rounded-lg outline-none transition-colors border border-[#e0e0e0] focus:border-[#137551] text-gray-700 text-sm placeholder-gray-400"
                  style={{ backgroundColor: "#f1f1f1" }}
                />
              </div>
            )}

            {/* Mot de passe */}
            <div
              className="relative flex items-center rounded-lg border border-[#e0e0e0] transition-colors focus-within:border-[#137551]"
              style={{ backgroundColor: "#f1f1f1" }}
            >
              <Lock
                className="absolute left-4 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-11 pr-12 py-4 bg-transparent rounded-lg outline-none text-gray-700 text-sm placeholder-gray-400"
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
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="w-4 h-4 border-gray-300 rounded"
                />
                <span className="text-gray-600 text-sm">Se souvenir de moi</span>
              </label>
              <Link
                href="#"
                className="text-gray-600 text-sm hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton Continuer */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-white font-bold text-base rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: "#137551" }}
            >
              {submitting ? "Connexion..." : "Continuer"}
            </button>
          </form>

          {/* Lien inscription */}
          <p className="text-center mt-8 text-base text-gray-600">
            Déjà un compte ?{" "}
            <Link
              href="/partenaire/inscription"
              className="font-bold hover:underline"
              style={{ color: "#137551" }}
            >
              Je me connecte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
