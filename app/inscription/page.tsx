"use client";

import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function InscriptionPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
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
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/ph.jpeg')" }}
        />
      </div>

      {/* Section Formulaire - Droite */}
      <div className="w-full lg:w-1/2 bg-[#F5F5F0] flex flex-col items-center justify-center px-6 py-12">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Adresse email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
              />
            </div>

            {/* Téléphone */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-xl">🇧🇯</span>
                <span className="text-sm text-gray-600">+229</span>
              </div>
              <input
                type="tel"
                placeholder="Numéro de téléphone"
                value={formData.telephone}
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
                className="w-full pl-20 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
              />
            </div>

            {/* Mot de passe */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Créer un mot de passe"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2 text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Bouton S'inscrire */}
            <button
              type="submit"
              className="w-full bg-toni-green-dark-2 text-white font-bold py-3 rounded-lg hover:bg-toni-green-dark transition"
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
