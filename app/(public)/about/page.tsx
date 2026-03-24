export default function AboutPage() {
  return (
    <main className="max-w-7xl mx-auto px-1 py-12">
        {/* Titre de la section */}
      

        {/* ── LIGNE 1 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-12 py-8 ">
          {/* Colonne gauche : texte */}
          <div className="">
            <h2 className="md:text-[32px] text-[20px] font-bold text-gray-900 mb-3">
              À propos de nous
            </h2>
            <p className="text-gray-600 text-xl leading-relaxed">
             Bienvenue sur notre plateforme, votre partenaire pour un accès simplifié aux soins de santé. Notre objectif est de transformer la façon dont vous accédez aux médicaments et aux services de santé.
            </p>
          </div>

          {/* Colonne droite : placeholder vidéo */}
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center text-[15px]">
            <img src="/images/ph5.png" alt="" />
          </div>
        </div>
        
        {/* ── LIGNE 2 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 py-8">
          {/* Colonne gauche : placeholder vidéo */}
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center text-[15px]">
            <img src="/images/ph8.jpg" alt="" />
          </div>

          {/* Colonne droite : texte */}
          <div className="text-[15px]">
            <h2 className="md:text-[32px] text-[20px] font-bold text-gray-900 mb-3">
              Notre mission
            </h2>
            <p className="text-gray-600 text-xl leading-relaxed">
            Nous avons pour mission d’éliminer les obstacles à l’accès aux soins en utilisant des technologies accessibles à tous. Chaque individu mérite des soins de santé de qualité, indépendamment de son statut socio-économique. Grâce à notre plateforme, nous facilitons l’accès aux médicaments essentiels, simplifions le parcours de soins et optimisons la gestion des pharmacies. En forgeant des liens solides entre patients, pharmaciens et institutions de santé, nous construisons un écosystème où chaque voix est entendue et chaque besoin satisfait.
            </p>
          </div>
        </div>
  </main>
  );
}