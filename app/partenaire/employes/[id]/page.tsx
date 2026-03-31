"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { getPartnerUser, togglePartnerUserActive, updatePartnerUser } from "@/lib/api/partner";
import { toast } from "sonner";

/* ──────────────────────────── Types ──────────────────────────── */
interface Permission {
  label: string;
  enabled: boolean;
}

type EmployeeRoleCode = "PHARMACIEN_TITULAIRE" | "GESTIONNAIRE_OPERATIONNEL" | "RESPONSABLE_STOCKS" | "RESPONSABLE_COMMANDES";

interface EmployeeState {
  id: string;
  nom: string;
  role: string;
  roleCode: EmployeeRoleCode | null;
  statut: "Actif" | "Désactivé";
  email: string;
  telephone: string;
  dateAjout: string;
}

/* ──────────────────────── Mock data ──────────────────────────── */
const mockEmployee: EmployeeState = {
  id: "",
  nom: "",
  role: "Gestionnaire Opérationnel",
  roleCode: null,
  statut: "Actif",
  email: "",
  telephone: "",
  dateAjout: "-",
};

const PERMISSIONS_BY_ROLE: Record<EmployeeRoleCode, Permission[]> = {
  PHARMACIEN_TITULAIRE: [
    { label: "Gestion des employés", enabled: true },
    { label: "Gestion des commandes", enabled: true },
    { label: "Gestion des médicaments", enabled: true },
    { label: "Gestion des stocks", enabled: true },
    { label: "Gestion des données de la pharmacie", enabled: true },
    { label: "Gestion des interactions avec les patients", enabled: true },
    { label: "Gestion des performances", enabled: true },
    { label: "Gestion des paiements", enabled: true },
  ],
  GESTIONNAIRE_OPERATIONNEL: [
    { label: "Gestion des commandes", enabled: true },
    { label: "Gestion des médicaments", enabled: true },
    { label: "Gestion des stocks", enabled: true },
    { label: "Gestion des données de la pharmacie", enabled: true },
    { label: "Gestion des interactions avec les patients", enabled: true },
    { label: "Gestion des performances", enabled: true },
    { label: "Gestion des paiements", enabled: true },
  ],
  RESPONSABLE_STOCKS: [
    { label: "Gestion des médicaments", enabled: true },
    { label: "Gestion des stocks", enabled: true },
  ],
  RESPONSABLE_COMMANDES: [
    { label: "Gestion des commandes", enabled: true },
    { label: "Gestion des paiements", enabled: true },
  ],
};

function mapRoleCode(code: string | undefined): EmployeeRoleCode | null {
  if (code === "PHARMACIEN_TITULAIRE") return "PHARMACIEN_TITULAIRE";
  if (code === "GESTIONNAIRE_OPERATIONNEL") return "GESTIONNAIRE_OPERATIONNEL";
  if (code === "RESPONSABLE_STOCKS") return "RESPONSABLE_STOCKS";
  if (code === "RESPONSABLE_COMMANDES") return "RESPONSABLE_COMMANDES";
  return null;
}

function mapRoleLabel(code: EmployeeRoleCode | null, libelle: string | undefined): string {
  if (code === "PHARMACIEN_TITULAIRE") return "Pharmacien Titulaire";
  if (code === "GESTIONNAIRE_OPERATIONNEL") return "Gestionnaire Opérationnel";
  if (code === "RESPONSABLE_STOCKS") return "Responsable des Stocks";
  if (code === "RESPONSABLE_COMMANDES") return "Responsable des Commandes";
  return libelle ?? "Employé";
}

