"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import { getPartnerCommande, rejeterPartnerOrdonnance, validerPartnerOrdonnance, notifierPartnerPatient } from "@/lib/api/partner";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";

/* ════════════════════════════ PAGE ════════════════════════════ */
export default function OrdonnancePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [notification, setNotification] = useState("");
  const [decision, setDecision] = useState<"valide" | "refuse" | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isRefusing, setIsRefusing] = useState(false);
  const [isEnvoyant, setIsEnvoyant] = useState(false);
  const [ordonnanceUrl, setOrdonnanceUrl] = useState<string | null>(null);
  const [isLoadingOrd, setIsLoadingOrd] = useState(true);

  useEffect(() => {
    const loadOrdonnance = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token || !id) {
        setIsLoadingOrd(false);
        return;
      }
      try {
        const response = await getPartnerCommande(session.token, id);
        const commande = response.data.commande;
        const url = commande.produits.find((p) => p.ordonnance?.fichier_url)?.ordonnance?.fichier_url ?? null;
        setOrdonnanceUrl(url);
      } catch {
        // silently fail — ordonnance may not exist yet
      } finally {
        setIsLoadingOrd(false);
      }
    };
    void loadOrdonnance();
  }, [id]);

  /* Auto-close success modal after 2.5 s then go back */
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => {
      setShowSuccess(false);
      router.push(`/partenaire/commandes/${id}`);
    }, 2500);
    return () => clearTimeout(timer);
  }, [showSuccess, router, id]);

  async function handleValider() {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    setIsValidating(true);
    try {
      await validerPartnerOrdonnance(session.token, id);
      setDecision("valide");
      toast.success("Ordonnance validée. Le patient a été notifié.");
      router.push(`/partenaire/commandes/${id}`);
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Validation impossible.");
    } finally {
      setIsValidating(false);
    }
  }

  function handleRefuser() {
    if (!notification.trim()) {
      toast.warning("Écrivez un motif de refus dans la zone de notification.");
      return;
    }
    setIsRefusing(true);
    setTimeout(() => {
      setDecision("refuse");
      setIsRefusing(false);
    }, 0);
  }

  async function handleEnvoyer() {
    if (!notification.trim()) return;

    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    setIsEnvoyant(true);
    try {
      if (decision === "refuse") {
        // Rejeter l'ordonnance avec le motif
        await rejeterPartnerOrdonnance(session.token, id, notification.trim());
        setShowSuccess(true);
        setNotification("");
        setDecision(null);
      } else {
        // Envoyer une simple notification au patient
        await notifierPartnerPatient(session.token, id, notification.trim());
        toast.success("Notification envoyée au patient.");
        setNotification("");
      }
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Envoi impossible.");
    } finally {
      setIsEnvoyant(false);
    }
  }

  return (
    <>
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10 bg-emerald-50">
          {/* Back + Title */}
          <div className="mb-8 flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1 text-gray-500 hover:text-emerald-700 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Ordonnance
            </h1>
          </div>

          {/* ─── MAIN LAYOUT : aperçu gauche + actions droite ─── */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Aperçu ordonnance ── */}
            <div className="flex-1 max-w-[520px]">
              <div className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden min-h-[580px] flex items-center justify-center">
                {isLoadingOrd ? (
                  <p className="text-sm text-gray-500">Chargement de l&apos;ordonnance...</p>
                ) : ordonnanceUrl ? (
                  <iframe
                    src={ordonnanceUrl}
                    title="Ordonnance"
                    className="w-full h-[580px] border-0"
                  />
                ) : (
                  <p className="text-sm text-gray-400 px-8 text-center">Aucune ordonnance jointe à cette commande.</p>
                )}
              </div>
            </div>

            {/* ── Actions droite ── */}
            <div className="flex flex-col gap-6 w-full lg:w-[360px]">

              {/* Boutons Valider / Refuser */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleValider}
                  disabled={isValidating || isRefusing || isEnvoyant}
                  className={`flex-1 rounded-full px-8 py-3 text-base font-semibold transition-colors ${
                    decision === "valide"
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  } disabled:opacity-60`}
                >
                  {isValidating ? "Validation..." : "Valider"}
                </button>
                <button
                  type="button"
                  onClick={handleRefuser}
                  disabled={isValidating || isRefusing || isEnvoyant}
                  className={`flex-1 rounded-full border-2 px-8 py-3 text-base font-semibold transition-colors ${
                    decision === "refuse"
                      ? "border-red-600 bg-red-50 text-red-700"
                      : "border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50"
                  } disabled:opacity-60`}
                >
                  {isRefusing ? "..." : "Refuser"}
                </button>
              </div>

              {/* Zone de notification */}
              <div className="flex flex-col gap-3">
                <textarea
                  value={notification}
                  onChange={(e) => setNotification(e.target.value)}
                  placeholder="Notifier une incohérence au patient..."
                  rows={10}
                  className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-5 py-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleEnvoyer}
                    disabled={!notification.trim() || isEnvoyant || isValidating || isRefusing}
                    className="rounded-full border-2 border-emerald-600 px-10 py-3 text-base font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isEnvoyant ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>

      {/* ─── Success Modal ─── */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          onClick={() => setShowSuccess(false)}
        >
          <div
            className="mx-4 w-full max-w-xs rounded-2xl bg-white px-8 py-12 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-emerald-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base leading-relaxed text-gray-600">
              L&apos;ordonnance a été<br />demandée au patient.
            </p>
          </div>
        </div>
      )}
    </>

  );
}
