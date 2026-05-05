import { apiRequest, buildJsonRequest } from "./http";

export interface SearchTermInput {
  terme: string;
  quantite: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PatientSearchPharmacy {
  pharmacie: {
    id: string;
    nom: string;
    adresse?: string | null;
    ville?: string | null;
    quartier?: string | null;
    telephone?: string | null;
    distance_km?: number;
  };
  produits: Array<{
    id: string;
    nom: string;
    forme?: string | null;
    dosage?: string | null;
    prix: number;
    quantite_disponible: number;
    quantite_demandee: number;
    necessite_ordonnance?: boolean;
  }>;
}

export interface PatientSearchResponse {
  success: boolean;
  message?: string;
  data: {
    recherche_id: string;
    solution_trouvee: boolean;
    pharmacies: PatientSearchPharmacy[];
  };
}

export interface ProductSuggestionsResponse {
  success: boolean;
  data: {
    suggestions: string[];
  };
}

export interface PatientPanierResponse {
  success: boolean;
  message?: string;
  data: {
    panier: {
      id: string;
      total: number;
      pharmacies: Array<{
        pharmacie: {
          id: string;
          nom: string;
          adresse?: string | null;
          ville?: string | null;
          telephone?: string | null;
        };
        produits: Array<{
          id: string;
          quantite: number;
          prix_unitaire: number;
          sous_total: number;
          produit: {
            id: string;
            nom: string;
            forme?: string | null;
            dosage?: string | null;
            necessite_ordonnance?: boolean;
          };
        }>;
      }>;
      produits_avec_ordonnance: Array<{
        produit_id: string;
        nom: string;
      }>;
    };
  };
}

export interface CommandeSummary {
  id: string;
  numero_commande: string;
  statut: string;
  statut_label: string;
  etat_ordonnance?: string;
  montant_total: number;
  pharmacie?: {
    nom?: string;
    adresse?: string;
    telephone?: string;
  } | null;
  created_at?: string;
}

interface PaginatedApi<T> {
  data: T[];
}

export interface PatientCommandesResponse {
  success: boolean;
  data: PaginatedApi<CommandeSummary> | CommandeSummary[];
}

export interface PatientCommandeCompteursResponse {
  success: boolean;
  data: {
    en_attente_ordonnance: number;
    en_attente_client: number;
    ordonnance_en_verification: number;
    ordonnance_rejetee: number;
    en_attente_paiement: number;
    en_cours: number;
    payee: number;
    en_preparation: number;
    prete: number;
    recuperee: number;
    annulee: number;
    total: number;
    total_en_attente: number;
    total_en_cours: number;
    total_prete: number;
    total_recuperee: number;
    total_annulee: number;
    total_terminee: number;
  };
}

export interface CreateCommandeResponse {
  success: boolean;
  message?: string;
  data: {
    commande: {
      id: string;
      numero_commande: string;
      necessite_ordonnance: boolean;
    };
    necessite_ordonnance: boolean;
  };
}

export interface CommandeDetailResponse {
  success: boolean;
  data: {
    commande: {
      id: string;
      numero_commande?: string;
      statut?: string;
      statut_label?: string;
      produits: Array<{
        id: string;
        quantite?: number;
        prix_unitaire?: number;
        prix_total?: number;
        ordonnance_requise: boolean;
        ordonnance?: {
          id: string;
          statut?: string;
          statut_label?: string;
          fichier_url?: string | null;
        } | null;
        produit?: {
          id: string;
          nom: string;
        } | null;
      }>;
      pharmacie?: {
        nom?: string;
        adresse?: string;
        telephone?: string;
      } | null;
    };
  };
}

export interface InitPaiementCommandeResponse {
  success: boolean;
  message?: string;
  data: {
    paiement_id: string;
    reference: string;
    montant: number;
    mode_paiement: string;
    qr_code?: {
      code: string;
      expire_at?: string;
    };
    instructions?: string[];
  };
}

export interface ConfirmPaiementCommandeResponse {
  success: boolean;
  message?: string;
  data: {
    commande: {
      id: string;
      statut?: string;
      statut_label?: string;
    };
    qr_code?: {
      code: string;
      expire_at?: string;
      instructions?: string;
    };
  };
}

export interface SuiviCommandeResponse {
  success: boolean;
  data: {
    commande: {
      statut_label: string;
    };
    etapes: Array<{
      statut: string;
      label: string;
      complete: boolean;
    }>;
  };
}

export interface PatientOrderQrCodeResponse {
  success: boolean;
  message?: string;
  data: {
    qr_code: {
      id: string;
      code: string;
      image_url?: string | null;
      image_data_url?: string | null;
      statut: string;
      est_valide: boolean;
      est_expire: boolean;
      est_utilise: boolean;
      peut_regenerer: boolean;
      temps_restant?: string | null;
      expires_at?: string | null;
      used_at?: string | null;
      created_at?: string | null;
    };
    commande?: {
      id?: string;
      numero?: string;
      statut?: string;
      statut_label?: string;
      total?: number;
    };
    pharmacie?: {
      id?: string;
      nom?: string;
      adresse?: string;
      telephone?: string;
      email?: string;
    } | null;
    instructions?: string[];
  };
}

export interface PatientNotificationItem {
  id: string;
  titre: string;
  message: string;
  is_read: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: PaginatedApi<PatientNotificationItem> | PatientNotificationItem[];
    stats?: {
      non_lues: number;
      necessitant_action: number;
    };
  };
}

