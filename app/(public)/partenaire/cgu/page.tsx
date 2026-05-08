import Link from "next/link";

const sideMenuSections = [
  "Objet de l'Application",
  "Utilisation de l'Application",
  "Responsabilités de la Pharmacie",
  "Protection des données personnelles",
  "Propriété intellectuelle",
  "Modification des CGU",
  "Limitations de responsabilité",
  "Durée et Résiliation",
  "Loi applicable",
];

export default function PartenaireCoguPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 w-full">
      {/* Onglets CGU */}
      <div className="mb-8 flex gap-2">
        <Link
          href="/terms-of-use"
          className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Client
        </Link>
        <span className="rounded-full bg-green-600 px-5 py-2 text-sm font-bold text-white">
          Pharmacie
        </span>
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
              les conditions d&apos;accès et d&apos;utilisation de l&apos;application mobile
              Toni360 et du site web Toni360 (ci-après désignés « Application »)
              par les pharmacies (ci-après « Pharmacie »)
            </li>
            <li>
              les rapports entre l&apos;Application et la Pharmacie et s&apos;appliquent
              sans restriction ni réserve pour toute utilisation ou téléchargement
              de l&apos;Application.
            </li>
          </ul>

          {/* Section 1 */}
          <div id="section-1" className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              1- Objet de l&apos;Application
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3 text-lg md:text-xl">
              Toni360 est une application compatible avec différents systèmes
              d&apos;exploitation (iOS, Android) qui permet à ses Utilisateurs de
              localiser les pharmacies les plus proches d&apos;eux, disposant d&apos;un ou
              des produit(s) pharmaceutique(s) qu&apos;ils recherchent. L&apos;Application
              permet également aux Utilisateurs de passer directement la commande
              d&apos;un ou des produit(s) pharmaceutique(s) auprès des pharmacies.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
              L&apos;Utilisateur est toute personne qui utilise l&apos;Application afin de
              localiser des pharmacies plus proche d&apos;elle, disposant d&apos;un ou des
              produit(s) pharmaceutique(s) dont elle a besoin ; ou toute personne
              qui utilise l&apos;Application pour passer la commande d&apos;un ou des
              produit(s) pharmaceutique(s) auprès d&apos;une pharmacie.
            </p>
          </div>

          {/* Section 2 */}
          <div id="section-2" className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              2- Utilisation de l&apos;Application
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3 text-lg md:text-xl">
              Le téléchargement de l&apos;Application Toni360 est gratuit. Pour
              utiliser l&apos;Application, la Pharmacie doit créer un compte en
              fournissant des informations vraies, sincères, complètes et toujours
              à jour. La Pharmacie doit être dûment enregistrée et être autorisée
              à exercer la vente de produits pharmaceutiques.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3 text-lg md:text-xl">
              La Pharmacie s&apos;engage à mettre à jour l&apos;état des stocks pour refléter
              la disponibilité réelle des produits. En cas de commande d&apos;un
              produit, la Pharmacie s&apos;engage à confirmer la commande dans un bref
              délai. La Pharmacie s&apos;engage à respecter les prix des produits
              qu&apos;elle a affichés via l&apos;Application.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
              L&apos;Application ne garantit pas la qualité des produits fournis par
              les pharmacies. En cas de litige entre l&apos;Utilisateur et la Pharmacie
              sur la qualité des produits, la responsabilité de Toni360 ne saurait
              être engagée.
            </p>
          </div>

          {/* Section 3 */}
          <div id="section-3" className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              3- Responsabilités de la Pharmacie
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3 text-lg md:text-xl">
              La Pharmacie est responsable de l&apos;exactitude des informations
              qu&apos;elles fournissent sur l&apos;Application, notamment la disponibilité
              des produits et les prix.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3 text-lg md:text-xl">
              La Pharmacie s&apos;engage à respecter les lois applicables en matière de
              protection des données personnelles. Elle doit assurer la
              confidentialité des informations transmises via l&apos;Application.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3 text-lg md:text-xl">
              La Pharmacie s&apos;engage à utiliser l&apos;Application conformément à la
              législation en vigueur, à toutes les règlementations en vigueur
              concernant la vente de produits pharmaceutiques, aux présentes CGU,
              à la morale, aux bonnes mœurs et à l&apos;ordre public.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3 text-lg md:text-xl">
              La Pharmacie reste seule responsable de tout usage qui pourrait être
              fait de ses identifiants et mot de passe, et de leur
              confidentialité, ainsi que de toute utilisation de son Compte
              personnel. Elle s&apos;engage à informer immédiatement Toni360 de toute
              utilisation non autorisée de son compte.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
              La Pharmacie est notamment informée du fait que l&apos;utilisation de
              l&apos;Application peut nécessiter l&apos;acceptation de la géolocalisation
              pour une bonne utilisation du service.
            </p>
          </div>

          {/* Section 4 */}
          <div id="section-4" className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              4- Protection des données personnelles
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
              En utilisant l&apos;Application, la Pharmacie consent à connecter sa
              base de stocks à l&apos;Application. Les données confidentielles de la
              base de stocks de la Pharmacie collectées via l&apos;Application sont
              traitées conformément à la politique de confidentialité de Toni360.
              L&apos;Application garantit le respect et la confidentialité du secret
              d&apos;affaires de la Pharmacie.
            </p>
          </div>

          {/* Section 5 */}
          <div id="section-5" className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              5- Propriété intellectuelle
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
              La Pharmacie ne dispose que d&apos;un droit d&apos;usage strictement
              personnel, non exclusif de l&apos;Application. Tous les contenus, y
              compris les textes, logos et logiciels, disponibles sur
              l&apos;Application sont la propriété de Toni360 et sont protégés par les
              lois sur la propriété intellectuelle. Toute reproduction ou
              utilisation non autorisée de ces contenus est strictement interdite.
            </p>
          </div>

          {/* Section 6 */}
          <div id="section-6" className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              6- Modification des CGU
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
              Toni360 se réserve le droit de modifier toute information ou
              contenu figurant dans l&apos;Application, à tout moment et sans préavis,
              dans le cadre de sa mise à jour ou de la correction d&apos;erreurs ou
              d&apos;inexactitudes ou si cela lui semble opportun sans que cela ouvre
              droit à une quelconque réparation pour la Pharmacie.
            </p>
          </div>

          {/* Section 7 */}
          <div id="section-7" className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              7- Limitations de responsabilité
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3 text-lg md:text-xl">
              La responsabilité de Toni360 ne peut être engagée en cas de
              dysfonctionnement du serveur ou du réseau ; de force majeure ou
              d&apos;un fait imprévisible et insurmontable d&apos;un tiers.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
              Toni360 s&apos;engage à mettre en œuvre tous les moyens nécessaires pour
              garantir la sécurité et la confidentialité des données.
            </p>
          </div>

          {/* Section 8 */}
          <div id="section-8" className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              8- Durée et Résiliation
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
              Les présentes CGU sont souscrites pour une durée indéterminée à
              compter de leur acceptation par l&apos;Utilisateur. Toni360 se réserve le
              droit de suspendre ou de résilier l&apos;accès de la Pharmacie à
              l&apos;Application en cas de non-respect des présentes CGU ou pour tout
              autre motif légitime.
            </p>
          </div>

          {/* Section 9 */}
          <div id="section-9" className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              9- Loi applicable
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg md:text-xl">
              Les présentes CGU sont régies par la législation béninoise. En cas
              de litige non résolu à l&apos;amiable, les tribunaux de la République
              du Bénin sont compétents pour régler le litige.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
