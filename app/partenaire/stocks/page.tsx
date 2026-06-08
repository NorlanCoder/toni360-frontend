"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { extractCollection, getPartnerStocks, PartnerStockItem } from "@/lib/api/partner";
import { toast } from "sonner";

export default function PartenaireStocksPage() {
  const [stocks, setStocks] = useState<PartnerStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStocks = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPartnerStocks(session.token, { per_page: 100 });
        setStocks(extractCollection(response.data));
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger les stocks.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadStocks();
  }, []);

  return (
    <>
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Gestion de Stocks</h1>

          {isLoading ? (
            <div className="rounded-xl border border-gray-200 px-4 py-4 text-sm text-gray-500">Chargement des stocks...</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="min-w-[520px] w-full table-auto text-sm lg:text-base">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider text-gray-600">Produit</th>
                    <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider text-gray-600">Quantité</th>
                    <th className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider text-gray-600">Seuil alerte</th>
                    <th className="px-8 py-5 text-right text-sm font-bold uppercase tracking-wider text-gray-600">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.id} className="border-b border-gray-200 last:border-b-0">
                      <td className="px-8 py-5 text-gray-900">{stock.produit?.nom ?? "-"}</td>
                      <td className="px-8 py-5 text-gray-700">{stock.quantite}</td>
                      <td className="px-8 py-5 text-gray-700">{stock.seuil_alerte}</td>
                      <td className="px-8 py-5 text-right text-gray-700">{stock.statut_label ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
    </>
  
  );
}
