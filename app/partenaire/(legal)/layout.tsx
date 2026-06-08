"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NAV_LINKS = [
  { label: "À propos", href: "/partenaire/about" },
  { label: "Contacts", href: "/partenaire/contacts" },
  { label: "FAQ", href: "/partenaire/faq" },
  { label: "Conditions générales d'utilisation", href: "/partenaire/cgu" },
  { label: "Politique de confidentialité", href: "/partenaire/privacy" },
];

export default function PartenairePublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ──────────── HEADER ──────────── */}
      <header className="bg-white">
        {/* Top bar : logo + titre */}
        <div className="max-w-8xl mx-auto px-4 pt-4 pb-2 md:pt-6 md:pb-3 flex items-center gap-3">
          <Link href="/partenaire/dashboard">
            <img
              src="/images/logo.png"
              alt="Toni360"
              width={120}
              height={40}
              className="object-contain w-16 md:w-28"
            />
          </Link>
          <span className="text-lg md:text-3xl text-black font-light">
            Centre d&apos;aide Partenaire
          </span>
        </div>

        {/* Navigation horizontale */}
        <nav className="w-full px-4 md:px-12 pb-0 overflow-x-auto">
          <ul className="max-w-7xl mx-auto flex gap-5 md:gap-12 text-sm md:text-xl text-gray-600 whitespace-nowrap md:flex-wrap md:justify-between">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`inline-block pb-3 transition font-medium ${
                      isActive
                        ? "text-toni-green-dark-2 font-semibold border-b-2 border-toni-green-dark"
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
      <div className="max-w-8xl mx-auto px-4 py-10 w-full">{children}</div>
    </div>
  );
}
