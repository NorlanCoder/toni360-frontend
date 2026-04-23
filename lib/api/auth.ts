import { apiRequest, buildJsonRequest } from "./http";

interface PatientRegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  password_confirmation: string;
}

interface PartnerRegisterPayload {
  pharmacie_nom: string;
  adresse: string;
  ville?: string;
  telephone: string;
  email: string;
  titulaire_nom?: string;
  titulaire_prenom?: string;
  password: string;
  password_confirmation: string;
  licence_pharmaceutique?: File;
}

interface LoginPayload {
  login: string;
  password: string;
}

export interface AuthApiResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    token_type: string;
    patient?: unknown;
    user?: unknown;
    permissions?: string[];
  };
}

export interface PatientProfileResponse {
  success: boolean;
  data: {
    patient: {
      id: string;
      nom: string;
      prenom: string;
      nom_complet?: string;
      email: string;
      telephone: string;
      is_active?: boolean;
    };
  };
}

export interface PartnerProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      nom: string;
      prenom: string;
      nom_complet?: string;
      email: string;
      telephone: string;
      is_active?: boolean;
      pharmacie?: {
        id: string;
        nom: string;
        code?: string;
        adresse?: string;
        telephone?: string;
      };
    };
    permissions?: string[];
  };
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export async function registerPatient(payload: PatientRegisterPayload): Promise<AuthApiResponse> {
  const json = buildJsonRequest(payload);
  return apiRequest<AuthApiResponse>("/patient/auth/register", {
    method: "POST",
    body: json.body,
    headers: json.headers,
  });
}

export async function loginPatient(payload: LoginPayload): Promise<AuthApiResponse> {
  const json = buildJsonRequest(payload);
  return apiRequest<AuthApiResponse>("/patient/auth/login", {
    method: "POST",
    body: json.body,
    headers: json.headers,
  });
}

export async function registerPartner(payload: PartnerRegisterPayload): Promise<AuthApiResponse> {
  const form = new FormData();
  form.append("pharmacie_nom", payload.pharmacie_nom);
  form.append("adresse", payload.adresse);
  if (payload.ville) {
    form.append("ville", payload.ville);
  }
  form.append("telephone", payload.telephone);
  form.append("email", payload.email);
  if (payload.titulaire_nom) {
    form.append("titulaire_nom", payload.titulaire_nom);
  }
  if (payload.titulaire_prenom) {
    form.append("titulaire_prenom", payload.titulaire_prenom);
  }
  form.append("password", payload.password);
  form.append("password_confirmation", payload.password_confirmation);
  if (payload.licence_pharmaceutique) {
    form.append("licence_pharmaceutique", payload.licence_pharmaceutique);
  }

  return apiRequest<AuthApiResponse>("/user/auth/register", {
    method: "POST",
    body: form,
  });
}

export async function loginPartner(payload: LoginPayload): Promise<AuthApiResponse> {
  const json = buildJsonRequest(payload);
  return apiRequest<AuthApiResponse>("/user/auth/login", {
    method: "POST",
    body: json.body,
    headers: json.headers,
  });
}

export async function getPatientProfile(token: string): Promise<PatientProfileResponse> {
  return apiRequest<PatientProfileResponse>("/patient/profile", {
    method: "GET",
    token,
  });
}

export async function getPartnerProfile(token: string): Promise<PartnerProfileResponse> {
  return apiRequest<PartnerProfileResponse>("/pharmacie/profile", {
    method: "GET",
    token,
  });
}

export async function logoutPatient(token: string): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>("/patient/auth/logout", {
    method: "POST",
    token,
  });
}

export async function logoutPartner(token: string): Promise<LogoutResponse> {
  return apiRequest<LogoutResponse>("/pharmacie/auth/logout", {
    method: "POST",
    token,
  });
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export async function forgotPassword(email: string): Promise<PasswordResetResponse> {
  const json = buildJsonRequest({ email });
  return apiRequest<PasswordResetResponse>("/auth/forgot-password", {
    method: "POST",
    body: json.body,
    headers: json.headers,
  });
}

export async function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<PasswordResetResponse> {
  const json = buildJsonRequest(payload);
  return apiRequest<PasswordResetResponse>("/auth/reset-password", {
    method: "POST",
    body: json.body,
    headers: json.headers,
  });
}
