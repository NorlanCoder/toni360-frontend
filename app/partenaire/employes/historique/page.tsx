"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { extractCollection, getPartnerNotifications } from "@/lib/api/partner";
import { toast } from "sonner";

/* ──────────────────────────── Types ──────────────────────────── */
interface HistoriqueEntry {
  id: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
}

/* ──────────────────────── Mock data ──────────────────────────── */
const mockHistorique: HistoriqueEntry[] = [];

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireHistoriquePage() {
  const [entries, setEntries] = useState<HistoriqueEntry[]>(mockHistorique);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistorique = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPartnerNotifications(session.token, 100);
        const notifications = extractCollection(response.data.notifications);
        setEntries(
          notifications.map((notification) => {
            const created = notification.created_at ? new Date(notification.created_at) : null;
            return {
              id: notification.id,
              titre: notification.titre,
              description: notification.message,
              date: created ? created.toLocaleDateString("fr-FR") : "-",
              heure: created
                ? created.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                : "-",
            };
          }),
        );
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger l'historique.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadHistorique();
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
          {/* Dropdown filtre employé */}
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-gray-300 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Nom de l&apos;employé
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Liste historique */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="rounded-xl border border-gray-200 px-4 py-4 text-sm text-gray-500">Chargement de l'historique...</div>
            ) : entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 sm:gap-6 rounded-2xl px-4 sm:px-6 py-4 sm:py-5"
                style={{ backgroundColor: "#f0faf5" }}
              >
                {/* Icône logo */}
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                  <Image
                    src="/images/logo.png"
                    alt="Toni360"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                </div>

                {/* Texte */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-bold text-gray-900">
                    {entry.titre}
                  </p>
                  <p className="mt-1 truncate text-xs sm:text-sm text-gray-500">
                    {entry.description}
                  </p>
                </div>

                {/* Date & heure */}
                <span className="shrink-0 text-xs sm:text-sm font-medium text-gray-500">
                  {entry.date}&nbsp;&nbsp;{entry.heure}
                </span>
              </div>
            ))}
          </div>
        </main>
    </div>
  );
}

