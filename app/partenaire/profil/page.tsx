"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, Menu, Pencil } from "lucide-react";
import { getPartnerProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

import { getPartnerNotificationCount, getPartnerPharmacieProfile, updatePartnerPharmacieProfile } from "@/lib/api/partner";
import { toast } from "sonner";
import { useSidebarContext } from "@/app/partenaire/_sidebar-context";

export default function PartenaireProfil() {
  const router = useRouter();
  const { setOpen } = useSidebarContext();
  const [displayName, setDisplayName] = useState("Partenaire");
  const [notificationCount, setNotificationCount] = useState(0);

  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [licence, setLicence] = useState("");
  const [horaires, setHoraires] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        clearAuthSession();
        router.replace("/partenaire/connexion");
        return;
      }

      try {
        const [userResponse, profileResponse, notifications] = await Promise.all([
          getPartnerProfile(session.token),
          getPartnerPharmacieProfile(session.token),
          getPartnerNotificationCount(session.token),
        ]);

        const user = userResponse.data.user;
        const name = user.nom_complet || `${user.prenom ?? ""} ${user.nom ?? ""}`.trim();
        if (name) {
          setDisplayName(name);
        }

        setNotificationCount(
          notifications.data.total_non_lues
          ?? notifications.data.non_lues
          ?? 0,
        );
        const profile = profileResponse.data;
        setNom(profile.nom ?? "");
        setAdresse(profile.adresse ?? "");
        setTelephone(profile.telephone ?? "");
        setEmail(profile.email ?? "");
        setLicence(profile.numero_agrement ?? "");
        setHoraires("Voir paramétrage horaires");
      } catch (err: unknown) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
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
      await updatePartnerPharmacieProfile(session.token, {
        nom,
        adresse,
        telephone,
        email,
        numero_agrement: licence,
      });
      toast.success("Modifications enregistrées.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Erreur de mise à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Chargement du profil...</div>;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 lg:h-24 shrink-0 items-center gap-3 justify-between border-b border-gray-200 bg-white px-4 md:px-8">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="flex shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <h1 className="text-xl font-bold text-gray-900 min-w-0 truncate">
            Bienvenue, {displayName}
          </h1>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/partenaire/notifications"
              aria-label="Voir les notifications"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Notifications ({notificationCount})</span>
              <Bell className="h-5 w-5" />
            </Link>
            <button
              type="button"
              aria-label="Accéder à mon compte"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Mon Compte</span>
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-6 lg:py-8">

          <div className="mb-8 flex items-center gap-8">
            <Link
              href="/partenaire/profil"
              className="relative pb-3 text-lg sm:text-xl font-bold text-gray-900"
            >
              Mes informations
              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-emerald-600" />
            </Link>
            <Link
              href="/partenaire/profil/supprimer-compte"
              className="pb-3 text-lg sm:text-xl font-bold text-gray-400 hover:text-gray-700"
            >
              Supprimer mon compte
            </Link>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-12 gap-y-5 md:gap-y-7 max-w-[1000px] mx-auto">
              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Nom de la pharmacie</label>
                <div className="relative">
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full pl-4 pr-10 py-[14px] bg-gray-50 border border-gray-200 rounded-[8px] text-[17px] text-gray-700 outline-none focus:border-emerald-500"
                  />
                  <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" strokeWidth={1.8} />
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
                  <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" strokeWidth={1.8} />
                </div>
              </div>

              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Téléphone</label>
                <div className="relative">
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full pl-4 pr-10 py-[14px] bg-gray-50 border border-gray-200 rounded-[8px] text-[17px] text-gray-700 outline-none focus:border-emerald-500"
                  />
                  <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" strokeWidth={1.8} />
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
                  <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" strokeWidth={1.8} />
                </div>
              </div>

              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Licence</label>
                <div className="relative">
                  <input
                    type="text"
                    value={licence}
                    onChange={(e) => setLicence(e.target.value)}
                    className="w-full pl-4 pr-10 py-[14px] bg-gray-50 border border-gray-200 rounded-[8px] text-[17px] text-gray-700 outline-none focus:border-emerald-500"
                  />
                  <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" strokeWidth={1.8} />
                </div>
              </div>

              <div>
                <label className="block text-[15px] text-gray-500 mb-[8px]">Horaires d&apos;ouvertures</label>
                <div className="relative">
                  <input
                    type="text"
                    value={horaires}
                    onChange={(e) => setHoraires(e.target.value)}
                    className="w-full pl-4 pr-10 py-[14px] bg-gray-50 border border-gray-200 rounded-[8px] text-[17px] text-gray-700 outline-none focus:border-emerald-500"
                  />
                  <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" strokeWidth={1.8} />
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-12 max-w-[1000px] w-full mx-auto flex justify-center">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="w-1/2 py-[14px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[18px] rounded-full transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </div>
        </main>
    </div>
  );
}
