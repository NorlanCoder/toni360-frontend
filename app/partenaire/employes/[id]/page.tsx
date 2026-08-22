"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import {
  deletePartnerUser,
  getPartnerUser,
  getPartnerUserPermissions,
  togglePartnerUserActive,
  updatePartnerUserPermissions,
  type PartnerUserPermission,
} from "@/lib/api/partner";
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
    { label: "Gestion des données de la pharmacie", enabled: true },
    { label: "Gestion des interactions avec les patients", enabled: true },
    { label: "Gestion des performances", enabled: true },
    { label: "Gestion des paiements", enabled: true },
  ],
  GESTIONNAIRE_OPERATIONNEL: [
    { label: "Notifications", enabled: true },
    { label: "Tableau de bord", enabled: true },
    { label: "Gestion des médicaments", enabled: true },
    { label: "Historique des actions", enabled: true },
  ],
  RESPONSABLE_STOCKS: [
    { label: "Notifications", enabled: true },
    { label: "Tableau de bord", enabled: true },
    { label: "Gestion des médicaments", enabled: true },
    { label: "Historique des actions", enabled: true },
  ],
  RESPONSABLE_COMMANDES: [
    { label: "Notifications", enabled: true },
    { label: "Tableau de bord", enabled: true },
    { label: "Gestion des commandes", enabled: true },
    { label: "Historique des actions", enabled: true },
  ],
};

/**
 * Mapping UI label → modules backend (pour construire les overrides à envoyer à l'API).
 */
const LABEL_TO_MODULES: Partial<Record<EmployeeRoleCode, Record<string, string[]>>> = {
  GESTIONNAIRE_OPERATIONNEL: {
    "Notifications": ["GESTION_NOTIFICATIONS"],
    "Tableau de bord": ["CONSULTATION_STATISTIQUES"],
    "Gestion des médicaments": ["GESTION_PRODUITS", "GESTION_INCOHERENCES"],
    "Historique des actions": ["GESTION_HISTORIQUE"],
  },
  RESPONSABLE_STOCKS: {
    "Notifications": ["GESTION_NOTIFICATIONS"],
    "Tableau de bord": ["CONSULTATION_STATISTIQUES"],
    // GESTION_STOCKS a ete fusionne dans GESTION_PRODUITS : ce toggle
    // couvre desormais aussi la gestion des stocks.
    "Gestion des médicaments": ["GESTION_PRODUITS", "GESTION_INCOHERENCES"],
    "Historique des actions": ["GESTION_HISTORIQUE"],
  },
  RESPONSABLE_COMMANDES: {
    "Notifications": ["GESTION_NOTIFICATIONS"],
    "Tableau de bord": ["CONSULTATION_STATISTIQUES"],
    "Gestion des commandes": ["GESTION_COMMANDES"],
    "Historique des actions": ["GESTION_HISTORIQUE"],
  },
};

/**
 * À partir des permissions retournées par l'API, construit les states UI (label + enabled).
 * Un label est "enabled" si TOUTES ses permissions API correspondantes sont is_enabled = true.
 * Les labels sont "enabled" si toutes les permissions modules associées sont actives.
 */
function buildUiPermissions(
  roleCode: EmployeeRoleCode,
  rawPerms: PartnerUserPermission[],
): Permission[] {
  const defaults = PERMISSIONS_BY_ROLE[roleCode];
  const labelMap = LABEL_TO_MODULES[roleCode];
  if (!labelMap) return defaults;

  return defaults.map((p) => {
    const modules = labelMap[p.label];
    if (!modules || modules.length === 0) return { ...p, enabled: true };

    // Le label est activé si toutes les perms des modules concernés sont is_enabled
    const relatedPerms = rawPerms.filter((rp) => modules.includes(rp.module));
    if (relatedPerms.length === 0) return { ...p, enabled: true }; // pas encore en BDD → défaut actif
    return { ...p, enabled: relatedPerms.every((rp) => rp.is_enabled) };
  });
}

/**
 * Construit la liste { permission_id, is_enabled } à envoyer à l'API.
 * Seules les permissions présentes dans les modules mappés sont incluses.
 */
function buildApiPayload(
  roleCode: EmployeeRoleCode,
  uiPerms: Permission[],
  rawPerms: PartnerUserPermission[],
): Array<{ permission_id: string; is_enabled: boolean }> {
  const labelMap = LABEL_TO_MODULES[roleCode];
  if (!labelMap) return [];

  const payload: Array<{ permission_id: string; is_enabled: boolean }> = [];

  for (const uiPerm of uiPerms) {
    const modules = labelMap[uiPerm.label];
    if (!modules || modules.length === 0) continue;

    const relatedPerms = rawPerms.filter((rp) => modules.includes(rp.module));
    for (const rp of relatedPerms) {
      payload.push({ permission_id: rp.id, is_enabled: uiPerm.enabled });
    }
  }

  return payload;
}

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

