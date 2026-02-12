
export default function Footer() {
  return (
    // Position absolute en bas, z-10 pour être au-dessus du Hero
    <footer className="absolute bottom-0 left-0 right-0 z-10 px-6 py-6">
      <div className="max-w-7xl mx-auto text-center">
        {/* Liens légaux avec séparateurs (•) */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-white/80 text-sm">
          {/* CGU */}
          <a href="#" className="hover:text-white transition underline">
            Conditions générales d&apos;utilisation
          </a>
          
          {/* Séparateur caché sur mobile, visible sur desktop */}
          <span className="hidden sm:inline">•</span>
          
          {/* Politique de confidentialité */}
          <a href="#" className="hover:text-white transition underline">
            Politiques de confidentialité
          </a>
          
          <span className="hidden sm:inline">•</span>
          
          {/* Contact */}
          <a href="#" className="hover:text-white transition underline">
            Contactez-nous
          </a>
        </div>
      </div>
    </footer>
  );
}
