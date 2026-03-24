export default function ContactsPage() {
  return (
    <main className="max-w-7xl mx-auto px-1 py-12 text-[15px] text-gray-700 space-y-8">

      {/* Intro */}
      <p className="leading-relaxed">
        Nous sommes ici pour vous aider ! Pour toute question ou besoin d&apos;assistance,
        n&apos;hésitez pas à nous contacter. Notre équipe est à votre disposition pour
        garantir une expérience optimale sur notre plateforme.
      </p>

      {/* Coordonnées */}
      <ul className="space-y-2 pl-4">
        <li className="flex items-center gap-2">
          <span className="text-gray-400">•</span>
          <span className="w-24 font-medium">Email</span>
          <span className="text-gray-400">:</span>
          <a href="mailto:support@votresite.com" className="text-green-600 underline hover:text-green-700">
            support@votresite.com
          </a>
        </li>
        <li className="flex items-center gap-2">
          <span className="text-gray-400">•</span>
          <span className="w-24 font-medium">Téléphone</span>
          <span className="text-gray-400">:</span>
          <span>+229 12 34 56 78.</span>
        </li>
      </ul>

      {/* Réseaux sociaux */}
      <div>
        <h2 className="font-bold text-gray-900 mb-2">Suivez-nous</h2>
        <p className="leading-relaxed mb-4">
          Restez à jour avec nos dernières nouvelles et mises à jour en nous suivant sur les réseaux sociaux
        </p>
        <div className="flex items-center gap-4">
          {/* Facebook */}
          <a href="#" aria-label="Facebook" className="hover:opacity-80 transition">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#1877F2"/>
              <path d="M26 13h-3c-1.1 0-2 .9-2 2v3h5l-.7 5H21v12h-5V23h-3v-5h3v-3c0-3.3 2.7-6 6-6h3v4z" fill="white"/>
            </svg>
          </a>
          {/* Instagram */}
          <a href="#" aria-label="Instagram" className="hover:opacity-80 transition">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="url(#ig)"/>
              <defs>
                <radialGradient id="ig" cx="30%" cy="100%" r="120%">
                  <stop offset="0%" stopColor="#FFDC80"/>
                  <stop offset="30%" stopColor="#F56040"/>
                  <stop offset="65%" stopColor="#C13584"/>
                  <stop offset="100%" stopColor="#3051F1"/>
                </radialGradient>
              </defs>
              <rect x="11" y="11" width="18" height="18" rx="5" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="20" cy="20" r="4.5" stroke="white" strokeWidth="2" fill="none"/>
              <circle cx="25.5" cy="14.5" r="1" fill="white"/>
            </svg>
          </a>
          {/* X (Twitter) */}
          <a href="#" aria-label="X" className="hover:opacity-80 transition">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="black"/>
              <path d="M22.3 18.5L28.6 11h-1.5l-5.5 6.4L17 11h-5l6.6 9.6L11.4 29h1.5l5.8-6.7 4.6 6.7H28l-5.7-10.5zm-2 2.3l-.7-1L13.5 12h2.3l4.3 6.2.7 1 5.7 8.2h-2.3l-4.9-7.6z" fill="white"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Renvoi FAQ */}
      <p className="leading-relaxed">
        Pour des réponses rapides à vos questions fréquentes sur l&apos;utilisation de notre
        plateforme, la recherche de médicaments, et d&apos;autres sujets, consultez notre FAQ.
      </p>

    </main>
  );
}