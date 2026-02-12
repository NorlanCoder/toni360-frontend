"use client";

import { useState } from "react";

export default function AccueilPage() {
  const [userName, setUserName] = useState("Vagelas");

  return (
    <div className="min-h-screen bg-gray-50">
      Accueil - Bienvenue, Mr {userName}
    </div>
  );
}
