const sideMenuSections = [
  "Collecte des données personnelles",
  "Utilisation des données personnelles",
  "Partage des données personnelles",
  "Sécurité des données",
  "Durée de conservation des données",
  "Vos droits concernant vos données personnelles",
  "Cookies et technologies similaires",
  "Modifications de la politique de confidentialité",
  "Contactez-nous",
];

export default function PrivacyPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12">
          {/* ── SIDEBAR GAUCHE ── */}
          <aside className="border-r border-gray-200 pr-6">
            <nav>
              <ul className="space-y-4">
                {sideMenuSections.map((section, index) => (
                  <li key={index}>
                    <a
                      href={`#section-${index + 1}`}
                      className="text-green-600 hover:text-green-700 font-medium text-base md:text-lg leading-snug block"
                    >
                      {index + 1}. {section}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* ── CONTENU DROITE ── */}
          <section>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Politique de Confidentialité
            </h1>

            <p className="text-gray-700 leading-relaxed mb-10 text-lg md:text-xl">
              Nous attachons une grande importance à la protection de vos données
              personnelles et à la transparence sur la manière dont nous les
              utilisons. Cette politique de confidentialité décrit comment nous
              collectons, utilisons, partageons et protégeons vos informations
              personnelles lorsque vous utilisez notre plateforme.
            </p>

            <div id="section-1" className="text-lg md:text-xl">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4">
                1. Collecte des données personnelles
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Lorsque vous utilisez notre plateforme, nous collectons plusieurs
                types de données personnelles vous concernant, notamment :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
                <li>
                  <span className="font-medium">Informations d&apos;identification :</span>{" "}
                  nom, adresse email, numéro de téléphone, adresse postale.
                </li>
                <li>
                  <span className="font-medium">Informations médicales :</span>{" "}
                  données relatives aux médicaments recherchés ou commandés, ainsi
                  que les ordonnances fournies.
                </li>
                <li>
                  <span className="font-medium">Informations de localisation :</span>{" "}
                  adresse de l&apos;utilisateur, localisation GPS pour identifier
                  les pharmacies les plus proches.
                </li>
                <li>
                  <span className="font-medium">Données de paiement :</span>{" "}
                  détails bancaires ou de carte de crédit lorsque vous effectuez
                  des paiements via notre plateforme.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-3">
                Ces informations sont collectées lorsque vous :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Créez un compte sur notre plateforme.</li>
                <li>Effectuez une commande ou utilisez nos services.</li>
                <li>
                  Contactez notre service d&apos;assistance ou interagissez avec
                  nous par tout autre moyen.
                </li>
              </ul>
            </div>
          </section>
        </div>
    </main>
  );
}