export interface NotificationCountResponse {
  success: boolean;
  data: {
    total_non_lues?: number;
    non_lues?: number;
    necessitant_action?: number;
  };
}

export interface PatientProfileResponse {
  success: boolean;
  message?: string;
  data: {
    patient: {
      id: string;
      nom: string;
      prenom: string;
      nom_complet?: string;
      email: string;
      telephone: string;
      ville?: string | null;
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

export async function searchProduits(
  token: string,
  produits: SearchTermInput[],
  coordinates: Coordinates,
): Promise<PatientSearchResponse> {
  const json = buildJsonRequest({
    produits,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  });

  return apiRequest<PatientSearchResponse>("/patient/recherche", {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function getProductSuggestions(
  token: string,
  query: string,
): Promise<ProductSuggestionsResponse> {
  const qs = encodeURIComponent(query);
  return apiRequest<ProductSuggestionsResponse>(`/patient/recherche/suggestions?q=${qs}`, {
    method: "GET",
    token,
  });
}

export async function getPanier(token: string): Promise<PatientPanierResponse> {
  return apiRequest<PatientPanierResponse>("/patient/panier", {
    method: "GET",
    token,
  });
}

export async function addPanierItem(
  token: string,
  produitId: string,
  quantite: number,
  rechercheId?: string,
  pharmacieId?: string,
): Promise<PatientPanierResponse> {
  const json = buildJsonRequest({
    produit_id: produitId,
    quantite,
    ...(rechercheId ? { recherche_id: rechercheId } : {}),
    ...(pharmacieId ? { pharmacie_id: pharmacieId } : {}),
  });

  return apiRequest<PatientPanierResponse>("/patient/panier/produits", {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function updatePanierItemQuantity(
  token: string,
  produitPanierId: string,
  quantite: number,
): Promise<PatientPanierResponse> {
  const json = buildJsonRequest({ quantite });
  return apiRequest<PatientPanierResponse>(`/patient/panier/produits/${produitPanierId}`, {
    method: "PUT",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function removePanierItem(token: string, produitPanierId: string): Promise<PatientPanierResponse> {
  return apiRequest<PatientPanierResponse>(`/patient/panier/produits/${produitPanierId}`, {
    method: "DELETE",
    token,
  });
}

export async function clearPanier(token: string): Promise<PatientPanierResponse> {
  return apiRequest<PatientPanierResponse>("/patient/panier", {
    method: "DELETE",
    token,
  });
}

export async function getClientCommandes(token: string, statut?: string, perPage?: number): Promise<PatientCommandesResponse> {
  const params = new URLSearchParams();
  if (statut) params.set("statut", statut);
  if (perPage) params.set("per_page", String(perPage));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<PatientCommandesResponse>(`/patient/commandes${qs}`, {
    method: "GET",
    token,
  });
}

export async function getClientCommandeCompteurs(token: string): Promise<PatientCommandeCompteursResponse> {
  return apiRequest<PatientCommandeCompteursResponse>("/patient/commandes/compteurs", {
    method: "GET",
    token,
  });
}

export async function createCommande(
  token: string,
  panierId: string,
  commentaire?: string,
): Promise<CreateCommandeResponse> {
  const json = buildJsonRequest({
    panier_id: panierId,
    ...(commentaire ? { commentaire } : {}),
  });
  return apiRequest<CreateCommandeResponse>("/patient/commandes", {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function getCommande(token: string, commandeId: string): Promise<CommandeDetailResponse> {
  return apiRequest<CommandeDetailResponse>(`/patient/commandes/${commandeId}`, {
    method: "GET",
    token,
  });
}

export async function suivreCommande(token: string, commandeId: string): Promise<SuiviCommandeResponse> {
  return apiRequest<SuiviCommandeResponse>(`/patient/commandes/${commandeId}/suivre`, {
    method: "GET",
    token,
  });
}

export async function initierCommandePaiement(
  token: string,
  commandeId: string,
  modePaiement: "MTN" | "MOOV" | "CELTIIS",
  numeroTelephone: string,
): Promise<InitPaiementCommandeResponse> {
  const json = buildJsonRequest({
    mode_paiement: modePaiement,
    numero_telephone: numeroTelephone,
  });

  return apiRequest<InitPaiementCommandeResponse>(`/patient/commandes/${commandeId}/paiement`, {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function confirmerCommandePaiement(
  token: string,
  commandeId: string,
  reference: string,
): Promise<ConfirmPaiementCommandeResponse> {
  const json = buildJsonRequest({ reference });

  return apiRequest<ConfirmPaiementCommandeResponse>(`/patient/commandes/${commandeId}/paiement/confirmer`, {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function getCommandeQrCode(
  token: string,
  commandeId: string,
): Promise<PatientOrderQrCodeResponse> {
  return apiRequest<PatientOrderQrCodeResponse>(`/patient/qr-codes/commande/${commandeId}`, {
    method: "GET",
    token,
  });
}

export async function annulerCommande(token: string, commandeId: string, motif?: string): Promise<{ success: boolean; message?: string }> {
  const json = buildJsonRequest({ motif: motif ?? "Annulée par le patient" });
  return apiRequest<{ success: boolean; message?: string }>(`/patient/commandes/${commandeId}/annuler`, {
    method: "POST",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function validerCommande(token: string, commandeId: string): Promise<{ success: boolean; message?: string; data?: { commande?: { statut?: string; statut_label?: string } } }> {
  return apiRequest<{ success: boolean; message?: string; data?: { commande?: { statut?: string; statut_label?: string } } }>(`/patient/commandes/${commandeId}/valider`, {
    method: "POST",
    token,
  });
}

export async function mettreEnAttenteCommande(token: string, commandeId: string): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(`/patient/commandes/${commandeId}/mettre-en-attente`, {
    method: "POST",
    token,
  });
}

export interface VerifierDisponibiliteCommandeResponse {
  success: boolean;
  message?: string;
  data?: {
    commande_annulee?: boolean;
    commande?: CommandeDetailResponse["data"]["commande"];
    produits_supprimes?: Array<{ id: string; nom: string }>;
    produits_ajustes?: Array<{ id: string; nom: string; quantite_demandee: number; quantite_ajustee: number }>;
  };
}

export async function verifierDisponibiliteCommande(token: string, commandeId: string): Promise<VerifierDisponibiliteCommandeResponse> {
  return apiRequest<VerifierDisponibiliteCommandeResponse>(`/patient/commandes/${commandeId}/verifier-disponibilite`, {
    method: "POST",
    token,
  });
}

export async function modifierProduitCommande(
  token: string,
  commandeId: string,
  produitCommandeId: string,
  quantite: number,
): Promise<{ success: boolean; message?: string; data?: { quantite?: number; prix_total?: number; montant_total_commande?: number } }> {
  return apiRequest(`/patient/commandes/${commandeId}/produits/${produitCommandeId}`, {
    method: "PUT",
    token,
    body: JSON.stringify({ quantite }),
    headers: { "Content-Type": "application/json" },
  });
}

export async function supprimerProduitCommande(
  token: string,
  commandeId: string,
  produitCommandeId: string,
): Promise<{ success: boolean; message?: string; data?: { montant_total_commande?: number } }> {
  return apiRequest(`/patient/commandes/${commandeId}/produits/${produitCommandeId}`, {
    method: "DELETE",
    token,
  });
}

export async function uploadOrdonnanceForProduitCommande(
  token: string,
  produitCommandeId: string,
  fichier: File,
): Promise<{ success: boolean; message?: string }> {
  const form = new FormData();
  form.append("fichier", fichier);

  return apiRequest<{ success: boolean; message?: string }>(`/patient/ordonnances/produit/${produitCommandeId}`, {
    method: "POST",
    token,
    body: form,
  });
}

export async function getClientNotifications(token: string): Promise<NotificationsResponse> {
  return apiRequest<NotificationsResponse>("/patient/notifications", {
    method: "GET",
    token,
  });
}

export async function getClientNotificationCount(token: string): Promise<NotificationCountResponse> {
  return apiRequest<NotificationCountResponse>("/patient/notifications/count", {
    method: "GET",
    token,
  });
}

export async function markClientNotificationRead(
  token: string,
  notificationId: string,
): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(`/patient/notifications/${notificationId}/lue`, {
    method: "PUT",
    token,
  });
}

export async function markAllClientNotificationsRead(token: string): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>("/patient/notifications/lues", {
    method: "PUT",
    token,
  });
}

export async function deleteClientNotification(token: string, notificationId: string): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>(`/patient/notifications/${notificationId}`, {
    method: "DELETE",
    token,
  });
}

export async function deleteReadClientNotifications(token: string): Promise<{ success: boolean; message?: string }> {
  return apiRequest<{ success: boolean; message?: string }>("/patient/notifications/lues", {
    method: "DELETE",
    token,
  });
}

export async function updatePatientProfile(
  token: string,
  payload: Partial<Pick<PatientProfileResponse["data"]["patient"], "nom" | "prenom" | "email" | "telephone" | "ville">>,
): Promise<PatientProfileResponse> {
  const json = buildJsonRequest(payload);
  return apiRequest<PatientProfileResponse>("/patient/profile", {
    method: "PUT",
    token,
    body: json.body,
    headers: json.headers,
  });
}

export async function deletePatientAccount(token: string, password: string): Promise<{ success: boolean; message?: string }> {
  const json = buildJsonRequest({ password });
  return apiRequest<{ success: boolean; message?: string }>("/patient/account", {
    method: "DELETE",
    token,
    body: json.body,
    headers: json.headers,
  });
}

// ─── Historique des localisations ───────────────────────────────────────────

export interface LocalisationResultat {
  id: string;
  pharmacie_id: string;
  produit_id: string;
  prix: number;
  quantite_disponible: number;
  quantite_demandee: number;
  distance_km: number;
  ordre: number;
  pharmacie?: {
    id: string;
    nom: string;
    adresse?: string | null;
    ville?: string | null;
    telephone?: string | null;
  } | null;
  produit?: {
    id: string;
    nom: string;
    forme?: string | null;
    dosage?: string | null;
  } | null;
}

export interface LocalisationSummary {
  id: string;
  criteres: { produits: Array<{ terme: string; quantite: number }> };
  latitude_patient: number;
  longitude_patient: number;
  rayon_km: number;
  statut: string;
  date: string;
  created_at: string;
  resultats: LocalisationResultat[];
}

export interface HistoriqueLocalisationsResponse {
  success: boolean;
  data: {
    data: LocalisationSummary[];
    current_page?: number;
    last_page?: number;
    total?: number;
  };
}

export interface LocalisationDetailResponse {
  success: boolean;
  data: {
    recherche: LocalisationSummary;
  };
}

export async function getHistoriqueLocalisations(token: string): Promise<HistoriqueLocalisationsResponse> {
  return apiRequest<HistoriqueLocalisationsResponse>("/patient/recherche/historique", {
    method: "GET",
    token,
  });
}

export async function getLocalisationDetail(token: string, id: string): Promise<LocalisationDetailResponse> {
  return apiRequest<LocalisationDetailResponse>(`/patient/recherche/${id}`, {
    method: "GET",
    token,
  });
}

export async function getBrowserCoordinates(): Promise<Coordinates> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return { latitude: 6.3703, longitude: 2.3912 };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => resolve({ latitude: 6.3703, longitude: 2.3912 }),
      { timeout: 4000 },
    );
  });
}