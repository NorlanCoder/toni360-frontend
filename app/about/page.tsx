"use client";

import { useState } from "react";
import Image from "next/image";

// Logo Icon Component
function Toni360Logo() {
  return (
    <div className="flex items-center ">
      <Image
        src="/images/logo.png" 
        alt="Toni360"
        width={120}
        height={40} 
        className="object-contain"
      />
    </div>
  );
}

// Tab Navigation Component
function TabNavigation() {
  const [activeTab, setActiveTab] = useState("A propos");

  const tabs = [
    "A propos",
    "Contacts",
    "FAQ",
    "Conditions générales d'utilisation",
    "Politiques de confidentialité",
  ];

  return (
    <nav className="flex items-center gap-8 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-4 text-sm relative transition-colors whitespace-nowrap ${
            activeTab === tab
              ? "text-black font-semibold"
              : "text-gray-500 hover:text-black"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-50"></div>
          )}
        </button>
      ))}
    </nav>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-green-40">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="w-full px-8 lg:px-12 py-6">
          {/* Logo and Title Section */}
          <div className="flex items-center gap-4 mb-6">
            <Toni360Logo />
            <span className="text-2xl text-black font-light">
              Centre d&apos;aide
            </span>
          </div>

          {/* Tab Navigation */}
          <TabNavigation />
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-8 lg:px-12 py-16">
        {/* About Us Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-24">
          {/* Left Column - Text */}
          <div className="flex flex-col justify-start pt-20 ml-48">
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
              À propos de nous
            </h2>
            <p className="text-gray-600 text-xl leading-relaxed max-w-md">
              Bienvenue sur notre plateforme, votre partenaire pour un accès
              simplifié aux soins de santé. Notre objectif est de transformer la
              façon dont vous accédez aux médicaments et aux services de santé.
            </p>
          </div>

          {/* Right Column - Image with Green Background */}
          <div className="relative flex justify-end">
            {/* Green block behind */}
            <div className="absolute top-8 right-0 w-[70%] h-[80%] bg-[#008F4F] rounded-lg"></div>
            {/* Image card */}
            <div className="relative w-[75%] bg-white rounded-lg shadow-lg overflow-hidden z-10 h-[400px]">
              <Image
                src="/images/ph 5.png"
                alt="About Us"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Image */}
          <div className="relative">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden relative h-[400px]">
              <Image
                src="/images/ph3.jpeg"
                alt="Notre mission"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Column - Text */}
          <div className="flex flex-col justify-center pt-20 pl-16 lg:pl-20 ml-48">
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
              Notre mission
            </h2>
            <p className="text-gray-600 text-xl leading-relaxed max-w-md">
              Nous avons pour mission d&apos;éliminer les obstacles à
              l&apos;accès aux soins en utilisant des technologies accessibles à
              tous. Chaque individu mérite des soins de qualité, et nous
              travaillons chaque jour pour rendre cela possible.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
