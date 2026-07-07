"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { X, FileUp, CheckCircle, AlertCircle, Download, FileText, FileSpreadsheet } from "lucide-react";
import {
  importerBatchPartnerProduits,
  telechargerTemplateImportProduits,
  type ImportBatchResult,
  type ImportBatchResultErreur,
} from "@/lib/api/partner";
import { ApiError } from "@/lib/api/errors";
import { getAuthSession } from "@/lib/api/session";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────────── */
type Step = "select" | "processing" | "done";

const ACCEPTED_TYPES = [
  "text/csv",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const ACCEPTED_EXT = ".csv,.xlsx,.xls";

/* ═══════════════════════ MODAL ═══════════════════════════════ */
interface ImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportModal({ onClose, onSuccess }: ImportModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportBatchResult | null>(null);
  const [resultMessage, setResultMessage] = useState("");
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Drag & drop ── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const validateAndSet = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "xlsx", "xls", "txt"].includes(ext) && !ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Format non supporté. Utilisez un fichier CSV ou Excel (.xlsx).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop lourd (max 10 Mo).");
      return;
    }
    setSelectedFile(file);
  };

  /* ── Import ── */
  const handleImport = async () => {
    if (!selectedFile) return;
    const session = getAuthSession();
    if (!session?.token) {
      toast.error("Session invalide.");
      return;
    }

    setStep("processing");
    try {
      const res = await importerBatchPartnerProduits(session.token, selectedFile);
      setResult(res.data);
      setResultMessage(res.message);
      setStep("done");
      if (res.data.ajoutes > 0) {
        onSuccess(); // recharger la liste
      }
    } catch (err: unknown) {
      setStep("select");
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de l'import.");
    }
  };

  /* ── Template download ── */
  const handleDownloadTemplate = async () => {
    const session = getAuthSession();
    if (!session?.token) return;
    setIsDownloadingTemplate(true);
    try {
      const blob = await telechargerTemplateImportProduits(session.token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template_import_medicaments.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de télécharger le modèle.");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const canClose = step !== "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={canClose ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative z-10 mx-4 w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-bold text-gray-800">Importer des médicaments</h2>
          {canClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* ── Step: select ── */}
          {step === "select" && (
            <div className="space-y-5">
              {/* Info */}
              <p className="text-sm text-gray-500">
                Importez un fichier <strong>CSV</strong> ou <strong>Excel (.xlsx)</strong> pour ajouter vos médicaments en masse. Chaque ligne passe par la vérification de similitude, exactement comme l&apos;ajout manuel.
              </p>

              {/* Colonnes */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                <p className="mb-1 font-semibold text-gray-700">Colonnes attendues :</p>
                <p>
                  <span className="text-red-500">nom*</span>
                  {" · nom_generique · forme · dosage · "}
                  <span className="text-red-500">quantite*</span>
                  {" · prix_unitaire · seuil_alerte · date_expiration · lot"}
                </p>
                <p className="mt-1 text-gray-400">* = obligatoire</p>
              </div>

              {/* Bouton télécharger exemple Excel */}
              <button
                type="button"
                disabled={isDownloadingTemplate}
                onClick={handleDownloadTemplate}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
              >
                <FileSpreadsheet className="h-5 w-5 shrink-0" />
                {isDownloadingTemplate ? "Téléchargement…" : "Télécharger un exemple Excel"}
                {!isDownloadingTemplate && (
                  <Download className="h-4 w-4 ml-auto shrink-0 text-emerald-500" />
                )}
              </button>

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-50"
                    : selectedFile
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_EXT}
                  className="hidden"
                  onChange={handleFileChange}
                />
                {selectedFile ? (
                  <>
                    <FileText className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                    <p className="font-medium text-emerald-700">{selectedFile.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} Ko — Cliquer pour changer
                    </p>
                  </>
                ) : (
                  <>
                    <FileUp className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p className="font-medium text-gray-600">Glisser-déposer ou cliquer</p>
                    <p className="mt-0.5 text-xs text-gray-400">CSV, XLS, XLSX — max 10 Mo</p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={!selectedFile}
                  onClick={handleImport}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Importer
                </button>
              </div>
            </div>
          )}

          {/* ── Step: processing ── */}
          {step === "processing" && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
              <p className="text-sm font-medium text-gray-700">Traitement en cours…</p>
              <p className="text-xs text-gray-400">
                Chaque médicament est vérifié par similitude. Cela peut prendre quelques secondes.
              </p>
            </div>
          )}

          {/* ── Step: done ── */}
          {step === "done" && result && (
            <div className="space-y-5">
              {/* Summary */}
              <p className="text-sm text-gray-600">{resultMessage}</p>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                  <p className="mt-0.5 text-xs text-gray-500">Total lignes</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-2xl font-bold text-emerald-700">{result.ajoutes}</p>
                  <p className="mt-0.5 text-xs text-emerald-600">Ajoutés</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-2xl font-bold text-amber-700">{result.incoherences}</p>
                  <p className="mt-0.5 text-xs text-amber-600">En vérification</p>
                </div>
              </div>

              {result.incoherences > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    {result.incoherences}{" "}
                    {result.incoherences > 1 ? "médicaments sont" : "médicament est"} en cours de
                    normalisation. Veuillez consulter la{" "}
                    <Link
                      href="/partenaire/medicaments/incoherences"
                      className="font-semibold underline hover:text-amber-900"
                    >
                      page de normalisation des produits
                    </Link>{" "}
                    afin de les traiter.
                  </p>
                </div>
              )}

              {/* Erreurs */}
              {result.erreurs.length > 0 && (
                <details className="rounded-lg border border-red-200">
                  <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {result.erreurs.length} {result.erreurs.length > 1 ? "erreurs" : "erreur"} — cliquer pour voir le détail
                  </summary>
                  <ul className="divide-y divide-red-100 px-4 pb-3 text-xs text-red-700">
                    {result.erreurs.map((e: ImportBatchResultErreur, i: number) => (
                      <li key={i} className="py-2">
                        <span className="font-semibold">Ligne {e.ligne}</span>
                        {e.nom && <span className="ml-1 text-gray-500">({e.nom})</span>}
                        {" — "}
                        {e.message}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {/* CTA */}
              <div className="flex justify-end gap-3">
                {result.erreurs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setStep("select"); setSelectedFile(null); setResult(null); }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Corriger et réimporter
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
