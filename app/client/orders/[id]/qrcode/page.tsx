"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { getCommandeQrCode } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

export default function QrCodePage() {
  return (
    <Suspense fallback={<div />}>
      <QrCodePageContent />
    </Suspense>
  );
}

function QrCodePageContent() {
  const router = useRouter();
  const params = useParams();
  const commandeId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<{
    code: string;
    imageDataUrl?: string | null;
    imageUrl?: string | null;
    tempsRestant?: string | null;
    expiresAt?: string | null;
    commandeNumero?: string;
    commandeTotal?: string;
    pharmacieNom?: string;
    pharmacieAdresse?: string;
    pharmacieTelephone?: string;
    pharmacieEmail?: string;
  } | null>(null);

  const token = useMemo(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") return null;
    return session.token;
  }, []);

  useEffect(() => {
    if (!token) {
      clearAuthSession();
      router.replace("/client/connexion");
      return;
    }

    if (!commandeId) return;

    const load = async () => {
      try {
        const response = await getCommandeQrCode(token, commandeId);
        const d = response.data;
        setQrData({
          code: d.qr_code.code,
          imageDataUrl: d.qr_code.image_data_url,
          imageUrl: d.qr_code.image_url,
          tempsRestant: d.qr_code.temps_restant,
          expiresAt: d.qr_code.expires_at,
          commandeNumero: d.commande?.numero,
          commandeTotal: d.commande?.total != null ? String(d.commande.total) : undefined,
          pharmacieNom: d.pharmacie?.nom,
          pharmacieAdresse: d.pharmacie?.adresse,
          pharmacieTelephone: d.pharmacie?.telephone,
          pharmacieEmail: d.pharmacie?.email,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
        router.back();
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [token, commandeId, router]);

  const imageSrc = qrData?.imageDataUrl ?? qrData?.imageUrl ?? null;

  const mapsUrl = qrData?.pharmacieAdresse
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(qrData.pharmacieAdresse)}`
    : null;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-toni-green-dark-2 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!qrData) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-3 pb-10 sm:px-6">
      {/* ── Header pharmacie ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#004B2F] to-[#00B16F] px-6 py-5 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center">
        {/* Colonne 1 : nom + adresse */}
        <div className="flex-1 min-w-0">
          {qrData.pharmacieNom && (
            <h2 className="text-xl font-bold text-white sm:text-2xl leading-snug">
              <span className="block">{qrData.pharmacieNom.split(' ')[0]}</span>
              <span className="block">{qrData.pharmacieNom.split(' ').slice(1).join(' ')}</span>
            </h2>
          )}
          {qrData.pharmacieAdresse && (
            <p className="mt-1 text-sm text-green-100 leading-snug">{qrData.pharmacieAdresse}</p>
          )}
        </div>

        {/* Colonne 2 : email + téléphone + expiration (centré) */}
        <div className="flex flex-col gap-1 sm:items-center sm:text-center">
          {qrData.pharmacieEmail && (
            <a href={`mailto:${qrData.pharmacieEmail}`} className="text-white text-sm font-medium hover:underline">
              {qrData.pharmacieEmail}
            </a>
          )}
          {qrData.pharmacieTelephone && (
            <a href={`tel:${qrData.pharmacieTelephone}`} className="text-white text-sm font-medium hover:underline">
              {qrData.pharmacieTelephone}
            </a>
          )}
          {/* {qrData.tempsRestant && (
            <p className="text-green-200 text-xs mt-1">Expire dans {qrData.tempsRestant}</p>
          )} */}
        </div>

        {/* Colonne 3 : bouton itinéraire (aligné à droite) */}
        <div className="flex sm:justify-end">
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-toni-green-dark-2 hover:bg-gray-50 transition"
            >
              <MapPin size={16} />
              Itinéraire
            </a>
          )}
        </div>
      </div>

      {/* ── Corps : instructions + QR ── */}
      <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
        {/* Instructions */}
        <div className="flex-1 space-y-4 text-base text-gray-700">
          <p>Présentez ce QR code à la pharmacie pour récupérer votre commande.</p>
          <p>
            Si des médicaments nécessitent une{" "}
            <strong className="text-toni-green-dark-2">ordonnance</strong>
            , assurez-vous de l&apos;avoir lors du retrait.
          </p>
        </div>

        {/* QR code */}
        <div className="shrink-0 flex flex-col items-center gap-3">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={`QR code commande ${qrData.commandeNumero ?? ""}`}
              className="h-52 w-52 object-contain sm:h-60 sm:w-60"
            />
          ) : (
            <div className="h-52 w-52 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400">
              QR indisponible
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
