"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Check, Eye, EyeOff, Lock, X } from "lucide-react";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { getPasswordRuleResults, getPasswordStrength, isPasswordStrong } from "@/lib/passwordPolicy";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const rawFrom = searchParams.get("from");
  const from = rawFrom === "client" || rawFrom === "partenaire" ? rawFrom : null;
  const redirectPath = from === "partenaire" ? "/partenaire/connexion" : "/client/connexion";

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [done, setDone] = useState(false);

  const passwordRules = getPasswordRuleResults(formData.password);
  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrong = isPasswordStrong(formData.password);

  useEffect(() => {
    if (!token || !email || !from) {
      toast.error("Lien invalide. Veuillez demander un nouveau lien de réinitialisation.");
    }
  }, [token, email, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !email || !from) {
      toast.error("Lien invalide.");
      return;
    }
    if (!passwordStrong) {
      setPasswordTouched(true);
      toast.warning("Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule, un chiffre et un caractere special.");
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
        from,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });
      setDone(true);
      toast.success(res.message ?? "Mot de passe réinitialisé !");
      setTimeout(() => router.push(redirectPath), 3000);
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
            href={redirectPath}
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
              onBlur={() => setPasswordTouched(true)}
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
              type={showPassword ? "text" : "password"}
              placeholder="Confirmer le nouveau mot de passe"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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

          {(passwordTouched || formData.password.length > 0) && !passwordStrong && (
            <div className="space-y-2 rounded-md border border-gray-200 bg-white p-2.5">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-gray-600">Robustesse</span>
                  <span className="font-semibold text-gray-700">{passwordStrength.label}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${passwordStrength.colorClass} transition-all duration-200`}
                    style={{ width: `${passwordStrength.percent}%` }}
                  />
                </div>
              </div>
              <ul className="space-y-0.5">
                {passwordRules.map((rule) => (
                  <li
                    key={rule.id}
                    className={`flex items-center gap-1.5 text-[11px] leading-tight ${rule.valid ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {rule.valid ? <Check size={12} className="shrink-0" /> : <X size={12} className="shrink-0" />}
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !token || !email || !from || !passwordStrong}
            className="w-full rounded-md py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 sm:py-3 sm:text-base"
            style={{ backgroundColor: "#137551" }}
          >
            {submitting ? "Enregistrement..." : "Réinitialiser le mot de passe"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href={from ? `/mot-de-passe-oublie?from=${from}` : "/client/connexion"} className="font-semibold hover:underline" style={{ color: "#137551" }}>
          Demander un nouveau lien
        </Link>
      </p>
    </div>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <Suspense fallback={<p className="text-gray-500">Chargement…</p>}>
      <ReinitialiserMotDePasseContent />
    </Suspense>
  );
}

function ReinitialiserMotDePasseContent() {
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from");
  const from = rawFrom === "client" || rawFrom === "partenaire" ? rawFrom : "client";

  return (
    <div className="flex min-h-screen">
      {/* Section Image - Gauche */}
      <div className="relative hidden lg:block lg:w-3/5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: from === "partenaire" ? "url('/images/imgc.jpg')" : "url('/images/ph6.png')" }}
        />
      </div>

      {/* Section Formulaire - Droite */}
      <div
        className="flex w-full flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:w-2/5 lg:px-8 lg:py-12"
        style={{ backgroundColor: "#eafff8" }}
      >
        <ResetPasswordForm />
      </div>
    </div>
  );
}
