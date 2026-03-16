"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "A propos", href: "/client/help/about" },
  { label: "Contacts", href: "/client/help/contacts" },
  { label: "FAQ", href: "/client/help/faq" },
  { label: "CGU", href: "/client/help/return-policy" },
  { label: "Confidentialité", href: "/client/help/privacy" },
];

export default function FAQPage() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 mx-0">
      {/* ──────────── HEADER ──────────── */}
      <header className="bg-white shadow-sm">
        {/* Navigation horizontale */}
        <nav className="max-w-7xl mx-auto px-1 pb-0">
          <ul className="flex flex-wrap gap-12 text-[15px] text-gray-600">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`inline-block pb-3 transition font-medium ${
                      isActive
                        ? "text-green-600 font-semibold border-b-2 border-green-500 text-[15px]"
                        : "hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* ──────────── CONTENU PRINCIPAL ──────────── */}
      <main className="max-w-7xl mx-auto px-1 py-12 ">
        {/* Titre de la section */}
        <h1 className="text-[15px] font-bold text-gray-900 mb-10">
          FAQ - Questions Fréquemment Posées
        </h1>

        {/* ── LIGNE 1 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-64 mb-12 py-8 ">
          {/* Colonne gauche : texte */}
          <div className="text-[15px]">
            <h2 className="text-[15px] font-bold text-gray-900 mb-3">
              1. Qu&apos;est-ce que cette plateforme ?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Nous sommes une plateforme qui connecte les patients aux
              pharmacies, facilitant ainsi l&apos;accès aux médicaments et aux
              soins de santé. Nous ne sommes pas une pharmacie, mais nous vous
              aidons à trouver les produits nécessaires auprès des pharmacies
              partenaires.
            </p>
          </div>

          {/* Colonne droite : placeholder vidéo */}
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center text-[15px]">
            <span className="text-gray-500 text-[15px]">Screen vidéo</span>
          </div>
        </div>
        
        {/* ── LIGNE 2 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-64 py-8">
          {/* Colonne gauche : placeholder vidéo */}
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center text-[15px]">
            <span className="text-gray-500 text-[15px]">Screen vidéo</span>
          </div>

          {/* Colonne droite : texte */}
          <div className="text-[15px]">
            <h2 className="text-[15px] font-bold text-gray-900 mb-3">
              2. Comment puis-je rechercher des médicaments ?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Pour rechercher un médicament, utilisez la barre de recherche sur
              notre page d&apos;accueil. Entrez le nom du produit et nous vous
              indiquerons les pharmacies qui l&apos;ont en stock près de chez
              vous.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}