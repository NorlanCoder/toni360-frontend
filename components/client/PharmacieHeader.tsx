import { MapPin } from "lucide-react";

interface PharmacieHeaderProps {
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  distanceKm?: number;
  /** Classes CSS additionnelles sur le conteneur (padding, border-radius…).
   *  Par défaut : "rounded-2xl px-6 py-6" */
  className?: string;
}

export default function PharmacieHeader({
  nom,
  adresse,
  telephone,
  email,
  distanceKm,
  className = "rounded-xl px-3 py-3",
}: PharmacieHeaderProps) {
  const mapsUrl = adresse
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresse)}`
    : null;

  const [first, ...rest] = nom.split(" ");
  const remainder = rest.join(" ");

  return (
    <div
      className={`bg-gradient-to-r from-[#004B2F] to-[#00B16F] grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center ${className}`}
    >
      {/* Colonne 1 : nom + adresse (+ distance optionnelle) */}
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-white sm:text-2xl leading-[24px]">
          <span className="block">{first}</span>
          {remainder && <span className="block">{remainder}</span>}
        </h2>
        {adresse && (
          <p className="mt-1 text-sm text-green-100 leading-snug">{adresse}</p>
        )}
        {distanceKm !== undefined && (
          <p className="mt-1 text-xs text-green-200">{distanceKm.toFixed(1)} km</p>
        )}
      </div>

      {/* Colonne 2 : email + téléphone (centré) */}
      <div className="flex flex-col  gap-2 sm:items-center sm:text-center">
        {email && (
          <a
            href={`mailto:${email}`}
            className="text-white lg:text-lg font-medium hover:underline"
          >
            {email}
          </a>
        )}
        {telephone && (
          <a
            href={`tel:${telephone}`}
            className="text-white lg:text-lg font-medium hover:underline"
          >
            {telephone}
          </a>
        )}
      </div>

      {/* Colonne 3 : bouton itinéraire (aligné à droite) */}
      <div className="flex sm:justify-end">
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-toni-green-dark-2 hover:bg-gray-50 transition"
          >
            <MapPin size={16} />
            Itinéraire
          </a>
        )}
      </div>
    </div>
  );
}
