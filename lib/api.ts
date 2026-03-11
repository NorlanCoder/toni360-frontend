const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getCookie("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const error: any = new Error(data.message || "Erreur API");
    error.errors = data.errors || null;
    throw error;
  }

  return data;
}

// ========== PATIENT ==========

export async function registerPatient(payload: {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  password_confirmation: string;
}) {
  const data = await apiRequest("/patient/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data.data?.token) setCookie("token", data.data.token);
  return data;
}

export async function loginPatient(payload: {
  login: string;
  password: string;
}) {
  const data = await apiRequest("/patient/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data.data?.token) setCookie("token", data.data.token);
  return data;
}

export async function getPatientProfile() {
  return apiRequest("/patient/profile");
}

export async function logoutPatient() {
  const data = await apiRequest("/patient/auth/logout", { method: "POST" });
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  return data;
}