function formatErrorMessage(error: unknown, fallback: string): string {
  const raw = error instanceof ApiError
    ? error.message
    : error instanceof Error
      ? error.message
      : fallback;

  return raw.replace(/^\s*\d+\.\s*/, "").trim() || fallback;
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireEmployeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rawPermissions, setRawPermissions] = useState<PartnerUserPermission[]>([]);
  const [employee, setEmployee] = useState(mockEmployee);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  /* ── Toggle permission (persist via API) ── */
  const togglePermission = async (idx: number) => {
    if (isSavingPermissions || !employee.roleCode) return;

    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) return;

    const updated = permissions.map((p, i) => (i === idx ? { ...p, enabled: !p.enabled } : p));
    setPermissions(updated); // mise à jour optimiste

    const payload = buildApiPayload(employee.roleCode, updated, rawPermissions);
    if (payload.length === 0) return; // frontend-only, rien à sauvegarder

    setIsSavingPermissions(true);
    try {
      await updatePartnerUserPermissions(session.token, id, payload);
      toast.success("Permissions mises à jour. L'employé devra se reconnecter.");
    } catch (err: unknown) {
      // rollback
      setPermissions(permissions);
      toast.error(err instanceof ApiError ? err.message : "Impossible de mettre à jour les permissions.");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
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

        // Charger les permissions depuis l'API
        try {
          const permsResponse = await getPartnerUserPermissions(session.token, id);
          const raw = permsResponse.data.permissions;
          setRawPermissions(raw);
          if (roleCode) {
            setPermissions(buildUiPermissions(roleCode, raw));
          } else {
            setPermissions(getPermissionsForRole(roleCode));
          }
        } catch {
          // Fallback sur les permissions par défaut du rôle
          setPermissions(getPermissionsForRole(roleCode));
        }
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger l'employé.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadEmployee();
  }, [id, router]);

  const handleToggleActive = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    setIsSubmitting(true);
    try {
      await togglePartnerUserActive(session.token, id);
      const wasActive = employee.statut === "Actif";
      setEmployee((prev) => ({
        ...prev,
        statut: prev.statut === "Actif" ? "Désactivé" : "Actif",
      }));
      setShowDeactivateModal(false);
      toast.success(wasActive ? "Employé désactivé avec succès." : "Employé réactivé avec succès.");
    } catch (err: unknown) {
      toast.error(formatErrorMessage(err, "Action impossible sur cet employé."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token || !id) {
      toast.error("Session partenaire invalide.");
      return;
    }

    if (!deletePassword.trim()) {
      toast.error("Veuillez saisir votre mot de passe pour confirmer la suppression.");
      return;
    }

    setIsSubmitting(true);
    try {
      await deletePartnerUser(session.token, id);
      setShowDeleteModal(false);
      setDeletePassword("");
      setShowDeletePassword(false);
      toast.success("Employé supprimé avec succès.");
      router.push("/partenaire/employes");
    } catch (err: unknown) {
      toast.error(formatErrorMessage(err, "Action impossible sur cet employé."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Chargement de l&apos;employé...</div>;
  }

  return (
    <>
        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-32 py-6 lg:py-12">
          <div className="mx-auto w-full max-w-[860px] space-y-8">
            {/* Retour */}
            <Link
              href="/partenaire/employes"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-toni-green-dark-2 hover:underline"
            >
              ← Retour aux employés
            </Link>
            {/* ════════ EMPLOYEE CARD ════════ */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
              {/* Top row: name + badge + trash */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {employee.nom}
                    </h1>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      employee.statut === "Actif"
                        ? "bg-emerald-100 text-emerald-700"
                        : employee.statut === "Désactivé"
                        ? "bg-gray-400 text-white"
                        : "bg-red-200 text-red-600"
                    }`}>
                      {employee.statut}
                    </span>
                  </div>
                  <p className="mt-1 text-base text-[18px] text-black">{employee.role}</p>
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
              <div className="mt-5 flex flex-wrap font-semibold text-[18px] items-center gap-x-8 gap-y-2 text-black">
                <span>{employee.email}</span>
                <span>{employee.telephone}</span>
                <span>{employee.dateAjout}</span>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex items-center gap-4">
                {!isTitulaire && (
                  <>
                    <Link
                      href={`/partenaire/employes/${id}/modifier`}
                      className="rounded-full border-2 border-emerald-600 px-8 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      className="rounded-full bg-gray-200 px-8 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-300"
                      onClick={() => setShowDeactivateModal(true)}
                    >
                      {employee.statut === "Actif" ? "Désactiver" : "Réactiver"}
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
                        disabled={isSavingPermissions}
                        onClick={() => void togglePermission(idx)}
                        className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                          isSavingPermissions ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                        } ${perm.enabled ? "bg-[#00A669]" : "bg-gray-300"}`}
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

      {/* ═══════════ MODAL 1 — Delete confirmation with password ═══════════ */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={() => {
            setShowDeleteModal(false);
            setShowDeletePassword(false);
            setDeletePassword("");
          }}
        >
          <div
            className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-emerald-700 px-6 py-4">
              <h3 className="text-center text-base font-bold text-white">Confirmer la suppression</h3>
            </div>

            <div className="px-6 py-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Entrez votre mot de passe
              </label>
              <div className="relative">
                <input
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showDeletePassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="min-w-[100px] rounded-full bg-red-600 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                  onClick={() => {
                    void handleDelete();
                  }}
                >
                  Supprimer
                </button>
                <button
                  type="button"
                  className="min-w-[100px] rounded-full border-2 border-emerald-600 px-8 py-2.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setShowDeletePassword(false);
                    setDeletePassword("");
                  }}
                >
                  Annuler
                </button>
              </div>
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
            className="mx-4 w-full max-w-sm rounded-2xl bg-white px-8 py-8 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 text-base font-bold text-gray-800">
              {employee.statut === "Actif"
                ? "Voulez-vous désactiver cet employé ?"
                : "Voulez-vous réactiver cet employé ?"}
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={isSubmitting}
                className="min-w-[100px] rounded-full bg-emerald-600 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                onClick={() => {
                  void handleToggleActive();
                }}
              >
                Oui
              </button>
              <button
                type="button"
                className="min-w-[100px] rounded-full border-2 border-emerald-600 px-8 py-2.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                onClick={() => setShowDeactivateModal(false)}
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}
    </>

  );
}

