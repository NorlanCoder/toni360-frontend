/**
 * Composant Header - Barre de navigation fixée en haut
 * Contient le logo et les boutons d'authentification
 */
"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    // Position absolute pour superposer sur l'image de fond
    // z-10 pour être au-dessus du Hero
    <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-white/90 backdrop-blur-sm">
      {/* Container avec largeur max et centré */}
      <div className="max-w-[98vw] xl:max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Logo Toni360 à gauche */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-toni-green">Toni360</span>
        </div>

        {/* Boutons d'authentification à droite - cachés sur mobile */}
        <div className="hidden md:flex items-center gap-4">
          {/* Bouton Se connecter - outline vert */}
          <Link href="/connexion" className="px-6 py-2 border-2 border-toni-green-dark-2 text-toni-green-dark-2 font-bold rounded-full hover:bg-toni-green-dark-2 hover:text-white transition">
            Se connecter
          </Link>
          {/* Bouton S'inscrire - fond vert (toni-green) */}
          <Link href="/inscription" className="px-6 py-2 bg-toni-green-dark-2 text-white rounded-full hover:bg-toni-green-dark transition">
            S&apos;inscrire
          </Link>
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
              // Icône X pour fermer
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              // Icône hamburger
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menu mobile - affiché quand isMenuOpen est true */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 px-6 py-4 bg-white/95 rounded-lg backdrop-blur-sm shadow-lg">
          <div className="flex flex-col gap-3">
            <Link href="/connexion" className="w-full px-6 py-3 border-2 border-toni-green-dark-2 text-toni-green-dark-2 font-bold rounded-full hover:bg-toni-green-dark-2 hover:text-white transition text-center">
              Se connecter
            </Link>
            <Link href="/inscription" className="w-full px-6 py-3 bg-toni-green text-white rounded-full hover:bg-toni-green-dark transition text-center">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
