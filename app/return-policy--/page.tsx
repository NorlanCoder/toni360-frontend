"use client";

import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "A propos", href: "/about" },
  { label: "Contacts", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Conditions générales de retour", href: "/return-policy" },
  { label: "Politiques de confidentialité", href: "/privacy" },
];

const sideMenuSections = [
  "Objet de l'Application",
  "Utilisation de l'Application",
  "Responsabilités de l'Utilisateur",
  "Protection des données personnelles",
  "Propriété intellectuelle",
  "Modification des CGU",
  "Limitations de responsabilité",
  "Durée et Résiliation",
  "Loi applicable",
];

export default function ReturnPolicyPage() {
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
              const isActive =
                link.label === "Conditions générales de retour";
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
              <ul className="space-y-6">
                {sideMenuSections.map((section, index) => (
                  <li key={index}>
                    <a
                      href={`#section-${index + 1}`}
                      className="text-green-600 hover:text-green-700 font-medium text-lg md:text-xl leading-snug block"
                    >
                      {index + 1}- {section}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* ── CONTENU DROITE ── */}
          <section className="text-base md:text-lg">
            {/* Bloc d'avertissement */}
            <p className="text-gray-700 leading-relaxed mb-8 text-lg md:text-xl">
              <span className="font-bold">Attention !!</span> Si vous cochez la
              case « Je reconnais avoir lu et accepté les Conditions Générales
              d&apos;Utilisation », vous confirmez avoir pris connaissance des
              présentes CGU et acceptez de vous y soumettre sans réserve. Il est
              donc conseillé aux Utilisateurs de lire attentivement les présentes
              CGU.
            </p>

            {/* Titre principal */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 uppercase">
              Conditions Générales d&apos;Utilisation Toni360
            </h1>

            {/* Paragraphe d'introduction */}
            <p className="text-gray-700 leading-relaxed mb-2 text-lg md:text-xl">
              Les présentes Conditions Générales d&apos;Utilisation (ci-après
              désignées « CGU ») régissent :
            </p>

            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-8 text-lg md:text-xl">
              <li>
                l&apos;accès et l&apos;utilisation de l&apos;application mobile
                Toni360 et du site web Toni360 (ci-après désignés
                « Application »)
              </li>
              <li>
                les rapports entre l&apos;Application et ses utilisateurs
                (ci-après désignés « Utilisateur » ou « Utilisateurs » de
                l&apos;Application) et s&apos;appliquent sans restriction ni
                réserve pour toute utilisation ou téléchargement de
                l&apos;Application.
              </li>
            </ul>

            {/* ── Section 1 ── */}
            <div id="section-1" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                1- Objet de l&apos;Application
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Toni360 est une application compatible avec différents systèmes
                d&apos;exploitation (iOS, Android) qui permet à ses utilisateurs
                de localiser les pharmacies les plus proches d&apos;eux,
                disposant d&apos;un ou des produit(s) pharmaceutique(s)
                qu&apos;ils recherchent. L&apos;Application permet également aux
                Utilisateurs de passer directement la commande d&apos;un ou des
                produit(s) pharmaceutique(s) auprès des pharmacies.
              </p>
            </div>

            {/* ── Section 2 ── */}
            <div id="section-2" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                2- Utilisation de l&apos;Application
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4 text-lg md:text-xl">
                Le téléchargement de l&apos;Application Toni360 est gratuit.
                Pour accéder à certaines fonctionnalités (telle que la
                possibilité de commander un produit), l&apos;Utilisateur doit
                créer un compte personnel en fournissant les informations
                demandées (nom, prénom, adresse email, numéro de téléphone,
                etc.). L&apos;Utilisateur s&apos;engage à fournir des
                informations exactes, complètes et à jour.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                L&apos;Utilisateur est seul responsable de la confidentialité de
                ses identifiants de connexion. Toute utilisation de
                l&apos;Application effectuée avec les identifiants de
                l&apos;Utilisateur sera réputée avoir été faite par ce dernier.
                En cas d&apos;utilisation non autorisée de son compte,
                l&apos;Utilisateur doit en informer immédiatement Toni360.
              </p>
            </div>

            {/* ── Section 3 ── */}
            <div id="section-3" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                3- Responsabilités de l&apos;Utilisateur
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4 text-lg md:text-xl">
                L&apos;Utilisateur s&apos;engage à utiliser l&apos;Application
                conformément aux présentes CGU et à la législation en vigueur.
                Il s&apos;interdit notamment de :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 text-lg md:text-xl">
                <li>
                  Utiliser l&apos;Application à des fins illicites ou non
                  autorisées.
                </li>
                <li>
                  Transmettre des informations fausses ou trompeuses lors de la
                  création de son compte ou lors de toute commande.
                </li>
                <li>
                  Tenter de perturber le fonctionnement de l&apos;Application ou
                  d&apos;accéder à des données non autorisées.
                </li>
                <li>
                  Reproduire, copier ou distribuer tout contenu de
                  l&apos;Application sans autorisation préalable.
                </li>
              </ul>
            </div>

            {/* ── Section 4 ── */}
            <div id="section-4" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                4- Protection des données personnelles
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Toni360 s&apos;engage à protéger les données personnelles de ses
                Utilisateurs conformément à la réglementation en vigueur. Les
                données collectées sont utilisées uniquement dans le cadre du
                fonctionnement de l&apos;Application et ne sont en aucun cas
                cédées à des tiers sans le consentement préalable de
                l&apos;Utilisateur. Pour plus de détails, veuillez consulter
                notre Politique de Confidentialité.
              </p>
            </div>

            {/* ── Section 5 ── */}
            <div id="section-5" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                5- Propriété intellectuelle
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                L&apos;ensemble des éléments composant l&apos;Application
                (textes, images, logos, icônes, logiciels, base de données,
                etc.) est protégé par les lois relatives à la propriété
                intellectuelle. Toute reproduction, représentation, modification
                ou exploitation non autorisée de tout ou partie de ces éléments
                est strictement interdite.
              </p>
            </div>

            {/* ── Section 6 ── */}
            <div id="section-6" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                6- Modification des CGU
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Toni360 se réserve le droit de modifier les présentes CGU à tout
                moment. Les Utilisateurs seront informés de toute modification
                par notification au sein de l&apos;Application ou par email. La
                poursuite de l&apos;utilisation de l&apos;Application après
                modification vaut acceptation des nouvelles CGU.
              </p>
            </div>

            {/* ── Section 7 ── */}
            <div id="section-7" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                7- Limitations de responsabilité
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Toni360 met tout en œuvre pour assurer le bon fonctionnement de
                l&apos;Application. Toutefois, Toni360 ne saurait être tenu
                responsable des interruptions, pannes techniques, erreurs ou
                indisponibilités temporaires de l&apos;Application. De même,
                Toni360 ne garantit pas la disponibilité des produits affichés
                sur l&apos;Application, celle-ci dépendant des stocks des
                pharmacies partenaires.
              </p>
            </div>

            {/* ── Section 8 ── */}
            <div id="section-8" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                8- Durée et Résiliation
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Les présentes CGU sont applicables dès l&apos;inscription de
                l&apos;Utilisateur et pour toute la durée d&apos;utilisation de
                l&apos;Application. L&apos;Utilisateur peut à tout moment
                résilier son compte en contactant le service client de Toni360.
                Toni360 se réserve le droit de suspendre ou de supprimer le
                compte d&apos;un Utilisateur en cas de non-respect des présentes
                CGU.
              </p>
            </div>

            {/* ── Section 9 ── */}
            <div id="section-9" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                9- Loi applicable
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Les présentes CGU sont soumises au droit en vigueur dans le pays
                où Toni360 exerce son activité principale. Tout litige relatif à
                l&apos;interprétation ou à l&apos;exécution des présentes CGU
                sera soumis aux tribunaux compétents du ressort du siège social
                de Toni360.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
