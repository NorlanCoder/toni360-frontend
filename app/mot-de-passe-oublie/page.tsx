"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { forgotPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.warning("Veuillez saisir votre adresse email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await forgotPassword(email.trim());
      setSent(true);
      toast.success(res.message ?? "Email envoyé !");
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
            Mot de passe oublié
          </h2>
          <p className="mb-8 text-center text-sm text-gray-500 sm:text-base">
            Saisissez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          {sent ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
              <div className="mb-3 text-4xl">📧</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">Email envoyé !</h3>
              <p className="text-sm text-gray-600">
                Si <strong>{email}</strong> est enregistré, vous recevrez un email avec le lien de réinitialisation dans quelques minutes.
              </p>
              <p className="mt-3 text-xs text-gray-500">
                Vérifiez vos spams si vous ne recevez rien. Le lien est valable <strong>60 minutes</strong>.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-5 text-sm font-semibold hover:underline"
                style={{ color: "#137551" }}
              >
                Renvoyer un email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-black bg-white px-4 py-2.5 text-sm text-black outline-none transition-colors focus:border-toni-green-dark-2 sm:py-3 sm:text-base"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md py-2.5 text-sm font-bold text-white transition hover:opacity-90 sm:py-3 sm:text-base"
                style={{ backgroundColor: "#137551" }}
              >
                {submitting ? "Envoi en cours..." : "Envoyer le lien"}
              </button>
            </form>
          )}

          {/* Liens retour */}
          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-gray-600 sm:mt-8">
            <Link href="/client/connexion" className="font-semibold hover:underline" style={{ color: "#137551" }}>
              ← Retour à la connexion client
            </Link>
            <Link href="/partenaire/connexion" className="font-semibold hover:underline" style={{ color: "#137551" }}>
              ← Retour à la connexion partenaire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
