"use client";

import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { COUNTRY_CODES } from "@/lib/countryCodes";

export default function InscriptionPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    indicatif: COUNTRY_CODES[0].code,
    telephone: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
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
                className="w-full px-4 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
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
                className="w-full pl-12 pr-4 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
              />
            </div>

            {/* Téléphone avec indicatif */}
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
                className="flex-1 px-4 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
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
                className="w-full pl-12 pr-12 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
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

            {/* Bouton S'inscrire */}
            <button
              type="submit"
              className="w-full bg-toni-green-dark-2 text-white font-bold py-3 rounded-md hover:bg-toni-green-dark transition"
            >
              S&apos;inscrire
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
