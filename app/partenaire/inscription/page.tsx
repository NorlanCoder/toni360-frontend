"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import { registerPartner } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { saveAuthSession } from "@/lib/api/session";

export default function DevenirPartenairePage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const beninCode = COUNTRY_CODES.find((c) => c.code === "+229") || COUNTRY_CODES[0];

  const [formData, setFormData] = useState({
    nomPharmacie: "",
    adresseComplete: "",
    indicatif: beninCode.code,
    telephone: "",
    jourOuverture: "",
    email: "",
    heureOuvrables: "",
    villeExercice: "",
    confirmPassword: "",
    licence: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    if (
      !formData.nomPharmacie.trim() ||
      !formData.adresseComplete.trim() ||
      !formData.telephone.trim() ||
      !formData.email.trim() ||
      !formData.heureOuvrables.trim() ||
      !formData.confirmPassword.trim()
    ) {
      window.alert("Veuillez remplir les champs obligatoires.");
      return;
    }

    if (formData.heureOuvrables !== formData.confirmPassword) {
      window.alert("Les mots de passe ne correspondent pas.");
      return;
    }

    if (formData.heureOuvrables.length < 8) {
      window.alert("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }

    const telephone = `${formData.indicatif}${formData.telephone}`.replace(/\s+/g, "");

    if (telephone.length > 20) {
      window.alert("Le numero de telephone est trop long.");
      return;
    }

    if (formData.licence && formData.licence.size > 5 * 1024 * 1024) {
      window.alert("La licence ne doit pas depasser 5 Mo.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await registerPartner({
        pharmacie_nom: formData.nomPharmacie.trim(),
        adresse: formData.adresseComplete.trim(),
        ville: formData.villeExercice.trim() || undefined,
        telephone,
        email: formData.email.trim(),
        titulaire_nom: formData.nomPharmacie.trim(),
        titulaire_prenom: "Titulaire",
        password: formData.heureOuvrables,
        password_confirmation: formData.confirmPassword,
        licence_pharmaceutique: formData.licence ?? undefined,
      });

      saveAuthSession({
        userType: "user",
        token: response.data.token,
        tokenType: response.data.token_type,
        profile: response.data.user ?? null,
        permissions: response.data.permissions ?? [],
      });

      window.alert(response.message ?? "Inscription réussie.");
      router.push("/partenaire/dashboard");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        window.alert(error.message);
      } else {
        window.alert("Une erreur est survenue pendant l'inscription.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFormData({ ...formData, licence: file });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[900px] flex flex-col items-center">
        {/* Logo */}
        <div className="mb-4">
          <Image
            src="/images/logo.png"
            alt="Toni360"
            width={150}
            height={55}
            className="mx-auto"
            priority
          />
        </div>

        {/* Titre */}
        <h1
          className="text-4xl font-bold text-center mb-10"
          style={{ color: "#137551" }}
        >
          Inscription
        </h1>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="w-full">
          {/* Grille deux colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Nom officiel de la pharmacie */}
            <div>
              <input
                type="text"
                placeholder="Nom officiel de la pharmacie"
                value={formData.nomPharmacie}
                onChange={(e) =>
                  setFormData({ ...formData, nomPharmacie: e.target.value })
                }
                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Adresse complète */}
            <div>
              <input
                type="text"
                placeholder="Adresse complète"
                value={formData.adresseComplete}
                onChange={(e) =>
                  setFormData({ ...formData, adresseComplete: e.target.value })
                }
                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Téléphone avec indicatif +229 */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#137551]">
              <div className="flex items-center gap-1.5 px-3 border-r border-gray-300 bg-white">
                <span className="text-lg leading-none">{beninCode.flag}</span>
                <select
                  value={formData.indicatif}
                  onChange={(e) =>
                    setFormData({ ...formData, indicatif: e.target.value })
                  }
                  className="bg-transparent text-sm text-gray-700 focus:outline-none py-3.5 pr-1 appearance-none cursor-pointer"
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
                className="flex-1 px-3 py-3.5 focus:outline-none text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Jour d'ouverture */}
            <div>
              <input
                type="text"
                placeholder="Jour d'ouverture"
                value={formData.jourOuverture}
                onChange={(e) =>
                  setFormData({ ...formData, jourOuverture: e.target.value })
                }
                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Adresse mail */}
            <div>
              <input
                type="email"
                placeholder="Adresse mail"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Mot de pass */}
            <div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de pass"
                value={formData.heureOuvrables}
                onChange={(e) =>
                  setFormData({ ...formData, heureOuvrables: e.target.value })
                }
                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Ville d'exercice */}
            <div>
              <input
                type="text"
                placeholder="Ville d&#39;exercice"
                value={formData.villeExercice}
                onChange={(e) =>
                  setFormData({ ...formData, villeExercice: e.target.value })
                }
                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Confirmer le mot de passe */}
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Soumission licence pharmaceutique */}
          <div className="mt-8 flex items-center justify-start gap-4">
            <span className="text-lg font-semibold" style={{ color: "#137551" }}>
              Soumission de votre licence pharmaceutique
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-full flex items-center justify-center border-2 transition hover:opacity-80"
              style={{ borderColor: "#137551", color: "#137551" }}
              title="Télécharger votre licence"
            >
              <Download size={28} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {fileName && (
            <p className="text-center text-xs text-gray-500 mt-1">{fileName}</p>
          )}

          {/* Bouton S'inscrire */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-white font-bold text-base rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: "#137551" }}
            >
              {submitting ? "Inscription..." : "S\'inscrire"}
            </button>
          </div>
        </form>

        {/* Lien connexion */}
        <p className="text-center mt-8 text-lg text-gray-700">
          Déjà un compte ?{" "}
          <Link
            href="/partenaire/connexion"
            className="font-bold hover:underline"
            style={{ color: "#137551", fontSize: "1.18rem" }}
          >
            Connectez-vous
          </Link>
        </p>

        {/* Texte légal */}
        <p className="text-center mt-3 text-sm text-gray-500">
          En cliquant sur s&apos;inscrire, vous Acceptez{" "}
          <Link
            href="/return-policy"
            className="font-semibold hover:underline"
            style={{ color: "#137551" }}
          >
            nos Conditions d&apos;utilisation et la Politique de confidentialité.
          </Link>
        </p>
      </div>
    </div>
  );
}