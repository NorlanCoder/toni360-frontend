"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Lock } from "lucide-react";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      toast.error("Lien invalide. Veuillez demander un nouveau lien de réinitialisation.");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      toast.error("Lien invalide.");
      return;
    }
    if (formData.password.length < 8) {
      toast.warning("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.warning("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword({
        token,
        email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });
      setDone(true);
      toast.success(res.message ?? "Mot de passe réinitialisé !");
      setTimeout(() => router.push("/client/connexion"), 3000);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-6 text-center sm:mb-8">
        <Link href="/" aria-label="Accueil">
          <Image
            src="/images/logo.png"
            alt="Toni360"
            width={192}
            height={96}
            priority
            className="mx-auto h-20 w-auto sm:h-24"
          />
        </Link>
      </div>

      {/* Titre */}
      <h2 className="mb-3 text-center text-3xl text-gray-800 sm:text-4xl">
        Nouveau mot de passe
      </h2>
      {email && (
        <p className="mb-8 text-center text-sm text-gray-500">
          Compte : <strong>{email}</strong>
        </p>
      )}

      {done ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <div className="mb-3 text-4xl">✅</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800">Mot de passe mis à jour !</h3>
          <p className="text-sm text-gray-600">
            Votre mot de passe a été réinitialisé. Vous allez être redirigé vers la page de connexion…
          </p>
          <Link
            href="/client/connexion"
            className="mt-4 inline-block text-sm font-bold hover:underline"
            style={{ color: "#137551" }}
          >
            Se connecter maintenant →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nouveau mot de passe */}
          <div className="relative flex items-center">
            <Lock className="absolute left-4 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-md border border-black bg-white py-2.5 pl-12 pr-12 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirmer mot de passe */}
          <div className="relative flex items-center">
            <Lock className="absolute left-4 text-gray-400" size={18} />
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmer le nouveau mot de passe"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full rounded-md border border-black bg-white py-2.5 pl-12 pr-12 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Le mot de passe doit contenir au moins 8 caractères.
          </p>

          <button
            type="submit"
            disabled={submitting || !token || !email}
            className="w-full rounded-md py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 sm:py-3 sm:text-base"
            style={{ backgroundColor: "#137551" }}
          >
            {submitting ? "Enregistrement..." : "Réinitialiser le mot de passe"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/mot-de-passe-oublie" className="font-semibold hover:underline" style={{ color: "#137551" }}>
          Demander un nouveau lien
        </Link>
      </p>
    </div>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="flex min-h-screen">
      {/* Section Image - Gauche */}
      <div className="relative hidden lg:block lg:w-3/5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/ph6.png')" }}
        />
      </div>

      {/* Section Formulaire - Droite */}
      <div
        className="flex w-full flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:w-2/5 lg:px-8 lg:py-12"
        style={{ backgroundColor: "#eafff8" }}
      >
        <Suspense fallback={<p className="text-gray-500">Chargement…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
