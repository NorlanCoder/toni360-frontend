"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getAuthSession } from "@/lib/api/session";
import {
  getPartnerCommande,
  validerPartnerOrdonnance,
  rejeterPartnerOrdonnance,
  notifierPartnerPatient,
} from "@/lib/api/partner";
import { ApiError } from "@/lib/api/errors";
import { toast } from "sonner";

export default function OrdonnancePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ordonnanceUrl, setOrdonnanceUrl] = useState<string | null>(null);
  const [isLoadingOrd, setIsLoadingOrd] = useState(true);
  const [ordonnanceStatut, setOrdonnanceStatut] = useState<string>("");
  const [notification, setNotification] = useState("");
  const [submittingValider, setSubmittingValider] = useState(false);
  const [submittingRefuser, setSubmittingRefuser] = useState(false);
  const [submittingEnvoyer, setSubmittingEnvoyer] = useState(false);

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
        const firstOrd = commande.produits.find((p) => p.ordonnance?.fichier_url)?.ordonnance ?? null;
        setOrdonnanceUrl(firstOrd?.fichier_url ?? null);
        setOrdonnanceStatut(firstOrd?.statut ?? "");
      } catch {
        // silently fail
      } finally {
        setIsLoadingOrd(false);
      }
    };
    void loadOrdonnance();
  }, [id]);

  const getSession = () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) return null;
    return session;
  };

  const getPharmacieNom = () => {
    const s = getAuthSession();
    const profile = s?.profile as { pharmacie?: { nom?: string } | null; prenom?: string; nom?: string } | null;
    return profile?.pharmacie?.nom ?? profile?.prenom ?? "La pharmacie";
  };

  const isAnySubmitting = submittingValider || submittingRefuser || submittingEnvoyer;
  const messageHasContent = notification.trim().length > 0;

  const getPreviewUrl = (url: string) => {
    const isPdf = /\.pdf($|\?)/i.test(url);
    return isPdf ? `${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=page-fit&pagemode=none` : url;
  };

  const isPdfOrdonnance = ordonnanceUrl ? /\.pdf($|\?)/i.test(ordonnanceUrl) : false;

  // Statuts ordonnance o\u00f9 Valider et Refuser sont autoris\u00e9s
  const ORD_ALLOWED = new Set(["EN_ATTENTE", "EN_VERIFICATION", "REJETEE"]);
  const canValider = ORD_ALLOWED.has(ordonnanceStatut);
  const canRefuser = ORD_ALLOWED.has(ordonnanceStatut);
  const ordonnanceStatutConfig: Record<string, { label: string; color: string }> = {
    EN_ATTENTE:    { label: "En attente de vérification", color: "bg-amber-100 text-amber-700 border border-amber-300" },
    EN_VERIFICATION: { label: "En cours de vérification", color: "bg-blue-100 text-blue-700 border border-blue-300" },
    VALIDEE:       { label: "Ordonnance validée", color: "bg-emerald-100 text-emerald-700 border border-emerald-300" },
    REJETEE:       { label: "Ordonnance rejetée", color: "bg-red-100 text-red-700 border border-red-300" },
    EXPIREE:       { label: "Ordonnance expirée", color: "bg-gray-100 text-gray-500 border border-gray-300" },
  };
  const statutConfig = ordonnanceStatut ? ordonnanceStatutConfig[ordonnanceStatut] : null;
  const handleValider = async () => {
    const session = getSession();
    if (!session) { toast.error("Session partenaire invalide."); return; }
    setSubmittingValider(true);
    try {
      await validerPartnerOrdonnance(session.token, id);
      toast.success("Ordonnance validée. Le patient a été notifié.");
      router.back();
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Impossible de valider l'ordonnance.");
    } finally {
      setSubmittingValider(false);
    }
  };

  const handleRefuser = async () => {
    const session = getSession();
    if (!session) { toast.error("Session partenaire invalide."); return; }
    setSubmittingRefuser(true);
    try {
      // Zone de texte vide → rejet simple (le patient doit présenter l'ordonnance en pharmacie).
      // Zone de texte renseignée → rejet commenté avec le motif détaillé au patient.
      const commentaire = notification.trim();
      await rejeterPartnerOrdonnance(session.token, id, commentaire || undefined);
      toast.success("Ordonnance rejetée. Le patient a été notifié.");
      setNotification("");
      // Rejet commenté → retour au détail de la commande pour suivre la suite du traitement.
      if (commentaire) {
        router.push(`/partenaire/commandes/${id}`);
      } else {
        router.back();
      }
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Impossible de refuser l'ordonnance.");
    } finally {
      setSubmittingRefuser(false);
    }
  };

  const handleEnvoyer = async () => {
    const session = getSession();
    if (!session) { toast.error("Session partenaire invalide."); return; }
    const texte = notification.trim();
    if (!texte) return;
    setSubmittingEnvoyer(true);
    try {
      const pharmacieNom = getPharmacieNom();
      await notifierPartnerPatient(
        session.token,
        id,
        `${pharmacieNom} a émis une observation concernant votre ordonnance : ${texte}. Veuillez consulter les détails et apporter les corrections nécessaires.`
      );
      toast.success("Message envoyé au patient.");
      setNotification("");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Impossible d'envoyer le message.");
    } finally {
      setSubmittingEnvoyer(false);
    }
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-16 py-5 lg:py-10 bg-emerald-50">
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
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Ordonnance</h1>
      </div>

      {/* Layout : aperçu haut/gauche + actions bas/droite */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Aperçu */}
        <div className="w-full lg:flex-1 lg:max-w-[860px] rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden h-[calc(100vh-170px)] min-h-[560px] max-h-[calc(100vh-130px)] flex items-center justify-center">
          {isLoadingOrd ? (
            <p className="text-sm text-gray-500">Chargement de l&apos;ordonnance...</p>
          ) : ordonnanceUrl ? (
            isPdfOrdonnance ? (
              <iframe
                src={getPreviewUrl(ordonnanceUrl)}
                title="Ordonnance"
                scrolling="no"
                className="w-full h-full border-0"
              />
            ) : (
              <img
                src={ordonnanceUrl}
                alt="Ordonnance"
                className="w-full max-w-full h-auto max-h-[calc(100vh-140px)] object-contain"
              />
            )
          ) : (
            <p className="text-sm text-gray-400 px-8 text-center">
              Aucune ordonnance jointe à cette commande.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 w-full lg:w-[320px]">

          {/* Badge statut ordonnance */}
          {statutConfig && (
            <div className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-semibold ${statutConfig.color}`}>
              {ordonnanceStatut === "VALIDEE" && (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {statutConfig.label}
            </div>
          )}

          {/* Valider / Refuser */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleValider}
              disabled={isAnySubmitting || messageHasContent || !canValider}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
                !isAnySubmitting && !messageHasContent && canValider
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {submittingValider && <Loader2 className="h-4 w-4 animate-spin" />}
              Valider
            </button>
            <button
              type="button"
              onClick={handleRefuser}
              disabled={isAnySubmitting || !canRefuser}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 px-6 py-2.5 text-sm font-semibold transition-colors ${
                !isAnySubmitting && canRefuser
                  ? "border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50"
                  : "border-gray-200 text-gray-400 bg-white cursor-not-allowed"
              }`}
            >
              {submittingRefuser && <Loader2 className="h-4 w-4 animate-spin" />}
              Refuser
            </button>
          </div>

          {/* Textarea + Envoyer */}
          <div className="flex flex-col gap-3">
            <textarea
              value={notification}
              onChange={(e) => setNotification(e.target.value)}
              disabled={isAnySubmitting}
              rows={6}
              placeholder="Notifier une incohérence au patient..."
              className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-5 py-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm disabled:opacity-50"
            />
            <p className="text-xs text-gray-400">
              Ce texte, s&apos;il est renseigné, sera transmis au patient comme motif du rejet en cliquant sur « Refuser ».
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleEnvoyer}
                disabled={isAnySubmitting || !messageHasContent}
                className={`inline-flex items-center justify-center gap-2 rounded-full border-2 px-8 py-2.5 text-sm font-semibold transition-colors ${
                  !isAnySubmitting && messageHasContent
                    ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {submittingEnvoyer && <Loader2 className="h-4 w-4 animate-spin" />}
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
