import { apiRequest, buildJsonRequest } from "./http";

interface PaginatedApi<T> {
  data: T[];
}

export interface PartnerCommande {
  id: string;
  numero_commande: string;
  statut: string;
  statut_label: string;
  statut_color?: string;
  patient: {
    id: string;
    nom: string;
    prenom: string;
    nom_complet: string;
    telephone?: string;
  } | null;
  produits: Array<{
    id: string;
    quantite: number;
    prix_unitaire: number;
    prix_total: number;
    ordonnance_requise: boolean;
    produit: {
      id: string;
      nom: string;
      dci?: string | null;
    } | null;
    ordonnance?: {
      id: string;
      statut: string;
      fichier_url?: string | null;
    } | null;
  }>;
  montant_total: number;
  commentaire_pharmacie?: string | null;
  created_at?: string;
  dates?: {
    commande?: string | null;
    validation_ordonnance?: string | null;
    paiement?: string | null;
    debut_preparation?: string | null;
    prete?: string | null;
    recuperation?: string | null;
  };
}

export interface PartnerCommandesResponse {
  success: boolean;
  data: PaginatedApi<PartnerCommande> | PartnerCommande[];
}

export interface PartnerCommandeCompteursResponse {
  success: boolean;
  data: {
    en_attente_ordonnance: number;
    ordonnance_en_verification: number;
    ordonnance_validee: number;
    ordonnance_rejetee: number;
    en_attente_paiement: number;
    payee: number;
    en_cours: number;
    en_preparation: number;
    prete: number;
    recuperee: number;
    annulee: number;
    total: number;
    a_traiter: number;
  };
}

export interface PartnerCommandeDetailResponse {
  success: boolean;
  data: {
    commande: PartnerCommande;
  };
}

export interface PartnerStockStatsResponse {
  success: boolean;
  data: {
    total_references: number;
    total_unites: number;
    total_produits_actifs?: number;
  };
}

export interface PartnerRepartitionEmploye {
  code: string;
  libelle: string;
  total: number;
}

export interface PartnerDashboardStatsResponse {
  success: boolean;
  data: {
    repartition_employes?: PartnerRepartitionEmploye[];
  };
}

export interface PartnerNotificationCountResponse {
  success: boolean;
  data: {
    total_non_lues?: number;
    non_lues?: number;
    necessitant_action?: number;
  };
}

export interface PartnerRole {
  id: string;
  code: string;
  libelle: string;
  description?: string | null;
}

export interface PartnerUser {
  id: string;
  nom: string;
  prenom: string;
  nom_complet: string;
  email: string;
  telephone: string;
  is_active: boolean;
  role: PartnerRole | null;
  created_at?: string;
}

export interface PartnerUsersResponse {
  success: boolean;
  data: PaginatedApi<PartnerUser> | PartnerUser[];
}

export interface PartnerUserDetailResponse {
  success: boolean;
  data: {
    user: PartnerUser;
  };
}

export interface PartnerRolesResponse {
  success: boolean;
  data: {
    roles: PartnerRole[];
  };
}

export interface PartnerProduit {
  id: string;
  nom: string;
  nom_generique?: string | null;
  forme?: string | null;
  dosage?: string | null;
  presentation?: string | null;
  code_produit?: string | null;
  categorie?: string | null;
  fabricant?: string | null;
  ordonnance_requise?: boolean;
  description?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  stock?: {
    quantite: number;
    seuil_alerte: number;
    en_alerte: boolean;
    prix_unitaire?: number | null;
  } | null;
}

export interface PartnerProduitsResponse {
  success: boolean;
  data: PaginatedApi<PartnerProduit> | PartnerProduit[];
}

export interface PartnerProduitDetailResponse {
  success: boolean;
  data: {
    produit: PartnerProduit;
  };
}

export interface PartnerStockItem {
  id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire?: number | null;
  seuil_alerte: number;
  seuil_critique?: number | null;
  statut: string;
  statut_label: string;
  statut_couleur: string;
  est_disponible: boolean;
  date_expiration?: string | null;
  expire_bientot?: boolean;
  jours_avant_expiration?: number | null;
  produit?: {
    id: string;
    nom: string;
    dci?: string | null;
    forme?: string | null;
    dosage?: string | null;
    is_active?: boolean;
  } | null;
}

export interface PartnerStocksResponse {
  success: boolean;
  data: PaginatedApi<PartnerStockItem> | PartnerStockItem[];
}

