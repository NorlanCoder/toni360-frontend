"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { getPatientProfile, resendOtp, verifyOtp } from "@/lib/api/auth";
import { saveAuthSession } from "@/lib/api/session";
import OtpInput from "@/components/auth/OtpInput";

const RESEND_COOLDOWN = 60;
export const SESSION_KEY = "otp_pending_email";

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailMasked = searchParams.get("email") ?? "";
  const purpose = searchParams.get("purpose") ?? "email_verification";

  const [emailReal, setEmailReal] = useState<string>("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) {
      router.replace("/client/connexion");
      return;
    }
    setEmailReal(stored);
    startCooldown();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCooldown = (seconds = RESEND_COOLDOWN) => {
    setCooldown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (code.length < 6) { toast.warning("Entrez les 6 chiffres du code."); return; }
    if (!emailReal) { toast.error("Session expirée. Veuillez recommencer."); router.push("/client/connexion"); return; }

    setSubmitting(true);
    try {
      const response = await verifyOtp({ login: emailReal, code, purpose });

      if (!response.success || !response.data?.token) {
        toast.error(response.message ?? "Code invalide.");
        return;
      }

      const profileResponse = await getPatientProfile(response.data.token);

      saveAuthSession({
        userType: "patient",
        token: response.data.token,
        tokenType: response.data.token_type ?? "Bearer",
        profile: profileResponse.data.patient ?? response.data.patient ?? null,
      });

      sessionStorage.removeItem(SESSION_KEY);
      toast.success("Vérification réussie. Bienvenue !");
      router.push("/client/accueil");
    } catch (error: unknown) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !emailReal) return;
    setResending(true);
    try {
      const response = await resendOtp({ login: emailReal, purpose });
      if (response.success) {
        toast.success("Un nouveau code vous a été envoyé.");
        startCooldown(response.retry_after_seconds ?? RESEND_COOLDOWN);
      } else {
        toast.error(response.message ?? "Impossible de renvoyer le code.");
        if (response.retry_after_seconds) startCooldown(response.retry_after_seconds);
      }
    } catch (error: unknown) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("Erreur lors du renvoi.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden lg:block lg:w-3/5">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/ph6.png')" }} />
      </div>

      <div
        className="flex w-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:w-2/5 lg:px-8"
        style={{ backgroundColor: "#eafff8" }}
      >
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" aria-label="Accueil">
              <Image src="/images/logo.png" alt="Toni360" width={192} height={96} priority className="mx-auto h-20 w-auto" />
            </Link>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-3xl text-gray-800 mb-2">Vérification</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Un code à 6 chiffres a été envoyé à<br />
              <span className="font-semibold text-gray-700">{emailMasked || "votre adresse email"}</span>
            </p>
          </div>

          <div className="mb-6">
            <OtpInput value={code} onChange={setCode} disabled={submitting} />
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={submitting || code.length < 6}
            className="w-full py-3 text-white font-bold text-base rounded-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#137551" }}
          >
            {submitting ? "Vérification..." : "Confirmer"}
          </button>

          <div className="mt-5 text-center text-sm text-gray-500">
            {cooldown > 0 ? (
              <span>Renvoyer le code dans <span className="font-semibold text-gray-700">{cooldown}s</span></span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-semibold text-toni-green-dark-2 hover:underline disabled:opacity-50"
              >
                {resending ? "Envoi en cours..." : "Renvoyer le code"}
              </button>
            )}
          </div>

          <div className="mt-4 text-center text-xs text-gray-400">
            <Link href="/client/connexion" className="hover:underline">← Retour à la connexion</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerificationOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerificationContent />
    </Suspense>
  );
}
