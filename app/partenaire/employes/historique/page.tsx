"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ClockArrowUp, X } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import {
  ActionLogEntry,
  getPartnerHistorique,
  getPartnerHistoriqueUtilisateurs,
} from "@/lib/api/partner";
import { toast } from "sonner";

const MODULE_LABELS: Record<string, string> = {
  GESTION_USERS: "Employés",
  GESTION_PRODUITS: "Médicaments",
  GESTION_STOCKS: "Stocks",
  GESTION_COMMANDES: "Commandes",
  GESTION_PAIEMENTS: "Paiements",
  GESTION_ORDONNANCES: "Ordonnances",
  GESTION_INCOHERENCES: "Incohérences",
  PARAMETRAGE_PHARMACIE: "Paramétrage",
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  READ:   "Consultation",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  READ:   "bg-gray-100 text-gray-600",
};

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireHistoriquePage() {
  const [entries, setEntries] = useState<ActionLogEntry[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<{ id: string; prenom?: string | null; nom: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<ActionLogEntry | null>(null);
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
        const [histResponse, usersResponse] = await Promise.all([
          getPartnerHistorique(session.token, { per_page: 200 }),
          getPartnerHistoriqueUtilisateurs(session.token),
        ]);

        setEntries(histResponse.data.data ?? []);
        setUtilisateurs(
          [...(usersResponse.data ?? [])].sort((a, b) => {
            const nomA = `${a.prenom ?? ""} ${a.nom}`.trim();
            const nomB = `${b.prenom ?? ""} ${b.nom}`.trim();
            return nomA.localeCompare(nomB, "fr", { sensitivity: "base" });
          }),
        );
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

  const filtered = selectedUserId
    ? entries.filter((e) => e.user_id === selectedUserId)
    : entries;

  const selectedUser = utilisateurs.find((u) => u.id === selectedUserId);
  const formatUserLabel = (user: { prenom?: string | null; nom: string }) =>
    `${user.prenom ?? ""} ${user.nom}`.trim();

  return (
    <div className="px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
      {/* Titre + Dropdown filtre employé */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Historique des actions</h1>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-gray-300 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {selectedUser ? formatUserLabel(selectedUser) : "Tous les employés"}
            <ChevronDown className="h-5 w-5" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <button
                onClick={() => { setSelectedUserId(null); setDropdownOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                  selectedUserId === null ? "font-semibold text-toni-green-dark-2" : "text-gray-700"
                }`}
              >
                Tous les employés
              </button>
              {utilisateurs.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUserId(u.id); setDropdownOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                    selectedUserId === u.id ? "font-semibold text-toni-green-dark-2" : "text-gray-700"
                  }`}
                >
                    {formatUserLabel(u)}
                </button>
              ))}
              {utilisateurs.length === 0 && (
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
      ) : entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center justify-center">
            <ClockArrowUp size={120} className="text-gray-400 mb-8" />
            <div className="text-2xl text-gray-500 text-center">Aucun historique disponible</div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
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
          {filtered.map((entry) => {
            const created = entry.created_at ? new Date(entry.created_at) : null;
            const date = created ? created.toLocaleDateString("fr-FR") : "-";
            const heure = created
              ? created.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
              : "-";
            const employeNom = entry.user
              ? `${entry.user.prenom} ${entry.user.nom}`
              : null;
            const moduleLabel = MODULE_LABELS[entry.module] ?? entry.module;
            const actionLabel = ACTION_LABELS[entry.action] ?? entry.action;
            const actionColor = ACTION_COLORS[entry.action] ?? "bg-gray-100 text-gray-600";
            const description = entry.description ?? "";

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="rounded-2xl px-4 py-3 flex items-center gap-4 bg-[#E6F6F0]/20 cursor-pointer hover:bg-emerald-100 transition-colors"
              >
                {/* Icône */}
                <div className="flex-shrink-0">
                  <div className="w-11 h-11 rounded-full border-2 border-toni-green-dark-2 flex items-center justify-center bg-white">
                    <Image
                      src="/images/icon.png"
                      alt="Toni360"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-bold text-gray-900 text-sm">{moduleLabel}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionColor}`}>
                      {actionLabel}
                    </span>
                  </div>
                  {description && (
                    <p className="text-gray-600 text-xs truncate">{description}</p>
                  )}
                  {employeNom && (
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">{employeNom}</p>
                  )}
                </div>

                {/* Date & heure */}
                <span className="flex-shrink-0 text-xs text-gray-400 pr-1 text-right whitespace-nowrap">
                  {date}
                  <br />
                  {heure}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════ DETAIL MODAL ═══════════════ */}
      {selectedEntry && (() => {
        const e = selectedEntry;
        const created = e.created_at ? new Date(e.created_at) : null;
        const date = created ? created.toLocaleDateString("fr-FR") : "-";
        const heure = created
          ? created.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
          : "-";
        const employeNom = e.user ? `${e.user.prenom} ${e.user.nom}` : null;
        const moduleLabel = MODULE_LABELS[e.module] ?? e.module;
        const actionLabel = ACTION_LABELS[e.action] ?? e.action;
        const actionColor = ACTION_COLORS[e.action] ?? "bg-gray-100 text-gray-600";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedEntry(null)}
            />
            <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{moduleLabel}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionColor}`}>
                      {actionLabel}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">{date} à {heure}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="ml-4 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="divide-y divide-gray-100 px-5 py-2">
                {e.description && (
                  <Row label="Description" value={e.description} />
                )}
                {employeNom && (
                  <Row label="Employé" value={employeNom} />
                )}
                {e.user?.role?.libelle && (
                  <Row label="Rôle" value={e.user.role.libelle} />
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="w-28 shrink-0 text-xs font-medium text-gray-400">{label}</span>
      <span className={`flex-1 text-sm text-gray-800 break-all ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
