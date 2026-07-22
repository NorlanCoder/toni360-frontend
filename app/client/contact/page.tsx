"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Tab Navigation Component
function TabNavigation() {
  const [activeTab, setActiveTab] = useState("Contacts");

  const tabs = [
    { name: "A propos", href: "/about" },
    { name: "Contacts", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Conditions générales d'utilisation", href: "/cgu" },
    { name: "Politique de confidentialité", href: "/confidentialite" },
  ];

  return (
    <nav className="flex items-center justify-between gap-1 py-2">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          href={tab.href}
          onClick={() => setActiveTab(tab.name)}
          className={`pb-4 text-xl relative transition-colors whitespace-nowrap ${
            activeTab === tab.name
              ? "text-black font-semibold"
              : "text-gray-500 hover:text-black"
          }`}
        >
          {tab.name}
          {activeTab === tab.name && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#008F4F]"></div>
          )}
        </Link>
      ))}
    </nav>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        {/* Logo and Title Section */}
        <div className="w-full px-8 lg:px-16 xl:px-24 py-6">
          <div className="flex items-center gap-4">
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
        </div>

        {/* Tab Navigation - Full Width */}
        <div className="w-full border-b border-gray-200">
          <div className="px-8 lg:px-16 xl:px-24">
            <TabNavigation />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-8 lg:px-16 xl:px-24 py-12">
        <div className="max-w-xl">
          {/* Introduction */}
          <p className="text-gray-700 text-xl leading-relaxed mb-8">
            Nous sommes ici pour vous aider ! Pour toute question ou besoin
            d&apos;assistance, n&apos;hésitez pas à nous contacter. Notre équipe
            est à votre disposition pour garantir une expérience optimale sur
            notre plateforme.
          </p>

          {/* Coordonnées */}
          <div className="mb-10">
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <span className="font-medium">Email</span>
                <span className="mx-2">:</span>
                <a
                  href="mailto:contact@toni360.com"
                  className="text-[#008F4F] underline hover:underline"
                >
                  contact@toni360.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <span className="font-medium">Téléphone</span>
                <span className="mx-2">:</span>
                <a href="tel:+2290129111487" className="text-[#008F4F] underline hover:underline">+229 01 29 11 14 87</a>
              </li>
            </ul>
          </div>

          {/* Suivez-nous */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-black mb-3">Suivez-nous</h2>
            <p className="text-gray-700 text-xl leading-relaxed mb-4">
              Restez à jour avec nos dernières nouvelles et mises à jour en nous
              suivant sur les réseaux sociaux
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mb-8">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/images/facebook.png"
                  alt="Facebook"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/images/instagramm.png"
                  alt="Instagram"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/images/twitter.png"
                  alt="Twitter"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </a>
            </div>
          </div>

          {/* FAQ Redirect */}
          <p className="text-gray-700 text-xl leading-relaxed">
            Pour des réponses rapides à vos questions fréquentes sur
            l&apos;utilisation de notre plateforme, la recherche de médicaments,
            et d&apos;autres sujets, consultez notre FAQ.
          </p>
        </div>
      </main>
    </div>
  );
}