export interface PartnerPharmacieProfile {
  id: string;
  nom: string;
  adresse?: string | null;
  ville?: string | null;
  telephone?: string | null;
  email?: string | null;
  licence_pharmaceutique_url?: string | null;
}

export interface PartnerPharmacieProfileResponse {
  success: boolean;
  data: PartnerPharmacieProfile;
}

export interface PartnerNotificationItem {
  id: string;
  titre: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at?: string;
  data?: Record<string, unknown>;
}

export interface PartnerNotificationsResponse {
  success: boolean;
  data: {
    notifications: PaginatedApi<PartnerNotificationItem> | PartnerNotificationItem[];
    stats?: {
      total_non_lues?: number;
      non_lues?: number;
      necessitant_action?: number;
    };
  };
}

export function extractCollection<T>(value: PaginatedApi<T> | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return Array.isArray(value.data) ? value.data : [];
}

export async function getPartnerCommandes(
  token: string,
  params: {
    statut?: string;
    search?: string;
    date_debut?: string;
    date_fin?: string;
    per_page?: number;
  } = {},
): Promise<PartnerCommandesResponse> {
  const query = new URLSearchParams();

  if (params.statut) query.set("statut", params.statut);
  if (params.search) query.set("search", params.search);
  if (params.date_debut) query.set("date_debut", params.date_debut);
  if (params.date_fin) query.set("date_fin", params.date_fin);
  if (params.per_page) query.set("per_page", String(params.per_page));

  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<PartnerCommandesResponse>(`/pharmacie/commandes${suffix}`, {
    method: "GET",
    token,
  });
}

export async function getPartnerCommandeCompteurs(token: string): Promise<PartnerCommandeCompteursResponse> {
  return apiRequest<PartnerCommandeCompteursResponse>("/pharmacie/commandes/compteurs", {
    method: "GET",
    token,
  });
}

export async function getPartnerCommande(token: string, commandeId: string): Promise<PartnerCommandeDetailResponse> {
  return apiRequest<PartnerCommandeDetailResponse>(`/pharmacie/commandes/${commandeId}`, {
    method: "GET",
    token,
  });
}

export async function preparerPartnerCommande(token: string, commandeId: string): Promise<PartnerCommandeDetailResponse> {
  return apiRequest<PartnerCommandeDetailResponse>(`/pharmacie/commandes/${commandeId}/preparer`, {
    method: "POST",
    token,
  });
}

export async function marquerPartnerCommandePrete(token: string, commandeId: string): Promise<PartnerCommandeDetailResponse> {
  return apiRequest<PartnerCommandeDetailResponse>(`/pharmacie/commandes/${commandeId}/prete`, {
    method: "POST",
    token,
  });
}

