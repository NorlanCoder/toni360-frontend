"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Menu, Search, User } from "lucide-react";
import PartenaireSidebar from "@/components/partenaire/Sidebar";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { extractCollection, getPartnerStocks, PartnerStockItem } from "@/lib/api/partner";
import { toast } from "sonner";

export default function PartenaireStocksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="flex h-screen bg-white overflow-hidden">
      <PartenaireSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 lg:h-24 shrink-0 items-center gap-3 justify-between border-b border-gray-200 bg-white px-4 md:px-8">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="flex shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-lg">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médicament"
              className="w-full rounded-full border-0 bg-emerald-50/60 py-3 pl-14 pr-4 text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/partenaire/notifications"
              aria-label="Voir les notifications"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Notifications</span>
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              href="/partenaire/profil"
              aria-label="Accéder à mon compte"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Mon Compte</span>
              <User className="h-5 w-5" />
            </Link>
          </div>
        </header>

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
      </div>
    </div>
  );
}
