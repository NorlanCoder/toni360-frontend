"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicCommandeDetails } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

interface PublicOrderData {
  commande: {
    id: string;
    numero: string;
    statut: string;
    statut_label: string;
    date_commande?: string | null;
    montant_total?: number;
    devise?: string;
  };
  auteur?: {
    id?: string;
    nom?: string;
    prenom?: string;
    nom_affiche?: string;
  };
  pharmacie?: {
    id?: string;
    nom?: string;
    adresse?: string;
    ville?: string;
  } | null;
  lignes: Array<{
    id: string;
    produit?: {
      id?: string;
      nom?: string;
    };
    quantite?: number;
    prix_unitaire?: number;
    prix_total?: number;
  }>;
}

export default function PublicOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PublicOrderContent />
    </Suspense>
  );
}

function PublicOrderContent() {
  const params = useParams();
  const commandeId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PublicOrderData | null>(null);

  useEffect(() => {
    if (!commandeId) {
      setError("Commande introuvable.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const response = await getPublicCommandeDetails(commandeId);
        setData(response.data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Impossible de charger cette commande.");
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [commandeId]);

  const formattedDate = useMemo(() => {
    if (!data?.commande.date_commande) return "";
    return new Date(data.commande.date_commande).toLocaleString("fr-FR");
  }, [data?.commande.date_commande]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#00955F] border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error ?? "Commande indisponible."}
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Détails publics de la commande</h1>

        <div className="mt-6 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <p><span className="font-semibold">ID :</span> {data.commande.numero}</p>
          <p><span className="font-semibold">Statut :</span> {data.commande.statut_label}</p>
          <p><span className="font-semibold">Auteur :</span> {data.auteur?.nom_affiche || "Non renseigné"}</p>
          <p><span className="font-semibold">Date :</span> {formattedDate || "Non renseignée"}</p>
          <p><span className="font-semibold">Montant :</span> {data.commande.montant_total ?? 0} {data.commande.devise ?? "FCFA"}</p>
          <p><span className="font-semibold">Pharmacie :</span> {data.pharmacie?.nom ?? "Non renseignée"}</p>
        </div>

        <div className="mt-7">
          <h2 className="text-lg font-semibold text-gray-900">Produits</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Produit</th>
                  <th className="px-4 py-3 font-semibold">Qté</th>
                  <th className="px-4 py-3 font-semibold">PU</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.lignes.map((ligne) => (
                  <tr key={ligne.id} className="border-t text-black border-gray-100">
                    <td className="px-4 py-3">{ligne.produit?.nom ?? "Produit"}</td>
                    <td className="px-4 py-3">{ligne.quantite ?? 0}</td>
                    <td className="px-4 py-3">{ligne.prix_unitaire ?? 0}</td>
                    <td className="px-4 py-3">{ligne.prix_total ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Cette vue est publique et ne contient pas d'informations sensibles (téléphone, email, données d'authentification).
        </p>
      </div>
    </main>
  );
}
