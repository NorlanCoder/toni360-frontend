const faqItems = [
  {
    question: "Qu'est-ce que Toni360 ?",
    answer:
      "Toni360 est une plateforme qui connecte les patients aux pharmacies partenaires. Elle vous permet de rechercher des médicaments, de vérifier leur disponibilité en stock et de passer commande directement depuis votre téléphone ou votre ordinateur.",
  },
  {
    question: "Comment rechercher un médicament ?",
    answer:
      "Utilisez la barre de recherche disponible sur la page d'accueil. Entrez le nom du produit et nous vous afficherons les pharmacies qui l'ont en stock près de chez vous.",
  },
  {
    question: "Dois-je créer un compte pour commander ?",
    answer:
      "Oui, vous devez créer un compte pour accéder aux fonctionnalités de commande. L'inscription est gratuite et rapide.",
  },
  {
    question: "Comment fonctionne la livraison ou le retrait ?",
    answer:
      "Après avoir passé votre commande, vous recevez un QR code. Présentez-le à la pharmacie partenaire pour récupérer votre médicament.",
  },
  {
    question: "Mes données médicales sont-elles sécurisées ?",
    answer:
      "Oui. Vos données personnelles et médicales sont protégées conformément à notre politique de confidentialité. Elles ne sont jamais partagées à des tiers sans votre consentement.",
  },
  {
    question: "Que faire si un médicament n'est pas disponible ?",
    answer:
      "Si le médicament n'est pas disponible dans les pharmacies proches, nous vous l'indiquons clairement. Vous pouvez élargir votre zone de recherche ou revenir plus tard.",
  },
  {
    question: "Comment annuler une commande ?",
    answer:
      "Vous pouvez annuler une commande depuis la section « Mes commandes » dans votre espace client, tant qu'elle n'a pas encore été récupérée.",
  },
  {
    question: "Comment contacter le support ?",
    answer:
      "Rendez-vous dans la section Contacts pour nous joindre par email ou téléphone. Notre équipe est disponible pour répondre à toutes vos questions.",
  },
];

export default function FaqContent() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 w-full">
      <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-8">
        FAQ — Questions Fréquemment Posées
      </h1>

      <div className="space-y-6">
        {faqItems.map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              {index + 1}. {item.question}
            </h2>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
