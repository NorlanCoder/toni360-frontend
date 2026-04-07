"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ClockArrowUp } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { extractCollection, getPartnerNotifications, getPartnerUsers, PartnerUser } from "@/lib/api/partner";
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
  const [allEntries, setAllEntries] = useState<HistoriqueEntry[]>([]);
  const [employees, setEmployees] = useState<PartnerUser[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const [notifResponse, usersResponse] = await Promise.all([
          getPartnerNotifications(session.token, 100),
          getPartnerUsers(session.token, {}),
        ]);

        const notifications = extractCollection(notifResponse.data.notifications);
        setAllEntries(
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

        setEmployees(extractCollection(usersResponse.data));
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger l'historique.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  // Fermer le dropdown si clic hors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  // Filtre: si un employé est sélectionné, ne garder que les entrées dont le titre ou la description contient son nom
  const entries = selectedEmployee
    ? allEntries.filter((entry) => {
        const nameLower = (selectedEmployee.nom_complet ?? `${selectedEmployee.prenom} ${selectedEmployee.nom}`).toLowerCase();
        return (
          entry.titre.toLowerCase().includes(nameLower) ||
          entry.description.toLowerCase().includes(nameLower) ||
          nameLower.split(" ").some((part) => part.length > 2 && (
            entry.titre.toLowerCase().includes(part) ||
            entry.description.toLowerCase().includes(part)
          ))
        );
      })
    : allEntries;

  return (
    <div className="px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
      {/* Dropdown filtre employé */}
      <div className="mb-6 flex justify-end">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-gray-300 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {selectedEmployee
              ? (selectedEmployee.nom_complet || `${selectedEmployee.prenom} ${selectedEmployee.nom}`)
              : "Tous les employés"}
            <ChevronDown className="h-5 w-5" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <button
                onClick={() => { setSelectedEmployeeId(null); setDropdownOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                  selectedEmployeeId === null ? "font-semibold text-toni-green-dark-2" : "text-gray-700"
                }`}
              >
                Tous les employés
              </button>
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => { setSelectedEmployeeId(emp.id); setDropdownOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                    selectedEmployeeId === emp.id ? "font-semibold text-toni-green-dark-2" : "text-gray-700"
                  }`}
                >
                  {emp.nom_complet || `${emp.prenom} ${emp.nom}`}
                </button>
              ))}
              {employees.length === 0 && (
                <p className="px-4 py-2 text-sm text-gray-400">Aucun employé</p>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 px-4 py-4 text-sm text-gray-500">
          Chargement de l&apos;historique...
        </div>
      ) : allEntries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center justify-center">
            <ClockArrowUp size={120} className="text-gray-400 mb-8" />
            <div className="text-2xl text-gray-500 text-center">Aucun historique disponible</div>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center justify-center">
            <ClockArrowUp size={120} className="text-gray-400 mb-8" />
            <div className="text-2xl text-gray-500 text-center">
              Aucune activité pour cet employé
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-full p-2 flex items-center gap-4 bg-[#E6F6F0]"
            >
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full border-2 border-toni-green-dark-2 flex items-center justify-center bg-white">
                  <Image
                    src="/images/icon.png"
                    alt="Toni360"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-base mb-1">{entry.titre}</h3>
                <p className="text-gray-600 text-sm truncate">{entry.description}</p>
              </div>

              {/* Date & heure */}
              <span className="flex-shrink-0 text-xs text-gray-500 pr-3 text-right whitespace-nowrap">
                {entry.date}
                <br />
                {entry.heure}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

