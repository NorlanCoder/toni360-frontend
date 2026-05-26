import Link from "next/link";

const sideMenuSections = [
  "Objet de l'Application",
  "Utilisation de l'Application",
  "Responsabilités de l'Utilisateur",
  "Protection des données personnelles",
  "Propriété intellectuelle",
  "Modification des CGU",
  "Limitations de responsabilité",
  "Durée et Résiliation",
  "Loi applicable",
];

export default function ReturnPolicyPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 w-full">
      {/* Onglets CGU */}
      <div className="mb-8 flex gap-2">
        <span className="rounded-full bg-green-600 px-5 py-2 text-sm font-bold text-white">
          Patient
        </span>
        <Link
          href="/partenaire/cgu"
          className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Pharmacie
        </Link>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12">
          {/* ── SIDEBAR GAUCHE ── */}
          <aside className="border-r border-gray-200 pr-6">
            <nav>
              <ul className="space-y-6">
                {sideMenuSections.map((section, index) => (
                  <li key={index}>
                    <a
                      href={`#section-${index + 1}`}
                      className="text-green-600 hover:text-green-700 font-medium text-lg md:text-xl leading-snug block"
                    >
                      {index + 1}- {section}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* ── CONTENU DROITE ── */}
          <section className="text-base md:text-lg">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 uppercase">
              Conditions Générales d&apos;Utilisation Toni360
            </h1>

            <p className="text-gray-700 leading-relaxed mb-2 text-lg md:text-xl">
              Les présentes Conditions Générales d&apos;Utilisation (ci-après
              désignées « CGU ») régissent :
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-8 text-lg md:text-xl">
              <li>
                l&apos;accès et l&apos;utilisation de l&apos;application mobile
                Toni360 et du site web Toni360 (ci-après désignés « Application »)
              </li>
              <li>
                les rapports entre l&apos;Application et ses utilisateurs
                (ci-après désignés « Utilisateur » ou « Utilisateurs » de
                l&apos;Application) et s&apos;appliquent sans restriction ni
                réserve pour toute utilisation ou téléchargement de
                l&apos;Application.
              </li>
            </ul>

            <div id="section-1" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">1- Objet de l&apos;Application</h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Toni360 est une application compatible avec différents systèmes
                d&apos;exploitation (iOS, Android) qui permet à ses utilisateurs
                de localiser les pharmacies les plus proches d&apos;eux,
                disposant d&apos;un ou des produit(s) pharmaceutique(s)
                qu&apos;ils recherchent. L&apos;Application permet également aux
                Utilisateurs de passer directement la commande d&apos;un ou des
                produit(s) pharmaceutique(s) auprès des pharmacies.
              </p>
            </div>

            <div id="section-2" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">2- Utilisation de l&apos;Application</h2>
              <p className="text-gray-700 leading-relaxed mb-4 text-lg md:text-xl">
                Le téléchargement de l&apos;Application Toni360 est gratuit.
                Pour accéder à certaines fonctionnalités (telle que la
                possibilité de commander un produit), l&apos;Utilisateur doit
                créer un compte utilisateur en fournissant des informations
                vraies, sincères, complètes et toujours à jour.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                L&apos;Application ne garantit pas la qualité des produits
                fournis par les pharmacies. En cas de litige entre
                l&apos;Utilisateur et une pharmacie sur la qualité des produits,
                la responsabilité de Toni360 ne saurait être engagée.
              </p>
            </div>

            <div id="section-3" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">3- Responsabilités de l&apos;Utilisateur</h2>
              <p className="text-gray-700 leading-relaxed mb-4 text-lg md:text-xl">
                L&apos;Utilisateur s&apos;engage à utiliser l&apos;Application
                conformément à la législation en vigueur, aux présentes CGU, à
                la morale, aux bonnes mœurs et à l&apos;ordre public. En cas
                d&apos;utilisation de l&apos;Application à des fins illégales ou
                frauduleuses, l&apos;Utilisateur sera exposé à des poursuites
                judiciaires et les données permettant son identification pourront
                être fournies aux autorités compétentes en cas de procédure
                judiciaire engagée contre lui.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4 text-lg md:text-xl">
                L&apos;Utilisateur reste seul responsable de tout usage qui
                pourrait être fait de ses identifiants et mot de passe, et de
                leur confidentialité, ainsi que de toute utilisation de son
                Compte personnel. Il s&apos;engage à informer immédiatement
                Toni360 de toute utilisation non autorisée de son compte.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                L&apos;Utilisateur est notamment informé du fait que
                l&apos;utilisation de l&apos;Application peut nécessiter
                l&apos;acceptation de la géolocalisation pour une bonne
                utilisation du service.
              </p>
            </div>

            <div id="section-4" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">4- Protection des données personnelles</h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                En utilisant l&apos;Application, l&apos;Utilisateur consent à la
                collecte et à l&apos;utilisation de ses données personnelles. Les
                données personnelles collectées via l&apos;Application sont
                traitées conformément à la politique de Confidentialité de
                Toni360. L&apos;Application garantit le respect de la vie privée
                de l&apos;utilisateur.
              </p>
            </div>

            <div id="section-5" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">5- Propriété intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                L&apos;Utilisateur ne dispose que d&apos;un droit d&apos;usage
                strictement personnel, non exclusif de l&apos;Application. Tous
                les contenus, y compris les textes, logos et logiciels,
                disponibles sur l&apos;Application sont la propriété de Toni360
                et sont protégés par les lois sur la propriété intellectuelle.
                Toute reproduction ou utilisation non autorisée de ces contenus
                est strictement interdite.
              </p>
            </div>

            <div id="section-6" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">6- Modification des CGU</h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Toni360 se réserve le droit de modifier toute information ou
                contenu figurant dans l&apos;Application, à tout moment et sans
                préavis, dans le cadre de sa mise à jour ou de la correction
                d&apos;erreurs ou d&apos;inexactitudes ou si cela lui semble
                opportun sans que cela ouvre droit à une quelconque réparation
                pour les Utilisateurs.
              </p>
            </div>

            <div id="section-7" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">7- Limitations de responsabilité</h2>
              <p className="text-gray-700 leading-relaxed mb-4 text-lg md:text-xl">
                La responsabilité de Toni360 ne peut être engagée en cas de
                dysfonctionnement du serveur ou du réseau ; de force majeure ou
                d&apos;un fait imprévisible et insurmontable d&apos;un tiers.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Toni360 s&apos;engage à mettre en œuvre tous les moyens
                nécessaires pour garantir la sécurité et la confidentialité des
                données. Toutefois, elle n&apos;apporte pas une garantie de
                sécurité totale.
              </p>
            </div>

            <div id="section-8" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">8- Durée et Résiliation</h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Les présentes CGU sont souscrites pour une durée indéterminée à
                compter de leur acceptation par l&apos;Utilisateur. Toni360 se
                réserve le droit de suspendre ou de résilier l&apos;accès de
                tout Utilisateur à l&apos;Application en cas de non-respect des
                présentes CGU ou pour tout autre motif légitime.
              </p>
            </div>

            <div id="section-9" className="mb-8 text-lg md:text-xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">9- Loi applicable</h2>
              <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
                Les présentes CGU sont régies par la législation béninoise. En
                cas de litige non résolu à l&apos;amiable, les tribunaux de la
                République du Bénin sont compétents pour régler le litige.
              </p>
            </div>
          </section>
        </div>
    </main>
  );
}