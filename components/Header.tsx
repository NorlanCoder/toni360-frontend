
export default function Header() {
  return (
    // Position absolute pour superposer sur l'image de fond
    // z-10 pour être au-dessus du Hero
    <header className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
      {/* Container avec largeur max et centré */}
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Toni360 à gauche */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-white">Toni360</span>
        </div>

        {/* Boutons d'authentification à droite */}
        <div className="flex items-center gap-4">
          {/* Bouton Se connecter - outline blanc */}
          <button className="px-6 py-2 border-2 border-white text-white rounded-full hover:bg-white hover:text-gray-900 transition">
            Se connecter
          </button>
          
          {/* Bouton S'inscrire - fond vert (teal-600) */}
          <button className="px-6 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition">
            S&apos;inscrire
          </button>
        </div>
      </div>
    </header>
  );
}