export async function livrerPartnerCommande(
  token: string,
  commandeId: string,
  motif = "Bypass test: récupération sans QR",
): Promise<PartnerCommandeDetailResponse> {
  const json = buildJsonRequest({ motif });
  return apiRequest<PartnerCommandeDetailResponse>(`/pharmacie/commandes/${commandeId}/livrer`, {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function validerPartnerOrdonnance(
  token: string,
  commandeId: string,
  commentaire?: string,
): Promise<PartnerCommandeDetailResponse> {
  const json = buildJsonRequest({ commentaire: commentaire ?? null });
  return apiRequest<PartnerCommandeDetailResponse>(`/pharmacie/commandes/${commandeId}/valider-ordonnance`, {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function rejeterPartnerOrdonnance(
  token: string,
  commandeId: string,
  motif?: string,
): Promise<PartnerCommandeDetailResponse> {
  const json = buildJsonRequest({ motif: motif ?? null });
  return apiRequest<PartnerCommandeDetailResponse>(`/pharmacie/commandes/${commandeId}/rejeter-ordonnance`, {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function notifierPartnerPatient(
  token: string,
  commandeId: string,
  message: string,
): Promise<{ success: boolean; message?: string }> {
  const json = buildJsonRequest({ message });
  return apiRequest<{ success: boolean; message?: string }>(`/pharmacie/commandes/${commandeId}/notifier-patient`, {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function getPartnerNotificationCount(token: string): Promise<PartnerNotificationCountResponse> {
  return apiRequest<PartnerNotificationCountResponse>("/pharmacie/notifications/count", {
    method: "GET",
    token,
  });
}

export async function getPartnerDashboardStats(token: string): Promise<PartnerDashboardStatsResponse> {
  return apiRequest<PartnerDashboardStatsResponse>("/pharmacie/statistiques/dashboard", {
    method: "GET",
    token,
  });
}

export async function getPartnerStockStats(token: string): Promise<PartnerStockStatsResponse> {
  return apiRequest<PartnerStockStatsResponse>("/pharmacie/stocks/statistiques", {
    method: "GET",
    token,
  });
}

export interface ActionLogEntry {
  id: string;
  user_id: string | null;
  role_code: string | null;
  action: string;
  module: string;
  description: string | null;
  ip_address: string | null;
  methode_http: string | null;
  url: string | null;
  statut_http: number | null;
  created_at: string;
  user?: {
    id: string;
    nom: string;
    prenom: string;
    role?: { code: string; libelle: string } | null;
  } | null;
}

export interface PartnerHistoriqueResponse {
  success: boolean;
  data: PaginatedApi<ActionLogEntry>;
}

export interface PartnerHistoriqueUtilisateursResponse {
  success: boolean;
  data: { id: string; nom: string; prenom?: string | null; role_code: string | null; role_label: string | null }[];
}

export async function getPartnerHistorique(
  token: string,
  params: { user_id?: string; module?: string; action?: string; date_debut?: string; date_fin?: string; per_page?: number; page?: number } = {},
): Promise<PartnerHistoriqueResponse> {
  const query = new URLSearchParams();
  if (params.user_id) query.set("user_id", params.user_id);
  if (params.module) query.set("module", params.module);
  if (params.action) query.set("action", params.action);
  if (params.date_debut) query.set("date_debut", params.date_debut);
  if (params.date_fin) query.set("date_fin", params.date_fin);
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.page) query.set("page", String(params.page));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<PartnerHistoriqueResponse>(`/pharmacie/historique${suffix}`, {
    method: "GET",
    token,
  });
}

export async function getPartnerHistoriqueUtilisateurs(
  token: string,
): Promise<PartnerHistoriqueUtilisateursResponse> {
  return apiRequest<PartnerHistoriqueUtilisateursResponse>("/pharmacie/historique/utilisateurs", {
    method: "GET",
    token,
  });
}

export async function getPartnerUsers(
  token: string,
  params: { search?: string; role?: string; per_page?: number; page?: number } = {},
): Promise<PartnerUsersResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.page) query.set("page", String(params.page));
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<PartnerUsersResponse>(`/pharmacie/users${suffix}`, {
    method: "GET",
    token,
  });
}

export async function getPartnerUser(token: string, userId: string): Promise<PartnerUserDetailResponse> {
  return apiRequest<PartnerUserDetailResponse>(`/pharmacie/users/${userId}`, {
    method: "GET",
    token,
  });
}

export async function getPartnerRoles(token: string): Promise<PartnerRolesResponse> {
  return apiRequest<PartnerRolesResponse>("/pharmacie/users/roles", {
    method: "GET",
    token,
  });
}

export async function createPartnerUser(
  token: string,
  payload: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    password: string;
    password_confirmation: string;
    role_id: string;
  },
): Promise<PartnerUserDetailResponse> {
  const json = buildJsonRequest(payload);
  return apiRequest<PartnerUserDetailResponse>("/pharmacie/users", {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function updatePartnerUser(
  token: string,
  userId: string,
  payload: Partial<{
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role_id: string;
    is_active: boolean;
  }>,
): Promise<PartnerUserDetailResponse> {
  const json = buildJsonRequest(payload);
  return apiRequest<PartnerUserDetailResponse>(`/pharmacie/users/${userId}`, {
    method: "PUT",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function togglePartnerUserActive(
  token: string,
  userId: string,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(`/pharmacie/users/${userId}/toggle-active`, {
    method: "PUT",
    token,
  });
}

export async function deletePartnerUser(
  token: string,
  userId: string,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(`/pharmacie/users/${userId}`, {
    method: "DELETE",
    token,
  });
}

/* ── Permission overrides ── */

export interface PartnerUserPermission {
  id: string;
  code: string;
  module: string;
  action: string;
  nom: string;
  is_enabled: boolean;
}

export interface PartnerUserPermissionsResponse {
  success: boolean;
  data: { permissions: PartnerUserPermission[] };
}

export async function getPartnerUserPermissions(
  token: string,
  userId: string,
): Promise<PartnerUserPermissionsResponse> {
  return apiRequest<PartnerUserPermissionsResponse>(`/pharmacie/users/${userId}/permissions`, {
    method: "GET",
    token,
  });
}

export async function updatePartnerUserPermissions(
  token: string,
  userId: string,
  permissions: Array<{ permission_id: string; is_enabled: boolean }>,
): Promise<{ success: boolean; message?: string }> {
  const json = buildJsonRequest({ permissions });
  return apiRequest<{ success: boolean; message?: string }>(`/pharmacie/users/${userId}/permissions`, {
    method: "PUT",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function getPartnerProduits(
  token: string,
  params: { search?: string; is_active?: boolean; stock_faible?: boolean; per_page?: number } = {},
): Promise<PartnerProduitsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (typeof params.is_active === "boolean") query.set("is_active", params.is_active ? "1" : "0");
  if (params.stock_faible) query.set("stock_faible", "1");
  if (params.per_page) query.set("per_page", String(params.per_page));
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<PartnerProduitsResponse>(`/pharmacie/produits${suffix}`, {
    method: "GET",
    token,
  });
}

export async function getPartnerProduitFormes(
  token: string,
): Promise<{ success: boolean; data: { formes: string[] } }> {
  return apiRequest<{ success: boolean; data: { formes: string[] } }>("/pharmacie/produits/formes", {
    method: "GET",
    token,
  });
}

export async function getPartnerStocks(
  token: string,
  params: { search?: string; per_page?: number } = {},
): Promise<PartnerStocksResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.per_page) query.set("per_page", String(params.per_page));
  const suffix = query.toString() ? `?${query.toString()}` : "";

  return apiRequest<PartnerStocksResponse>(`/pharmacie/stocks${suffix}`, {
    method: "GET",
    token,
  });
}

export async function getPartnerProduit(token: string, produitId: string): Promise<PartnerProduitDetailResponse> {
  return apiRequest<PartnerProduitDetailResponse>(`/pharmacie/produits/${produitId}`, {
    method: "GET",
    token,
  });
}

export async function createPartnerProduit(
  token: string,
  payload: {
    nom: string;
    dci?: string;
    forme: string;
    dosage?: string;
    prix_achat: number;
    prix_vente: number;
    necessite_ordonnance: boolean;
    quantite_initiale: number;
    seuil_alerte: number;
  },
): Promise<PartnerProduitDetailResponse> {
  const json = buildJsonRequest(payload);
  return apiRequest<PartnerProduitDetailResponse>("/pharmacie/produits", {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function updatePartnerProduit(
  token: string,
  produitId: string,
  payload: Partial<{
    nom: string;
    dci: string;
    forme: string;
    dosage: string;
    prix_vente: number;
    necessite_ordonnance: boolean;
    is_active: boolean;
  }>,
): Promise<PartnerProduitDetailResponse> {
  const json = buildJsonRequest(payload);
  return apiRequest<PartnerProduitDetailResponse>(`/pharmacie/produits/${produitId}`, {
    method: "PUT",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function updatePartnerProduitSeuil(
  token: string,
  produitId: string,
  seuil_alerte: number,
): Promise<{ success: boolean; message?: string }> {
  const json = buildJsonRequest({ seuil_alerte });
  return apiRequest<{ success: boolean; message?: string }>(`/pharmacie/stocks/${produitId}/seuil`, {
    method: "PUT",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function addPartnerStockQuantity(
  token: string,
  produitId: string,
  quantite: number,
): Promise<{ success: boolean; message?: string; data?: Record<string, unknown> }> {
  const json = buildJsonRequest({
    quantite,
    type: "entree",
    motif: "Ajout de stock depuis la fiche médicament",
  });

  return apiRequest<{ success: boolean; message?: string; data?: Record<string, unknown> }>(`/pharmacie/stocks/${produitId}/ajuster`, {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function deactivatePartnerProduit(
  token: string,
  produitId: string,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(`/pharmacie/produits/${produitId}`, {
    method: "DELETE",
    token,
  });
}

export async function getPartnerPharmacieProfile(token: string): Promise<PartnerPharmacieProfileResponse> {
  return apiRequest<PartnerPharmacieProfileResponse>("/pharmacie/parametrage", {
    method: "GET",
    token,
  });
}

export async function updatePartnerPharmacieProfile(
  token: string,
  payload: Partial<{
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
    password: string;
  }>,
): Promise<PartnerPharmacieProfileResponse> {
  const json = buildJsonRequest(payload);
  return apiRequest<PartnerPharmacieProfileResponse>("/pharmacie/parametrage", {
    method: "PUT",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function uploadPartnerLicence(
  token: string,
  file: File,
): Promise<{ success: boolean }> {
  const formData = new FormData();
  formData.append("licence", file);
  return apiRequest<{ success: boolean }>("/pharmacie/parametrage/licence", {
    method: "POST",
    token,
    body: formData,
  });
}

export async function downloadPartnerLicence(token: string): Promise<void> {
  const res = await fetch(`${(await import("./config")).API_BASE_URL}/pharmacie/parametrage/licence`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Impossible de charger la licence.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export interface HoraireOuvertureItem {
  id?: string;
  jour: number;
  jour_label?: string;
  heure_ouverture: string | null;
  heure_fermeture: string | null;
  est_ferme: boolean;
}

export interface PartnerHorairesResponse {
  success: boolean;
  data: HoraireOuvertureItem[];
}

export async function getPartnerHoraires(token: string): Promise<PartnerHorairesResponse> {
  return apiRequest<PartnerHorairesResponse>("/pharmacie/parametrage/horaires", {
    method: "GET",
    token,
  });
}

export async function updatePartnerHoraires(
  token: string,
  horaires: Array<{
    jour: number;
    heure_ouverture: string | null;
    heure_fermeture: string | null;
    est_ferme: boolean;
  }>,
): Promise<{ success: boolean; message?: string }> {
  const json = buildJsonRequest({ horaires });
  return apiRequest<{ success: boolean; message?: string }>("/pharmacie/parametrage/horaires", {
    method: "PUT",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function getPartnerNotifications(
  token: string,
  perPage = 50,
): Promise<PartnerNotificationsResponse> {
  return apiRequest<PartnerNotificationsResponse>(`/pharmacie/notifications?per_page=${perPage}`, {
    method: "GET",
    token,
  });
}

export async function markPartnerNotificationRead(
  token: string,
  notificationId: string,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(`/pharmacie/notifications/${notificationId}/lue`, {
    method: "PUT",
    token,
  });
}

export async function markPartnerNotificationUnread(
  token: string,
  notificationId: string,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(`/pharmacie/notifications/${notificationId}/non-lue`, {
    method: "PUT",
    token,
  });
}

export async function deletePartnerNotification(
  token: string,
  notificationId: string,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(`/pharmacie/notifications/${notificationId}`, {
    method: "DELETE",
    token,
  });
}

/* ═══════════════════════ INCOHERENCES ═══════════════════════════ */

export interface PartnerIncoherence {
  id: string;
  pharmacie_id: string;
  user_id: string;
  nom_saisi: string;
  forme_saisie?: string | null;
  dosage_saisi?: string | null;
  quantite: number;
  prix_unitaire?: number | null;
  seuil_alerte?: number | null;
  seuil_critique?: number | null;
  date_expiration?: string | null;
  lot?: string | null;
  meilleure_similitude: number;
  suggestions: ProduitSuggestion[];
  statut: string;
  statut_label: string;
  statut_color: string;
  statut_icon: string;
  produit_fusionne_id?: string | null;
  produit_propose_id?: string | null;
  propose_at?: string | null;
  commentaire_admin?: string | null;
  traite_par?: string | null;
  traite_at?: string | null;
  pharmacie?: { id: string; nom: string; ville?: string | null } | null;
  user?: { id: string; nom: string; prenom: string; email: string } | null;
  produit_fusionne?: {
    id: string;
    nom: string;
    forme?: string | null;
    dosage?: string | null;
    code_produit?: string | null;
  } | null;
  produit_propose?: {
    id: string;
    nom: string;
    forme?: string | null;
    dosage?: string | null;
    code_produit?: string | null;
  } | null;
  traite_par_user?: { id: string; nom: string; prenom: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProduitSuggestion {
  produit_id: string | null;
  nom: string;
  forme?: string | null;
  dosage?: string | null;
  score: number;
  produit?: {
    id: string;
    nom: string;
    code_produit?: string | null;
    forme?: string | null;
    dosage?: string | null;
    presentation?: string | null;
  } | null;
}

export interface PartnerIncoherencesResponse {
  success: boolean;
  data: PaginatedApi<PartnerIncoherence> | PartnerIncoherence[];
}

export interface PartnerIncoherenceDetailResponse {
  success: boolean;
  data: PartnerIncoherence;
}

export interface PartnerIncoherenceStatsResponse {
  success: boolean;
  data: {
    total: number;
    en_attente: number;
    fusionnees: number;
    confirmees_admin: number;
    rejetees: number;
  };
}

export interface SoumettreResultResponse {
  success: boolean;
  message: string;
  data: {
    action: "ajout_direct" | "incoherence_pharmacien" | "incoherence_admin";
    score?: number;
    stock_existant?: boolean;
    produit?: { id: string; nom: string; code_produit?: string | null; forme?: string | null; dosage?: string | null };
    stock?: Record<string, unknown>;
    mouvement?: Record<string, unknown>;
    incoherence?: PartnerIncoherence;
  };
}

export async function soumettrePartnerProduit(
  token: string,
  payload: {
    nom: string;
    forme?: string;
    dosage?: string;
    quantite: number;
    prix_unitaire?: number;
    seuil_alerte?: number;
    seuil_critique?: number;
    date_expiration?: string;
    lot?: string;
  },
): Promise<SoumettreResultResponse> {
  return apiRequest<SoumettreResultResponse>("/pharmacie/produits/soumettre", {
    method: "POST",
    token,
    ...buildJsonRequest(payload),
  });
}

export async function getPartnerIncoherences(
  token: string,
  params?: { statut?: string; search?: string; date_debut?: string; date_fin?: string; per_page?: number },
): Promise<PartnerIncoherencesResponse> {
  const qs = new URLSearchParams();
  if (params?.statut) qs.set("statut", params.statut);
  if (params?.search) qs.set("search", params.search);
  if (params?.date_debut) qs.set("date_debut", params.date_debut);
  if (params?.date_fin) qs.set("date_fin", params.date_fin);
  if (params?.per_page) qs.set("per_page", String(params.per_page));

  const query = qs.toString();
  return apiRequest<PartnerIncoherencesResponse>(`/pharmacie/incoherences${query ? `?${query}` : ""}`, {
    method: "GET",
    token,
  });
}

export async function getPartnerIncoherenceStats(
  token: string,
): Promise<PartnerIncoherenceStatsResponse> {
  return apiRequest<PartnerIncoherenceStatsResponse>("/pharmacie/incoherences/statistiques", {
    method: "GET",
    token,
  });
}

export async function getPartnerIncoherence(
  token: string,
  id: string,
): Promise<PartnerIncoherenceDetailResponse> {
  return apiRequest<PartnerIncoherenceDetailResponse>(`/pharmacie/incoherences/${id}`, {
    method: "GET",
    token,
  });
}

export async function fusionnerPartnerIncoherence(
  token: string,
  incoherenceId: string,
  produitId: string,
): Promise<{ success: boolean; message?: string; data?: Record<string, unknown> }> {
  return apiRequest<{ success: boolean; message?: string; data?: Record<string, unknown> }>(
    `/pharmacie/incoherences/${incoherenceId}/fusionner`,
    {
      method: "POST",
      token,
      ...buildJsonRequest({ produit_id: produitId }),
    },
  );
}

export async function proposerPartnerIncoherence(
  token: string,
  incoherenceId: string,
): Promise<{ success: boolean; message?: string; data?: PartnerIncoherence }> {
  return apiRequest<{ success: boolean; message?: string; data?: PartnerIncoherence }>(
    `/pharmacie/incoherences/${incoherenceId}/proposer`,
    {
      method: "POST",
      token,
    },
  );
}

// ─── Import batch ───────────────────────────────────────────────────────────

export interface ImportBatchResultErreur {
  ligne: number;
  nom: string | null;
  message: string;
}

export interface ImportBatchResult {
  total: number;
  ajoutes: number;
  incoherences: number;
  erreurs: ImportBatchResultErreur[];
}

/**
 * Envoie un fichier CSV ou Excel au backend pour import en masse.
 * Chaque ligne passe par le système de similitude (même logique que l'ajout manuel).
 */
export async function importerBatchPartnerProduits(
  token: string,
  fichier: File,
): Promise<{ success: boolean; message: string; data: ImportBatchResult }> {
  const form = new FormData();
  form.append("fichier", fichier);

  return apiRequest<{ success: boolean; message: string; data: ImportBatchResult }>(
    "/pharmacie/produits/importer-batch",
    {
      method: "POST",
      token,
      body: form,
      // Pas de Content-Type : le browser le pose automatiquement avec le boundary
    },
  );
}

/**
 * Télécharge le template CSV rempli d'un exemple.
 * Retourne un Blob à transformer en lien de téléchargement côté client.
 */
export async function telechargerTemplateImportProduits(token: string): Promise<Blob> {
  const { API_BASE_URL } = await import("./config");
  const response = await fetch(`${API_BASE_URL}/pharmacie/produits/template-import`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*",
    },
  });
  if (!response.ok) {
    throw new Error("Impossible de télécharger le template.");
  }
  return response.blob();
}
