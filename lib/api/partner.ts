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
  dci?: string | null;
  forme: string;
  dosage?: string | null;
  prix_vente: number;
  is_active: boolean;
  stock?: {
    quantite: number;
    seuil_alerte: number;
    en_alerte: boolean;
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
  quantite: number;
  seuil_alerte: number;
  statut_label?: string;
  produit?: {
    id: string;
    nom: string;
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
  numero_agrement?: string | null;
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
  motif: string,
): Promise<PartnerCommandeDetailResponse> {
  const json = buildJsonRequest({ motif });
  return apiRequest<PartnerCommandeDetailResponse>(`/pharmacie/commandes/${commandeId}/rejeter-ordonnance`, {
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

export async function getPartnerStockStats(token: string): Promise<PartnerStockStatsResponse> {
  return apiRequest<PartnerStockStatsResponse>("/pharmacie/stocks/statistiques", {
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
    numero_agrement: string;
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