function getPermissionsForRole(code: EmployeeRoleCode | null): Permission[] {
  if (!code) {
    return [];
  }

  return PERMISSIONS_BY_ROLE[code];
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireEmployeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [employee, setEmployee] = useState(mockEmployee);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState("");
  const [editablePhone, setEditablePhone] = useState("");

  /* ── Modal state ── */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const isTitulaire = employee.roleCode === "PHARMACIEN_TITULAIRE";

  useEffect(() => {
    const loadEmployee = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token || !id) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPartnerUser(session.token, id);
        const user = response.data.user;
        const roleCode = mapRoleCode(user.role?.code);

        if (roleCode === "PHARMACIEN_TITULAIRE") {
          router.replace("/partenaire/employes");
          return;
        }

        const mapped: EmployeeState = {
          id: user.id,
          nom: user.nom_complet,
          role: mapRoleLabel(roleCode, user.role?.libelle),
          roleCode,
          statut: user.is_active ? "Actif" : "Désactivé",
          email: user.email,
          telephone: user.telephone,
          dateAjout: user.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR") : "-",
        };
        setEmployee(mapped);
        setPermissions(getPermissionsForRole(roleCode));
        setEditableName(mapped.nom);
        setEditablePhone(mapped.telephone);
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger l'employé.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadEmployee();
  }, [id]);

  const handleSave = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    const [nomPart, ...prenomParts] = editableName.trim().split(" ");
    const prenomPart = prenomParts.join(" ") || nomPart;

    setIsSubmitting(true);
    try {
      const response = await updatePartnerUser(session.token, id, {
        nom: nomPart,
        prenom: prenomPart,
        telephone: editablePhone,
      });
      const user = response.data.user;
      setEmployee((prev) => ({
        ...prev,
        nom: user.nom_complet,
        telephone: user.telephone,
      }));
      setIsEditing(false);
      toast.success("Employé mis à jour.");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la mise à jour.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    setIsSubmitting(true);
    try {
      await togglePartnerUserActive(session.token, id);
      setEmployee((prev) => ({
        ...prev,
        statut: prev.statut === "Actif" ? "Désactivé" : "Actif",
      }));
      setShowDeactivateModal(false);
      setDeactivatePassword("");
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Action impossible sur cet employé.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await handleToggleActive();
    router.push("/partenaire/employes");
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Chargement de l'employé...</div>;
  }

  return (
    <>
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-32 py-6 lg:py-12">
          <div className="mx-auto w-full max-w-[860px] space-y-8">
            {/* ════════ EMPLOYEE CARD ════════ */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
              {/* Top row: name + badge + trash */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {isEditing ? editableName : employee.nom}
                    </h1>
                    <span className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-0.5 text-xs font-medium text-gray-600">
                      {employee.statut}
                    </span>
                  </div>
                  <p className="mt-1 text-base text-gray-500">{employee.role}</p>
                </div>

                {/* Trash icon */}
                <button
                  type="button"
                  aria-label="Supprimer cet employé"
                  className="p-2 text-red-500 transition-colors hover:text-red-700"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Image
                    src="/Vector.svg"
                    alt="Supprimer"
                    width={22}
                    height={22}
                  />
                </button>
              </div>

              {/* Info row */}
              <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-600">
                <span>{employee.email}</span>
                <span>{isEditing ? editablePhone : employee.telephone}</span>
                <span>{employee.dateAjout}</span>
              </div>

              {isEditing && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
                  />
                  <input
                    type="text"
                    value={editablePhone}
                    onChange={(e) => setEditablePhone(e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex items-center gap-4">
                {!isTitulaire && (
                  <>
                    <button
                      type="button"
                      onClick={() => (isEditing ? void handleSave() : setIsEditing(true))}
                      disabled={isSubmitting}
                      className="rounded-full border-2 border-emerald-600 px-8 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                    >
                      {isEditing ? "Enregistrer" : "Modifier"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-gray-200 px-8 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-300"
                      onClick={() => setShowDeactivateModal(true)}
                    >
                      Désactiver
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ════════ PERMISSIONS SECTION ════════ */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Gérer les permissions
              </h2>

              {isTitulaire && (
                <p className="mb-3 text-sm text-gray-600">
                  Le Pharmacien Titulaire dispose de toutes les permissions par défaut.
                </p>
              )}

              <div className="rounded-2xl bg-emerald-50/70 px-6 py-2">
                {permissions.map((perm, idx) => (
                  <div key={perm.label}>
                    <div className="flex items-center justify-between py-4">
                      <span className="text-sm font-medium text-gray-700">
                        {perm.label}
                      </span>

                      {/* Toggle switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={perm.enabled}
                        aria-label={perm.label}
                        disabled
                        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                          perm.enabled ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                            perm.enabled ? "translate-x-6" : "translate-x-1"
                          } mt-1`}
                        />
                      </button>
                    </div>

                    {/* Separator — not after last item */}
                    {idx < permissions.length - 1 && (
                      <hr className="border-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

      {/* ═══════════ MODAL 1 — Delete confirmation ═══════════ */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white px-8 py-8 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 text-base font-bold text-gray-800">
              Voulez-vous supprimer cet employé ?
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="min-w-[100px] rounded-full bg-emerald-600 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                onClick={() => {
                  void handleDelete();
                }}
              >
                Oui
              </button>
              <button
                type="button"
                className="min-w-[100px] rounded-full border-2 border-emerald-600 px-8 py-2.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                onClick={() => setShowDeleteModal(false)}
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL 2 — Deactivation confirmation ═══════════ */}
      {showDeactivateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={() => setShowDeactivateModal(false)}
        >
          <div
            className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark green header */}
            <div className="bg-emerald-700 px-6 py-4">
              <h3 className="text-center text-base font-bold text-white">
                Confirmer la désactivation
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Entrez votre mot de passe
              </label>
              <input
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                type="button"
                className="mt-5 w-full rounded-full bg-emerald-600 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
                onClick={() => {
                  void handleToggleActive();
                }}
              >
                Désactiver
              </button>
            </div>
          </div>
        </div>
      )}
    </>

  );
}

