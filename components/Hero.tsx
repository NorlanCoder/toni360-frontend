/**
 * Composant Hero - Section principale avec image de fond
 * Affiche le titre et les deux boutons d'action principaux
 */
import { Search, Users } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    // Section pleine hauteur (min-h-screen) avec contenu centré
    <section className="relative min-h-screen flex flex-col items-center justify-center">
      
      {/* Image de fond avec effet blur et overlay */}
      <div className="absolute inset-0 -z-10">
        {/* Overlay pour assombrir et blur */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
        {/* Image de fond de pharmacie */}
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('/images/ph2.jpeg')" }}
        ></div>
      </div>

      {/* Contenu principal centré */}
      <div className="text-center px-6 max-w-4xl">
        {/* Titre principal responsive (taille augmente sur grands écrans) */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-12">
          <span className="text-2xl md:text-3xl lg:text-4xl">Accédez rapidement à vos médicaments</span><br />
          <span className="text-2xl md:text-3xl lg:text-4xl">ou rejoignez notre réseau de pharmacies</span>
        </h1>

        {/* Container des boutons - vertical sur mobile, horizontal sur desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          {/* Bouton Patient - fond blanc */}
          <button className="px-8 py-4 bg-white text-toni-green font-bold rounded-full hover:bg-gray-100 transition flex items-center justify-center gap-2 min-w-[260px]">
            <Search size={20} />
            Trouvez vos médicaments
          </button>
          
          {/* Bouton Pharmacie - fond vert */}
          <Link href="/partenaire/commandes" className="px-8 py-4 bg-toni-green-dark text-white font-bold rounded-full hover:bg-toni-green-dark-2 transition flex items-center justify-center gap-2 min-w-[260px]">
            <Users size={20} />
            Devenez partenaire
          </Link>
        </div>
        {/* Liens légaux */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-white text-sm">
          <a href="#" className="hover:text-white/80 transition underline">
            Conditions générales d&apos;utilisation
          </a>
          <span className="hidden sm:inline">•</span>
          <a href="#" className="hover:text-white/80 transition underline">
            Politiques de confidentialité
          </a>
          <span className="hidden sm:inline">•</span>
          <a href="#" className="hover:text-white/80 transition underline">
            Contactez-nous
          </a>
        </div>      </div>
    </section>
  );
}
