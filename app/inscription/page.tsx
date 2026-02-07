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
          style={{ backgroundImage: "url('/images/ph 4.png')" }}
        />
      </div>

      {/* Section Formulaire - Droite */}
      <div className="w-full lg:w-2/5 flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: '#eafff8' }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-toni-green-dark-2">Toni360</h1>
          </div>

          {/* Titre */}
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
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
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
              />
            </div>

            {/* Téléphone avec select indicatif */}
            <div className="relative flex">
              <select
                value={formData.indicatif}
                onChange={e => setFormData({ ...formData, indicatif: e.target.value })}
                className="pl-2 pr-1 py-3 border border-black rounded-l-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 min-w-[90px]"
                style={{ fontSize: '1rem' }}
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
                className="w-full pr-4 py-3 border-t border-b border-r border-black rounded-r-md focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
                style={{ fontSize: '1rem' }}
              />
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Créer un mot de passe"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-11 pr-12 py-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
