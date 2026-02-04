
export default function Hero() {
  return (
    // Section pleine hauteur (min-h-screen) avec contenu centré
    <section className="relative min-h-screen flex flex-col items-center justify-center">
      
      {/* Image de fond avec effet blur et overlay sombre */}
      <div className="absolute inset-0 -z-10">
        {/* Overlay noir transparent (40%) pour assombrir l'image */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Image de fond de pharmacie avec effet blur */}
        <div 
          className="w-full h-full bg-cover bg-center blur-sm"
          style={{ backgroundImage: "url('/images/pharmacy-bg.jpg')" }}
        ></div>
      </div>

      {/* Contenu principal centré */}
      <div className="text-center px-6 max-w-4xl">
        {/* Titre principal responsive (taille augmente sur grands écrans) */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-12">
          Accédez rapidement à vos médicaments<br />
          ou rejoignez notre réseau de pharmacies
        </h1>

        {/* Container des boutons - vertical sur mobile, horizontal sur desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          {/* Bouton Patient - fond blanc */}
          <button className="px-8 py-4 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition flex items-center gap-2 min-w-[260px]">
            <span>🔍</span>
            Trouvez vos médicaments
          </button>
          
          {/* Bouton Pharmacie - fond vert */}
          <button className="px-8 py-4 bg-toni-green text-white rounded-full hover:bg-toni-green-dark transition flex items-center gap-2 min-w-[260px]">
            <span>👥</span>
            Devenez partenaire
          </button>
        </div>
      </div>
    </section>
  );
}
