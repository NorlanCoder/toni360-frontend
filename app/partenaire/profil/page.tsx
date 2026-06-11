"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Upload } from "lucide-react";
import { getPartnerProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession, saveAuthSession } from "@/lib/api/session";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { Value as E164Number } from "react-phone-number-input";

import { downloadPartnerLicence, getPartnerHoraires, getPartnerNotificationCount, getPartnerPharmacieProfile, type HoraireOuvertureItem, updatePartnerHoraires, updatePartnerPharmacieProfile, uploadPartnerLicence, updatePartnerUser } from "@/lib/api/partner";
import { hasPermission } from "@/lib/auth/authorization";
import { toast } from "sonner";

const JOURS = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

type HoraireJour = Pick<HoraireOuvertureItem, "jour" | "heure_ouverture" | "heure_fermeture" | "est_ferme">;

function defaultHoraires(): HoraireJour[] {
  return Array.from({ length: 7 }, (_, i) => ({
    jour: i + 1,
    heure_ouverture: "08:00",
    heure_fermeture: "18:00",
    est_ferme: i + 1 === 7,
  }));
}

export default function PartenaireProfil() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Partenaire");
  const [notificationCount, setNotificationCount] = useState(0);

  const [nom, setNom] = useState("");
  const [prenomUser, setPrenomUser] = useState("");
  const [nomUser, setNomUser] = useState("");
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null);
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState<E164Number | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [licenceUrl, setLicenceUrl] = useState<string | null>(null);
  const [hasLicence, setHasLicence] = useState(false);
  const [licenceFile, setLicenceFile] = useState<File | null>(null);
  const [isUploadingLicence, setIsUploadingLicence] = useState(false);
  const licenceInputRef = useRef<HTMLInputElement>(null);
  const [horaires, setHoraires] = useState<HoraireJour[]>(defaultHoraires());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingHoraires, setIsSavingHoraires] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        clearAuthSession();
        router.replace("/partenaire/connexion");
        return;
      }

      try {
        const canReadParametrage = hasPermission(session, "parametrage_pharmacie", "read");

        const [userResponse, pharmacieProfile, notifications, horaireRes] = await Promise.all([
          getPartnerProfile(session.token),
          canReadParametrage ? getPartnerPharmacieProfile(session.token) : Promise.resolve(null),
          getPartnerNotificationCount(session.token).catch(() => null),
          canReadParametrage ? getPartnerHoraires(session.token).catch(() => null) : Promise.resolve(null),
        ]);

        const user = userResponse.data.user;
        setPartnerUserId(user?.id ?? null);
        setPrenomUser(user?.prenom ?? "");
        setNomUser(user?.nom ?? "");
        const name = user.nom_complet || `${user.prenom ?? ""} ${user.nom ?? ""}`.trim();
        if (name) {
          setDisplayName(name);
        }

        setNotificationCount(
          notifications?.data.total_non_lues
          ?? notifications?.data.non_lues
          ?? 0,
        );

        if (pharmacieProfile) {
          const profile = pharmacieProfile.data;
          setNom(profile.nom ?? "");
          setAdresse(profile.adresse ?? "");
          setTelephone((profile.telephone ?? "") as E164Number);
          setEmail(profile.email ?? "");
          setLicenceUrl(null);
          setHasLicence(!!(profile.licence_pharmaceutique_url));
        }

        if (horaireRes && horaireRes.data.length > 0) {
          setHoraires(
            horaireRes.data
              .sort((a, b) => a.jour - b.jour)
              .map((h) => ({
                jour: h.jour,
                heure_ouverture: h.heure_ouverture ?? "08:00",
                heure_fermeture: h.heure_fermeture ?? "18:00",
                est_ferme: h.est_ferme,
              })),
          );
        }
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          clearAuthSession();
          router.replace("/partenaire/connexion");
          return;
        }
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger le profil.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  const handleSave = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      toast.error("Session partenaire invalide.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        nom,
        adresse,
        telephone: telephone ?? "",
        email,
      };
      if (password && password.trim().length > 0) {
        payload.password = password;
      }
        await updatePartnerPharmacieProfile(session.token, payload as any);
        // Update current partner user (pharmacien) name if provided
        if (partnerUserId) {
          try {
            await updatePartnerUser(session.token, partnerUserId, {
              prenom: prenomUser,
              nom: nomUser,
            });
          } catch (err: unknown) {
            // Non-fatal: show warning but don't block the pharmacy update
            toast.error(err instanceof ApiError ? (err as ApiError).message : "Impossible de mettre à jour le nom de l'utilisateur.");
          }
        }

        // Refresh and save auth session so header and other pages reflect changes immediately
        try {
          const refreshed = await getPartnerProfile(session.token);
          const current = getAuthSession();
          const remember = !!(typeof window !== "undefined" && localStorage.getItem("toni360.auth.session"));
          if (current) {
            const updatedSession = {
              ...current,
              profile: refreshed.data.user ?? (current.profile as any),
            };
            saveAuthSession(updatedSession, remember);
            const name = (refreshed.data.user?.nom_complet) || `${refreshed.data.user?.prenom ?? ""} ${refreshed.data.user?.nom ?? ""}`.trim();
            if (name) setDisplayName(name);
          }
        } catch {
          // ignore refresh errors; best-effort only
        }
      toast.success("Modifications enregistrées.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Erreur de mise à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHoraires = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      toast.error("Session partenaire invalide.");
      return;
    }

    setIsSavingHoraires(true);
    try {
      await updatePartnerHoraires(
        session.token,
        horaires.map((h) => ({
          jour: h.jour,
          heure_ouverture: h.est_ferme ? null : h.heure_ouverture,
          heure_fermeture: h.est_ferme ? null : h.heure_fermeture,
          est_ferme: h.est_ferme,
        })),
      );
      toast.success("Horaires mis à jour.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la mise à jour des horaires.");
    } finally {
      setIsSavingHoraires(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Chargement du profil...</div>;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 lg:py-8">

          <div className="mb-4">
            <Link
              href="/partenaire"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-toni-green-dark-2 hover:underline"
            >
              ← Retour au tableau de bord
            </Link>
          </div>

          <div className="mb-8 flex items-center justify-center gap-5 sm:gap-8">
            <Link
              href="/partenaire/profil"
              className="relative pb-2 sm:pb-3 text-sm sm:text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap"
            >
              Mes informations
              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-emerald-600" />
            </Link>
            <Link
              href="/partenaire/profil/supprimer-compte"
              className="pb-2 sm:pb-3 text-sm sm:text-lg sm:text-xl font-bold text-gray-400 hover:text-gray-700 whitespace-nowrap"
            >
              Supprimer mon compte
            </Link>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-12 gap-y-5 md:gap-y-7 max-w-[1000px] mx-auto">
            

              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Prénom (pharmacien)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={prenomUser}
                    onChange={(e) => setPrenomUser(e.target.value)}
                    className="w-full pl-4 pr-10 py-[14px] bg-gray-50 border border-gray-200 rounded-[8px] text-[17px] text-gray-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Nom (pharmacien)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={nomUser}
                    onChange={(e) => setNomUser(e.target.value)}
                    className="w-full pl-4 pr-10 py-[14px] bg-gray-50 border border-gray-200 rounded-[8px] text-[17px] text-gray-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

                <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Nom de la pharmacie</label>
                <div className="relative">
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full pl-4 pr-10 py-[14px] bg-gray-50 border border-gray-200 rounded-[8px] text-[17px] text-gray-700 outline-none focus:border-emerald-500"
                  />
                  
                </div>
              </div>

              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Adressse</label>
                <div className="relative">
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className="w-full pl-4 pr-10 py-[14px] bg-gray-50 border border-gray-200 rounded-[8px] text-[17px] text-gray-700 outline-none focus:border-emerald-500"
                  />
                  
                </div>
              </div>

              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Téléphone</label>
                <div className="flex items-center border bg-gray-50 text-black border-gray-200 rounded-[8px] overflow-hidden px-3 py-[14px] transition-colors focus-within:border-emerald-500">
                  <PhoneInput
                    international
                    defaultCountry="BJ"
                    placeholder="numéro de téléphone"
                    value={telephone}
                    onChange={(value) => setTelephone(value)}
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">E-mail</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-4 pr-10 py-[14px] bg-gray-50 border border-gray-200 rounded-[8px] text-[17px] text-gray-700 outline-none focus:border-emerald-500"
                  />
                  
                </div>
              </div>

              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Mot de passe <span className="text-xs text-gray-400">(laisser vide pour ne pas changer)</span></label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full pl-4 pr-10 py-[14px] bg-gray-50 border border-gray-200 rounded-[8px] text-[17px] text-gray-700 outline-none focus:border-emerald-500"
                  />
                  
                </div>
              </div>

              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Licence pharmaceutique</label>
                <div className="flex flex-col gap-2 w-full rounded-[8px] border border-gray-200 bg-gray-50 px-4 py-[14px]">
                  {hasLicence ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const session = getAuthSession();
                        if (!session?.token) return;
                        try {
                          await downloadPartnerLicence(session.token);
                        } catch {
                          toast.error("Impossible d'ouvrir la licence.");
                        }
                      }}
                      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      Voir le fichier uploadé
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400">Aucun fichier</span>
                  )}
                  <input
                    ref={licenceInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setLicenceFile(f);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => licenceInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {licenceFile ? licenceFile.name : "Remplacer le fichier"}
                  </button>
                  {licenceFile && (
                    <button
                      type="button"
                      disabled={isUploadingLicence}
                      onClick={async () => {
                        const session = getAuthSession();
                        if (!session?.token) return;
                        setIsUploadingLicence(true);
                        try {
                          const res = await uploadPartnerLicence(session.token, licenceFile);
                          if (res.success) setHasLicence(true);
                          setLicenceFile(null);
                          toast.success("Licence mise à jour.");
                        } catch (err: unknown) {
                          toast.error(err instanceof ApiError ? err.message : "Erreur upload licence.");
                        } finally {
                          setIsUploadingLicence(false);
                        }
                      }}
                      className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
                    >
                      {isUploadingLicence ? "Envoi..." : "Enregistrer la licence"}
                    </button>
                  )}
                </div>
              </div>

            </div>

            <div className="mt-8 md:mt-12 max-w-[1000px] w-full mx-auto flex justify-center">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="w-full py-[14px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[18px] rounded-full transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>

            {/* ── Horaires d'ouverture ── */}
            <div className="mt-10 border-t border-gray-100 pt-8 max-w-[1000px] mx-auto">
              <h3 className="text-[16px] font-semibold text-gray-700 mb-4">Horaires d&apos;ouverture</h3>

              <div className="divide-y divide-gray-100">
                {horaires.map((h, idx) => (
                  <div key={h.jour} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-4">
                    {/* Jour */}
                    <span className="w-24 shrink-0 text-[15px] font-medium text-gray-700">{JOURS[h.jour]}</span>

                    {/* Toggle ouvert/fermé */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...horaires];
                        updated[idx] = { ...h, est_ferme: !h.est_ferme };
                        setHoraires(updated);
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        h.est_ferme ? "bg-gray-300" : "bg-toni-green-dark"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          h.est_ferme ? "translate-x-1" : "translate-x-6"
                        }`}
                      />
                    </button>
                    <span className={`w-12 text-sm ${h.est_ferme ? "text-gray-400" : "text-emerald-600 font-medium"}`}>
                      {h.est_ferme ? "Fermé" : "Ouvert"}
                    </span>

                    {/* Plages horaires */}
                    <div
                      className={`flex items-end gap-3 sm:ml-auto transition-opacity ${
                        h.est_ferme ? "opacity-30 pointer-events-none select-none" : ""
                      }`}
                    >
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Ouverture</label>
                        <input
                          type="time"
                          value={h.heure_ouverture ?? ""}
                          onChange={(e) => {
                            const updated = [...horaires];
                            updated[idx] = { ...h, heure_ouverture: e.target.value };
                            setHoraires(updated);
                          }}
                          className="px-3 py-[10px] bg-gray-50 border border-gray-200 rounded-lg text-[15px] text-gray-700 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <span className="pb-[12px] text-gray-400">—</span>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Fermeture</label>
                        <input
                          type="time"
                          value={h.heure_fermeture ?? ""}
                          onChange={(e) => {
                            const updated = [...horaires];
                            updated[idx] = { ...h, heure_fermeture: e.target.value };
                            setHoraires(updated);
                          }}
                          className="px-3 py-[10px] bg-gray-50 border border-gray-200 rounded-lg text-[15px] text-gray-700 outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => void handleSaveHoraires()}
                  disabled={isSavingHoraires}
                  className="w-full py-[14px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[18px] rounded-full transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isSavingHoraires ? "Enregistrement..." : "Enregistrer les horaires"}
                </button>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
