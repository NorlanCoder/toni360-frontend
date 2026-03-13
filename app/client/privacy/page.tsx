"use client";

import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "A propos", href: "/about" },
  { label: "Contacts", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Conditions générales de retour", href: "#" },
  { label: "Politiques de confidentialité", href: "/privacy" },
];

const sideMenuSections = [
  "Collecte des données personnelles",
  "Utilisation des données personnelles",
  "Partage des données personnelles",
  "Sécurité des données",
  "Durée de conservation des données",
  "Vos droits concernant vos données personnelles",
  "Cookies et technologies similaires",
  "Modifications de la politique de confidentialité",
  "Contactez-nous",
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 mx-2 md:mx-8 px-2 md:px-4">
      {/* ──────────── HEADER ──────────── */}
      <header className="bg-white shadow-sm">
        {/* Top bar : logo + titre */}
        <div className="max-w-8xl mx-auto px-4 pt-6 pb-3 flex items-center gap-4">
          <Image
            src="/images/logo.png"
            alt="Toni360"
            width={120}
            height={40}
            className="object-contain"
          />
          <span className="text-3xl text-black font-light">
            Centre d&apos;aide
          </span>
        </div>

        {/* Navigation horizontale */}
        <nav className="w-full px-6 md:px-12 pb-0">
          <ul className="flex flex-wrap gap-8 md:gap-12 text-lg md:text-xl text-gray-600 w-full justify-between">
            {navLinks.map((link) => {
              const isActive = link.label === "Politiques de confidentialité";
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`inline-block pb-3 transition font-medium ${
                      isActive
                        ? "text-green-600 font-semibold border-b-2 border-green-500"
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
      <main className="max-w-8xl mx-auto px-4 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12">
          {/* ── SIDEBAR GAUCHE ── */}
          <aside className="border-r border-gray-200 pr-6">
            <nav>
              <ul className="space-y-4">
                {sideMenuSections.map((section, index) => (
                  <li key={index}>
                    <a
                      href={`#section-${index + 1}`}
                      className="text-green-600 hover:text-green-700 font-medium text-base md:text-lg leading-snug block"
                    >
                      {index + 1}. {section}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* ── CONTENU DROITE ── */}
          <section>
            {/* Titre principal */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Politique de Confidentialité
            </h1>

            {/* Paragraphe d'introduction */}
            <p className="text-gray-700 leading-relaxed mb-10 text-lg md:text-xl">
              Nous attachons une grande importance à la protection de vos données
              personnelles et à la transparence sur la manière dont nous les
              utilisons. Cette politique de confidentialité décrit comment nous
              collectons, utilisons, partageons et protégeons vos informations
              personnelles lorsque vous utilisez notre plateforme.
            </p>

            {/* Section 1 */}
            <div id="section-1" className="text-lg md:text-xl">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4">
                1. Collecte des données personnelles
              </h2>

              <p className="text-gray-700 leading-relaxed mb-4">
                Lorsque vous utilisez notre plateforme, nous collectons plusieurs
                types de données personnelles vous concernant, notamment :
              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
                <li>
                  <span className="font-medium">
                    Informations d&apos;identification :
                  </span>{" "}
                  nom, adresse email, numéro de téléphone, adresse postale.
                </li>
                <li>
                  <span className="font-medium">
                    Informations médicales :
                  </span>{" "}
                  données relatives aux médicaments recherchés ou commandés, ainsi
                  que les ordonnances fournies.
                </li>
                <li>
                  <span className="font-medium">
                    Informations de localisation :
                  </span>{" "}
                  adresse de l&apos;utilisateur, localisation GPS pour identifier
                  les pharmacies les plus proches.
                </li>
                <li>
                  <span className="font-medium">Données de paiement :</span>{" "}
                  détails bancaires ou de carte de crédit lorsque vous effectuez
                  des paiements via notre plateforme.
                </li>
              </ul>

              <p className="text-gray-700 leading-relaxed mb-3">
                Ces informations sont collectées lorsque vous :
              </p>

              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Créez un compte sur notre plateforme.</li>
                <li>Effectuez une commande ou utilisez nos services.</li>
                <li>
                  Contactez notre service d&apos;assistance ou interagissez avec
                  nous par tout autre moyen.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
