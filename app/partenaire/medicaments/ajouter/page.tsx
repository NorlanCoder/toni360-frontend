"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmationModal from "@/components/ConfirmationModal";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import { soumettrePartnerProduit, getPartnerProduits, getPartnerProduitFormes, extractCollection } from "@/lib/api/partner";
import { toast } from "sonner";

const FORMES_DEFAUT = [
  "Comprimés",
  "Gélules",
  "Sirop",
  "Crème",
  "Pommade",
  "Injection",
  "Gouttes",
  "Suppositoire",
  "Solution buvable",
  "Poudre",
  "Patch",
  "Spray",
];

/* ──────────────── Helpers numériques ────────────────────────── */
/** Formate un entier avec séparateurs de milliers (stock, seuil). */
function formatMilliers(raw: string): string {
  if (!raw) return "";
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

/** Formate un prix avec séparateurs de milliers + décimales (ex: "1 500,75"). */
function formatPrix(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(",");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return decPart !== undefined ? `${formatted},${decPart}` : formatted;
}

/** N'autorise que les chiffres (entiers). */
function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** N'autorise que les chiffres et une virgule décimale (prix). */
function onlyPrixChars(value: string): string {
  // Supprimer espaces insécables et espaces classiques (séparateurs de milliers affichés)
  const cleaned = value.replace(/[\s\u00a0]/g, "");
  // N'autoriser que chiffres + une seule virgule
  const withoutInvalid = cleaned.replace(/[^\d,]/g, "");
  const parts = withoutInvalid.split(",");
  if (parts.length > 2) return parts[0] + "," + parts.slice(1).join("");
  return withoutInvalid;
}

/* ═══════════════════════════ PAGE ═══════════════════════════════ */
export default function PartenaireAjouterMedicamentPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Formes pharmaceutiques ── */
  const [formes, setFormes] = useState<string[]>(FORMES_DEFAUT);

  useEffect(() => {
    const session = getAuthSession();
    if (!session?.token) return;
    getPartnerProduitFormes(session.token)
      .then((res) => {
        const apiFormes = res.data?.formes ?? [];
        if (apiFormes.length > 0) {
          // Fusionner les formes API avec les formes par défaut (sans doublons, insensible à la casse)
          const merged = [...FORMES_DEFAUT];
          for (const f of apiFormes) {
            if (!merged.some((d) => d.toLowerCase() === f.toLowerCase())) {
              merged.push(f);
            }
          }
          setFormes(merged.sort());
        }
      })
      .catch(() => {/* garder FORMES_DEFAUT */});
  }, []);

  /* ── Form state ── */
  const [nom, setNom] = useState("");
  const [nomGenerique, setNomGenerique] = useState("");
  const [forme, setForme] = useState("");
  const [dosage, setDosage] = useState("");
  const [prix, setPrix] = useState("");
  const [stockInitial, setStockInitial] = useState("");
  const [seuil, setSeuil] = useState("");
  const [ordonnance, setOrdonnance] = useState(false);

  /* ── Autocomplete state ── */
  const [suggestions, setSuggestions] = useState<{ id: string; nom: string; dci?: string | null; forme?: string | null; dosage?: string | null }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nomInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /* ── Auto-close modal after 3 s ── */
  useEffect(() => {
    if (!showModal) return;
    const timer = setTimeout(() => {
      setShowModal(false);
      router.push("/partenaire/medicaments");
    }, 3000);
    return () => clearTimeout(timer);
  }, [showModal, router]);

  /* ── Close suggestions on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        !nomInputRef.current?.contains(e.target as Node) &&
        !suggestionsRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Debounced search ── */
  const handleNomChange = (value: string) => {
    setNom(value);
    setShowSuggestions(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim() || value.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const session = getAuthSession();
      if (!session?.token) return;
      try {
        const res = await getPartnerProduits(session.token, { search: value, per_page: 6 });
        const items = extractCollection(res.data);
        setSuggestions(items.map((p) => ({ id: p.id, nom: p.nom, dci: p.nom_generique ?? null, forme: p.forme ?? null, dosage: p.dosage ?? null })));
        setShowSuggestions(items.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSelectSuggestion = (s: { nom: string; dci?: string | null; forme?: string | null; dosage?: string | null }) => {
    setNom(s.nom);
    setNomGenerique(s.dci ?? "");
    if (s.dosage) setDosage(s.dosage);
    if (s.forme) {
      const match = formes.find((f) => f.toLowerCase() === s.forme!.toLowerCase());
      if (match) setForme(match);
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      toast.error("Session partenaire invalide.");
      return;
    }

    const prixVente = Number(prix.replace(",", "."));
    const quantite = Number(stockInitial);
    const seuilAlerte = Number(seuil);

    if (!nom || Number.isNaN(quantite) || quantite < 1) {
      toast.warning("Veuillez remplir correctement le formulaire (nom et quantité requis).");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await soumettrePartnerProduit(session.token, {
        nom,
        forme: forme || undefined,
        dosage: dosage || undefined,
        quantite,
        prix_unitaire: prix && !Number.isNaN(prixVente) ? prixVente : undefined,
        seuil_alerte: seuil && !Number.isNaN(seuilAlerte) ? seuilAlerte : undefined,
      });

      const action = result.data.action;

      if (action === "ajout_direct") {
        const produitLabel = result.data.produit?.nom ?? nom;
        setModalMessage(
          result.data.stock_existant
            ? `Le produit "${produitLabel}" existe déjà dans votre stock. La quantité initiale a été ajoutée.`
            : `Le médicament "${produitLabel}" a été ajouté au stock initial avec succès.`,
        );
        setShowModal(true);
      } else {
        if (action === "incoherence_pharmacien") {
          toast.info("Aucune correspondance exacte trouvée. Le médicament a été envoyé en vérification des incohérences.", { duration: 7000 });
        } else {
          toast.info("Aucune correspondance fiable trouvée. Le médicament est transmis pour détection de similarité/incohérence.", { duration: 7000 });
        }
        router.push("/partenaire/medicaments/incoherences");
      }
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la soumission du médicament.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const today = new Date().toLocaleDateString("fr-FR", {
  //   day: "2-digit",
  //   month: "2-digit",
  //   year: "numeric",
  // });
  // const timeNow = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <main className="flex-1 overflow-y-auto px-4 sm:px-12 lg:px-32 py-10 lg:py-16">
        <Link
          href="/partenaire/medicaments"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-toni-green-dark-2 hover:underline mb-6"
        >
          ← Retour aux médicaments
        </Link>
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-[920px] rounded-xl bg-white p-6 sm:p-8"
        >
          {/* Row 1 — Nom + Nom générique */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="relative">
              <label className="mb-1 block text-sm text-gray-500">
                Nom du médicament
              </label>
              <input
                ref={nomInputRef}
                type="text"
                value={nom}
                onChange={(e) => handleNomChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Ex: Paracétamol 500mg"
                autoComplete="off"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-gray-200 bg-white shadow-lg"
                >
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={() => handleSelectSuggestion(s)}
                      className="flex w-full flex-col px-3 py-2 text-left hover:bg-emerald-50"
                    >
                      <span className="text-sm font-medium text-gray-800">{s.nom}</span>
                      {s.dci && (
                        <span className="text-xs text-gray-400">
                          {s.dci}{s.forme ? ` · ${s.forme}` : ""}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-500">
                Nom générique
              </label>
              <input
                type="text"
                value={nomGenerique}
                onChange={(e) => setNomGenerique(e.target.value)}
                placeholder="Ex: Paracétamol"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 2 — Forme + Dosage */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-500">
                Forme pharmaceutique
              </label>
              <div className="relative">
                <select
                  value={forme}
                  onChange={(e) => setForme(e.target.value)}
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Sélectionner...</option>
                  {formes.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  ›
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-500">
                Dosage
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Ex: 500mg"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 3 — Prix + Stock */}
          <div className="mt-6 ">
            <div>
              <label className="mb-1 block text-sm text-gray-500">
                Prix unitaire
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={formatPrix(prix)}
                  onChange={(e) => setPrix(onlyPrixChars(e.target.value))}
                  placeholder="Ex: 1 500,50"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 pr-16 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-medium text-gray-400">
                  FCFA
                </span>
              </div>
            </div>
            <div />
          </div>

          {/* Row 4 — Stock + Seuil */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-gray-500">
                Stock initial
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formatMilliers(stockInitial)}
                onChange={(e) => setStockInitial(onlyDigits(e.target.value))}
                placeholder={"Ex: 1 000"}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {/* <p className="mt-1.5 text-xs text-emerald-600">Ajouté le {today} à {timeNow}</p> */}
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-500">
                Seuil de réapprovisionnement
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formatMilliers(seuil)}
                onChange={(e) => setSeuil(onlyDigits(e.target.value))}
                placeholder="Ex: 100"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {/* <p className="mt-1.5 text-xs text-emerald-600">Mis à jour le {today} à {timeNow}</p> */}
            </div>
          </div>

          {/* Ordonnance toggle */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm text-gray-500">Médicament soumis à ordonnance ?</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${!ordonnance ? "text-gray-800" : "text-gray-400"}`}>Non</span>
              <button
                type="button"
                role="switch"
                aria-checked={ordonnance}
                onClick={() => setOrdonnance((v) => !v)}
                className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                  ordonnance ? "bg-toni-green-dark" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                    ordonnance ? "translate-x-6" : "translate-x-1"
                  } mt-1`}
                />
              </button>
              <span className={`text-sm font-medium ${ordonnance ? "text-gray-800" : "text-gray-400"}`}>Oui</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-10 w-full rounded-full bg-emerald-600 py-4 text-lg font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmitting ? "Soumission en cours..." : "Ajouter au stock"}
          </button>
        </form>
      </main>

      <ConfirmationModal
        show={showModal}
        message={modalMessage}
        iconPath="/images/checkmark.svg"
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
