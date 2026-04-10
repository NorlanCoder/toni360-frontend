"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { getPatientProfile } from "@/lib/api/auth";
import { updatePatientProfile, deletePatientAccount } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession, saveAuthSession } from "@/lib/api/session";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState<"info" | "delete">("info");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    nomComplet: "",
    email: "",
    telephone: "",
    ville: "",
  });
  const [deletePassword, setDeletePassword] = useState("");

  const router = useRouter();
  const session = useMemo(() => getAuthSession(), []);
  const token = session?.userType === "patient" ? session.token : null;

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        clearAuthSession();
        return;
      }

      try {
        const response = await getPatientProfile(token);
        const patient = response.data.patient;
        const nomComplet = patient.nom_complet || `${patient.prenom} ${patient.nom}`.trim();

        setFormData((prev) => ({
          ...prev,
          nomComplet,
          email: patient.email,
          telephone: patient.telephone,
          ville: patient.ville ?? "",
        }));
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
      }
    };

    void loadProfile();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !session) {
      clearAuthSession();
      return;
    }

    const parts = formData.nomComplet.trim().split(/\s+/).filter(Boolean);
    const prenom = parts[0] ?? "";
    const nom = parts.slice(1).join(" ") || prenom;

    setIsSaving(true);
    try {
      const response = await updatePatientProfile(token, {
        nom,
        prenom,
        email: formData.email,
        telephone: formData.telephone,
        ville: formData.ville || null,
      });

      saveAuthSession({
        ...session,
        profile: response.data.patient,
      });

      toast.success("Profil mis à jour avec succès.");
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword.trim()) {
      toast.warning("Entrez votre mot de passe pour continuer.");
      return;
    }
    if (!token) return;
    setIsDeleting(true);
    try {
      await deletePatientAccount(token, deletePassword);
      toast.success("Votre compte a été supprimé avec succès.");
      clearAuthSession();
      router.replace("/client/connexion");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || "Mot de passe incorrect.");
      } else {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Tabs */}
      <div className="flex gap-6 md:gap-20 border-b border-gray-300 mb-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab("info")}
                className={`pb-4 font-semibold text-sm md:text-lg whitespace-nowrap transition ${
                  activeTab === "info"
                    ? "border-b-4 border-toni-green-dark-2 text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Mes informations
              </button>
              <button
                onClick={() => setActiveTab("delete")}
                className={`pb-4 font-semibold text-sm md:text-lg whitespace-nowrap transition ${
                  activeTab === "delete"
                    ? "border-b-4 border-toni-green-dark-2 text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Supprimer mon compte
              </button>
      </div>

      {/* Form */}
      {activeTab === "info" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom complet */}
                  <div>
                    <label className="block font-bold text-base text-gray-500 mb-2">Nom complet</label>
                    <input
                      type="text"
                      value={formData.nomComplet}
                      onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })}
                      className="w-full px-4 py-3 border-2 font-bold  border-gray-400 rounded-lg text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-bold  text-base text-gray-500 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 border-2 font-bold border-gray-200 rounded-lg text-base text-gray-400 bg-gray-50 cursor-not-allowed"
                    />
                  </div>

                  {/* Numéro de téléphone */}
                  <div>
                    <label className="block font-bold  text-base text-gray-500 mb-2">Numéro de téléphone</label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-3 border-2 font-bold  border-gray-400 rounded-lg text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block font-bold text-base text-gray-500 mb-2">Ville</label>
                    <select
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full px-4 py-3 border-2 font-bold border-gray-400 rounded-lg text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    >
                      <option value="">— Sélectionner une ville —</option>
                      <option value="Cotonou">Cotonou</option>
                      <option value="Porto-Novo">Porto-Novo</option>
                      <option value="Parakou">Parakou</option>
                      <option value="Abomey-Calavi">Abomey-Calavi</option>
                      <option value="Djougou">Djougou</option>
                      <option value="Bohicon">Bohicon</option>
                      <option value="Natitingou">Natitingou</option>
                      <option value="Kandi">Kandi</option>
                      <option value="Ouidah">Ouidah</option>
                      <option value="Lokossa">Lokossa</option>
                    </select>
                  </div>
                </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 md:px-12 py-2.5 md:py-3 bg-toni-green-dark-2 text-white font-bold text-sm md:text-lg rounded-full hover:bg-toni-green-dark transition"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {activeTab === "delete" && (
        <div className="max-w-xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Êtes-vous sûr de vouloir supprimer votre compte ?
          </h3>

                <form onSubmit={handleDeleteAccount} className="space-y-8">
                  {/* Password Input */}
                  <div className="relative max-w-md mx-auto flex items-center">
                    <Lock className="absolute left-4 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="Entrez votre mot de passe"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-400 rounded-lg text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-toni-green-dark-2"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab("info")}
                      className="px-6 md:px-12 py-2.5 md:py-3 border-2 border-toni-green-dark-2 text-toni-green-dark-2 font-bold text-sm md:text-lg rounded-full hover:bg-toni-green-dark-2 hover:text-white transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isDeleting}
                      className="px-6 md:px-12 py-2.5 md:py-3 bg-red-600 text-white font-bold text-sm md:text-lg rounded-full hover:bg-red-700 transition disabled:opacity-60"
                    >
                      {isDeleting ? "Suppression..." : "Supprimer"}
                    </button>
                  </div>
                </form>
              </div>
      )}
    </div>
  );
}
