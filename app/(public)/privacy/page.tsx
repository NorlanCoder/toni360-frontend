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
          <section className="text-base md:text-lg">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10">
              Politique de Confidentialité
            </h1>

            <p className="text-gray-700 leading-relaxed mb-10 text-lg md:text-xl">
              Nous attachons une grande importance à la protection de vos données
              personnelles et à la transparence sur la manière dont nous les
              utilisons. Cette politique de confidentialité décrit comment nous
              collectons, utilisons, partageons et protégeons vos informations
              personnelles lorsque vous utilisez notre plateforme.
            </p>

            {/* Section 1 */}
            <div id="section-1" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                1. Collecte des données personnelles
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Lorsque vous utilisez notre plateforme, nous collectons plusieurs
                types de données personnelles vous concernant, notamment :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
                <li>
                  <span className="font-medium">Informations d&apos;identification :</span>{" "}
                  nom, adresse email, numéro de téléphone.
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

            {/* Section 2 */}
            <div id="section-2" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                2. Utilisation des données personnelles
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous utilisons vos données personnelles pour les finalités suivantes :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  <span className="font-medium">Prestation de services :</span>{" "}
                  pour localiser les pharmacies proches de vous, traiter vos
                  commandes, et faciliter la mise en relation entre vous et les
                  pharmacies partenaires.
                </li>
                <li>
                  <span className="font-medium">Gestion du compte :</span>{" "}
                  pour créer et gérer votre compte utilisateur sur notre plateforme.
                </li>
                <li>
                  <span className="font-medium">Communication :</span>{" "}
                  pour vous envoyer des notifications importantes concernant votre
                  commande ou d&apos;autres services, ainsi que des offres ou
                  informations pertinentes.
                </li>
                <li>
                  <span className="font-medium">Amélioration des services :</span>{" "}
                  pour analyser l&apos;utilisation de la plateforme et améliorer
                  continuellement l&apos;expérience utilisateur.
                </li>
                <li>
                  <span className="font-medium">Respect des obligations légales :</span>{" "}
                  pour nous conformer aux lois et réglementations applicables,
                  notamment en matière de santé.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div id="section-3" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                3. Partage des données personnelles
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vos données personnelles sont partagées uniquement dans les cas
                suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
                <li>
                  <span className="font-medium">Avec les pharmacies partenaires :</span>{" "}
                  lorsque vous passez une commande, nous transmettons les
                  informations nécessaires à la pharmacie concernée pour le
                  traitement de votre demande.
                </li>
                <li>
                  <span className="font-medium">Avec nos prestataires de services :</span>{" "}
                  ces entreprises peuvent avoir accès à vos données dans le cadre
                  de la fourniture de services tels que l&apos;hébergement de la
                  plateforme, le traitement des paiements, ou l&apos;envoi de
                  communications.
                </li>
                <li>
                  <span className="font-medium">En cas d&apos;obligations légales :</span>{" "}
                  si la loi l&apos;exige, nous pouvons être amenés à divulguer vos
                  informations aux autorités compétentes.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Nous ne vendons ni ne louons jamais vos données personnelles à des
                tiers à des fins commerciales.
              </p>
            </div>

            {/* Section 4 */}
            <div id="section-4" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                4. Sécurité des données
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et
                organisationnelles pour protéger vos données personnelles contre
                toute perte, accès non autorisé, divulgation ou destruction. Ces
                mesures comprennent :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
                <li>Le chiffrement des données sensibles (notamment les informations de paiement).</li>
                <li>L&apos;utilisation de protocoles sécurisés (HTTPS).</li>
                <li>Un contrôle strict des accès internes aux données.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Bien que nous fassions tout notre possible pour protéger vos
                données, aucune méthode de transmission sur Internet ou de
                stockage électronique n&apos;est complètement sécurisée. Nous vous
                encourageons à prendre des précautions pour protéger vos
                informations en ligne.
              </p>
            </div>

            {/* Section 5 */}
            <div id="section-5" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                5. Durée de conservation des données
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous conservons vos données personnelles aussi longtemps que
                nécessaire pour les finalités décrites dans cette politique, ou
                aussi longtemps que la loi l&apos;exige. Si vous fermez votre
                compte, nous supprimerons ou anonymiserons vos données, à moins
                que la loi ne nous impose de les conserver pour une période donnée.
              </p>
            </div>

            {/* Section 6 */}
            <div id="section-6" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                6. Vos droits concernant vos données personnelles
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Vous disposez de plusieurs droits concernant vos données
                personnelles :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
                <li>
                  <span className="font-medium">Accès :</span>{" "}
                  Vous pouvez demander l&apos;accès aux données que nous détenons
                  à votre sujet.
                </li>
                <li>
                  <span className="font-medium">Rectification :</span>{" "}
                  Si vos données sont inexactes ou incomplètes, vous pouvez
                  demander leur correction.
                </li>
                <li>
                  <span className="font-medium">Suppression :</span>{" "}
                  Vous pouvez demander la suppression de vos données, sous réserve
                  des obligations légales.
                </li>
                <li>
                  <span className="font-medium">Opposition :</span>{" "}
                  Vous pouvez vous opposer à l&apos;utilisation de vos données dans
                  certains cas, notamment pour des finalités de marketing.
                </li>
                <li>
                  <span className="font-medium">Portabilité :</span>{" "}
                  Vous pouvez demander à recevoir une copie de vos données dans un
                  format électronique structuré.
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Pour exercer ces droits, vous pouvez nous contacter à
                l&apos;adresse mentionnée dans la section Contactez-nous.
              </p>
            </div>

            {/* Section 7 */}
            <div id="section-7" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                7. Cookies et technologies similaires
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous utilisons des cookies et des technologies similaires pour
                améliorer votre expérience sur notre plateforme. Les cookies nous
                permettent de :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
                <li>Mémoriser vos préférences et informations de connexion.</li>
                <li>
                  Suivre l&apos;utilisation de la plateforme pour analyser et
                  optimiser les services.
                </li>
                <li>Vous proposer des publicités personnalisées.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Vous pouvez configurer votre navigateur pour refuser les cookies
                ou les supprimer, mais cela pourrait limiter certaines
                fonctionnalités de la plateforme.
              </p>
            </div>

            {/* Section 8 */}
            <div id="section-8" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                8. Modifications de la politique de confidentialité
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Nous pouvons être amenés à mettre à jour cette politique de
                confidentialité pour refléter les changements de nos pratiques ou
                des obligations légales. En cas de modification majeure, nous vous
                en informerons par email ou via un avis sur notre plateforme.
              </p>
            </div>

            {/* Section 9 */}
            <div id="section-9" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                9. Contactez-nous
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Si vous avez des questions concernant cette politique de
                confidentialité ou la manière dont nous traitons vos données
                personnelles, vous pouvez nous contacter via notre Centre
                d&apos;aide ou à l&apos;adresse email suivante :{" "}
                <a
                  href="mailto:contact@toni360.com"
                  className="text-green-600 hover:text-green-700 underline"
                >
                  contact@toni360.com
                </a>
                .
              </p>
            </div>
          </section>
        </div>
    </main>
  );
}