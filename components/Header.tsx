/**
 * Composant Header - Barre de navigation fixée en haut
 * Contient le logo et les boutons d'authentification
 */
"use client";

import Link from "next/link";
import { useState } from "react";
import { FaLocationArrow } from "react-icons/fa6";
import { Users, X, LayoutDashboard } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";

type ModalMode = "connexion" | "inscription" | null;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const session = getAuthSession();
  const dashboardHref = session?.userType === "user"
    ? "/partenaire/dashboard"
    : session?.userType === "patient"
    ? "/client/accueil"
    : null;

  const openModal = (mode: ModalMode) => {
    setIsMenuOpen(false);
    setModalMode(mode);
  };

  const closeModal = () => setModalMode(null);

  return (
    <>
      {/* Position absolute pour superposer sur l'image de fond */}
      {/* z-10 pour être au-dessus du Hero */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-white/90 backdrop-blur-sm">
        {/* Container avec largeur max et centré */}
        <div className="max-w-[98vw] xl:max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Logo Toni360 à gauche */}
          <div className="flex items-center">
            <img src="/images/logo.png" alt="Logo Toni360" className="h-12 w-auto" />
          </div>

          {/* Boutons d'authentification à droite - cachés sur mobile */}
          <div className="hidden md:flex items-center gap-4">
            {dashboardHref ? (
              <Link
                href={dashboardHref}
                className="flex items-center gap-2 px-6 py-2 bg-toni-green-dark-2 text-white font-bold rounded-full hover:bg-toni-green-dark transition"
              >
                <LayoutDashboard size={18} />
                Mon espace
              </Link>
            ) : (
              <>
                {/* Bouton Se connecter - outline vert */}
                <button
                  onClick={() => openModal("connexion")}
                  className="px-6 py-2 border-2 border-toni-green-dark-2 text-toni-green-dark-2 font-bold rounded-full hover:bg-toni-green-dark-2 hover:text-white transition"
                >
                  Se connecter
                </button>
                {/* Bouton S'inscrire - fond vert (toni-green) */}
                <button
                  onClick={() => openModal("inscription")}
                  className="px-6 py-2 bg-toni-green-dark-2 text-white rounded-full hover:bg-toni-green-dark transition"
                >
                  S&apos;inscrire
                </button>
              </>
            )}
          </div>

          {/* Bouton hamburger - visible uniquement sur mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-toni-green focus:outline-none"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu mobile - affiché quand isMenuOpen est true */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 px-6 py-4 bg-white/95 rounded-lg backdrop-blur-sm shadow-lg">
            <div className="flex flex-col gap-3">
              {dashboardHref ? (
                <Link
                  href={dashboardHref}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-toni-green-dark-2 text-white font-bold rounded-full hover:bg-toni-green-dark transition text-center"
                >
                  <LayoutDashboard size={18} />
                  Mon espace
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => openModal("connexion")}
                    className="w-full px-6 py-3 border-2 border-toni-green-dark-2 text-toni-green-dark-2 font-bold rounded-full hover:bg-toni-green-dark-2 hover:text-white transition text-center"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => openModal("inscription")}
                    className="w-full px-6 py-3 bg-toni-green text-white rounded-full hover:bg-toni-green-dark transition text-center"
                  >
                    S&apos;inscrire
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modal de sélection du profil */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl px-8 py-10 max-w-sm w-full mx-4 flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Fermer"
            >
              <X size={22} />
            </button>

            {/* Question */}
            <h2 className="text-xl font-bold text-gray-800 text-center">
              Que voulez-vous faire ?
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3 w-full">
              <Link
                href={`/client/${modalMode}`}
                onClick={closeModal}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-toni-green-dark-2 text-toni-green-dark-2 font-bold rounded-full hover:bg-toni-green-dark-2 hover:text-white transition w-full"
              >
                <FaLocationArrow size={18} />
                Trouver mes médicaments
              </Link>
              <Link
                href={`/partenaire/${modalMode}`}
                onClick={closeModal}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-toni-green-dark-2 text-white font-bold rounded-full hover:bg-toni-green-dark transition w-full"
              >
                <Users size={18} />
                Devenir partenaire
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
