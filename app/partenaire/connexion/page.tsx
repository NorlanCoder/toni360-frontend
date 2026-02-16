"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { COUNTRY_CODES } from "@/lib/countryCodes";

export default function ConnexionPartenairePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");

  const beninCode =
    COUNTRY_CODES.find((c) => c.code === "+229") || COUNTRY_CODES[0];

  const [formData, setFormData] = useState({
    indicatif: beninCode.code,
    telephone: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submitted:", formData);
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
                className="flex items-center rounded-lg overflow-hidden"
                style={{ backgroundColor: "#f1f1f1", border: "1px solid #e0e0e0" }}
              >
                <div className="flex items-center gap-1.5 px-4 py-4">
                  <span className="text-lg leading-none">{beninCode.flag}</span>
                  <select
                    value={formData.indicatif}
                    onChange={(e) =>
                      setFormData({ ...formData, indicatif: e.target.value })
                    }
                    className="bg-transparent text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer"
                    style={{ minWidth: "52px" }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="tel"
                  placeholder="numéro de téléphone"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                  className="flex-1 px-2 py-4 bg-transparent focus:outline-none text-gray-700 text-sm placeholder-gray-400"
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
                  className="w-full px-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137551] text-gray-700 text-sm placeholder-gray-400"
                  style={{
                    backgroundColor: "#f1f1f1",
                    border: "1px solid #e0e0e0",
                  }}
                />
              </div>
            )}

            {/* Mot de passe */}
            <div
              className="relative flex items-center rounded-lg"
              style={{ backgroundColor: "#f1f1f1", border: "1px solid #e0e0e0" }}
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
                className="w-full pl-11 pr-12 py-4 bg-transparent rounded-lg focus:outline-none text-gray-700 text-sm placeholder-gray-400"
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
              className="w-full py-4 text-white font-bold text-base rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: "#137551" }}
            >
              Continuer
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
