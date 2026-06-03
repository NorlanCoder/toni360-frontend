"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Download, Check, X, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { registerPartner } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { saveAuthSession } from "@/lib/api/session";
import { getPasswordRuleResults, getPasswordStrength, isPasswordStrong } from "@/lib/passwordPolicy";
import { toast } from "sonner";

export default function DevenirPartenairePage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState("");
  const [licencePreviewUrl, setLicencePreviewUrl] = useState<string | null>(null);
  const [licencePreviewOpen, setLicencePreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [formData, setFormData] = useState({
    nomPharmacie: "",
    titulairePrenom: "",
    titulaireNom: "",
    adresseComplete: "",
    telephone: undefined as string | undefined,
    email: "",
    heureOuvrables: "",
    villeExercice: "",
    confirmPassword: "",
    licence: null as File | null,
  });

  const passwordRules = getPasswordRuleResults(formData.heureOuvrables);
  const passwordStrength = getPasswordStrength(formData.heureOuvrables);
  const passwordValid = isPasswordStrong(formData.heureOuvrables);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    if (
      !formData.nomPharmacie.trim() ||
      !formData.titulairePrenom.trim() ||
      !formData.titulaireNom.trim() ||
      !formData.adresseComplete.trim() ||
      !formData.telephone?.trim() ||
      !formData.email.trim() ||
      !formData.heureOuvrables.trim() ||
      !formData.confirmPassword.trim()
    ) {
      toast.warning("Veuillez remplir les champs obligatoires.");
      return;
    }

    if (formData.heureOuvrables !== formData.confirmPassword) {
      toast.warning("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!passwordValid) {
      setPasswordTouched(true);
      toast.warning("Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule, un chiffre et un caractere special.");
      return;
    }

    const telephone = formData.telephone ?? "";

    if (telephone.length > 20) {
      toast.warning("Le numero de telephone est trop long.");
      return;
    }

    if (!formData.licence) {
      toast.warning("Veuillez soumettre votre licence pharmaceutique.");
      return;
    }

    if (formData.licence.size > 5 * 1024 * 1024) {
      toast.warning("La licence ne doit pas depasser 5 Mo.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await registerPartner({
        pharmacie_nom: formData.nomPharmacie.trim(),
        adresse: formData.adresseComplete.trim(),
        ville: formData.villeExercice.trim() || undefined,
        telephone,
        email: formData.email.trim(),
        titulaire_nom: formData.titulaireNom.trim(),
        titulaire_prenom: formData.titulairePrenom.trim(),
        password: formData.heureOuvrables,
        password_confirmation: formData.confirmPassword,
        licence_pharmaceutique: formData.licence ?? undefined,
      });

      saveAuthSession({
        userType: "user",
        token: response.data.token,
        tokenType: response.data.token_type,
        profile: response.data.user ?? null,
        permissions: response.data.permissions ?? [],
      });

      toast.success(response.message ?? "Inscription réussie.");
      router.push("/partenaire/dashboard");
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Une erreur est survenue pendant l'inscription.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (licencePreviewUrl) URL.revokeObjectURL(licencePreviewUrl);
      const url = URL.createObjectURL(file);
      setFileName(file.name);
      setLicencePreviewUrl(url);
      setFormData({ ...formData, licence: file });
    }
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDeleteLicence = () => {
    if (licencePreviewUrl) URL.revokeObjectURL(licencePreviewUrl);
    setLicencePreviewUrl(null);
    setFileName("");
    setFormData({ ...formData, licence: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[900px] flex flex-col items-center">
        {/* Logo */}
        <div className="mb-4">
          <Image
            src="/images/logo.png"
            alt="Toni360"
            width={150}
            height={55}
            className="mx-auto"
            priority
          />
        </div>

        {/* Titre */}
        <h1
          className="text-2xl md:text-4xl font-bold text-black text-center mb-10"
        >
          Inscription
        </h1>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="w-full bg-white">
          {/* Grille deux colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">


            {/* Prénom du titulaire */}
            <div>
              <input
                type="text"
                placeholder="Prénom du titulaire"
                value={formData.titulairePrenom}
                onChange={(e) =>
                  setFormData({ ...formData, titulairePrenom: e.target.value })
                }
                className="w-full bg-white px-4 py-3.5 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Nom du titulaire */}
            <div>
              <input
                type="text"
                placeholder="Nom du titulaire"
                value={formData.titulaireNom}
                onChange={(e) =>
                  setFormData({ ...formData, titulaireNom: e.target.value })
                }
                className="w-full bg-white px-4 py-3.5 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            

            {/* Nom officiel de la pharmacie */}
            <div className="col-span-1 md:col-span-2">
              <input
                type="text"
                placeholder="Nom officiel de la pharmacie"
                value={formData.nomPharmacie}
                onChange={(e) =>
                  setFormData({ ...formData, nomPharmacie: e.target.value })
                }
                className="w-full bg-white px-4 py-3.5 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>


            {/* Adresse complète */}
            <div>
              <input
                type="text"
                placeholder="Adresse complète"
                value={formData.adresseComplete}
                onChange={(e) =>
                  setFormData({ ...formData, adresseComplete: e.target.value })
                }
                className="w-full bg-white px-4 py-3.5 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Téléphone avec indicatif */}
            <div className="flex items-center border bg-white text-black border-gray-300 rounded-lg overflow-hidden px-3 py-3 transition-colors focus-within:border-[#137551]">
              <PhoneInput
                international
                defaultCountry="BJ"
                placeholder="numéro de téléphone"
                value={formData.telephone}
                onChange={(value) => setFormData({ ...formData, telephone: value })}
                className="bg-white"
              />
            </div>

            {/* Adresse mail */}
            <div>
              <input
                type="email"
                placeholder="Adresse mail"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-white px-4 py-3.5 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
            </div>

            {/* Mot de pass */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={formData.heureOuvrables}
                  onChange={(e) =>
                    setFormData({ ...formData, heureOuvrables: e.target.value })
                  }
                  onBlur={() => setPasswordTouched(true)}
                  className="w-full bg-white px-4 py-3.5 pr-12 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#137551] text-gray-700 text-sm placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {(passwordTouched || formData.heureOuvrables.length > 0) && (
                <div className="space-y-2">
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
            </div>

            {/* Ville d'exercice */}
            <div className="relative">
              <select
                value={formData.villeExercice}
                onChange={(e) =>
                  setFormData({ ...formData, villeExercice: e.target.value })
                }
                className="w-full appearance-none bg-white px-4 pr-10 py-3.5 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#137551] text-gray-700 text-sm"
              >
                <option value="">Ville d&apos;exercice</option>
                <optgroup label="Alibori">
                  <option value="Banikoara">Banikoara</option>
                  <option value="Gogounou">Gogounou</option>
                  <option value="Kandi">Kandi</option>
                  <option value="Karimama">Karimama</option>
                  <option value="Malanville">Malanville</option>
                  <option value="Ségbana">Ségbana</option>
                </optgroup>
                <optgroup label="Atacora">
                  <option value="Boukoumbé">Boukoumbé</option>
                  <option value="Cobly">Cobly</option>
                  <option value="Kérou">Kérou</option>
                  <option value="Kouandé">Kouandé</option>
                  <option value="Matéri">Matéri</option>
                  <option value="Natitingou">Natitingou</option>
                  <option value="Péhunco">Péhunco</option>
                  <option value="Tanguiéta">Tanguiéta</option>
                  <option value="Toucountouna">Toucountouna</option>
                </optgroup>
                <optgroup label="Atlantique">
                  <option value="Abomey-Calavi">Abomey-Calavi</option>
                  <option value="Allada">Allada</option>
                  <option value="Kpomassè">Kpomassè</option>
                  <option value="Ouidah">Ouidah</option>
                  <option value="Sô-Ava">Sô-Ava</option>
                  <option value="Toffo">Toffo</option>
                  <option value="Tori-Bossito">Tori-Bossito</option>
                  <option value="Zè">Zè</option>
                </optgroup>
                <optgroup label="Borgou">
                  <option value="Bembèrèkè">Bembèrèkè</option>
                  <option value="Kalalé">Kalalé</option>
                  <option value="N'Dali">N&apos;Dali</option>
                  <option value="Nikki">Nikki</option>
                  <option value="Parakou">Parakou</option>
                  <option value="Pèrèrè">Pèrèrè</option>
                  <option value="Sinendé">Sinendé</option>
                  <option value="Tchaourou">Tchaourou</option>
                </optgroup>
                <optgroup label="Collines">
                  <option value="Bantè">Bantè</option>
                  <option value="Dassa-Zoumè">Dassa-Zoumè</option>
                  <option value="Glazoué">Glazoué</option>
                  <option value="Ouèssè">Ouèssè</option>
                  <option value="Savalou">Savalou</option>
                  <option value="Savè">Savè</option>
                </optgroup>
                <optgroup label="Couffo">
                  <option value="Aplahoué">Aplahoué</option>
                  <option value="Djakotomey">Djakotomey</option>
                  <option value="Dogbo">Dogbo</option>
                  <option value="Klouékanmè">Klouékanmè</option>
                  <option value="Lalo">Lalo</option>
                  <option value="Toviklin">Toviklin</option>
                </optgroup>
                <optgroup label="Donga">
                  <option value="Bassila">Bassila</option>
                  <option value="Copargo">Copargo</option>
                  <option value="Djougou">Djougou</option>
                  <option value="Ouaké">Ouaké</option>
                </optgroup>
                <optgroup label="Littoral">
                  <option value="Cotonou">Cotonou</option>
                </optgroup>
                <optgroup label="Mono">
                  <option value="Athiémé">Athiémé</option>
                  <option value="Bopa">Bopa</option>
                  <option value="Comè">Comè</option>
                  <option value="Grand-Popo">Grand-Popo</option>
                  <option value="Houéyogbé">Houéyogbé</option>
                  <option value="Lokossa">Lokossa</option>
                </optgroup>
                <optgroup label="Ouémé">
                  <option value="Adjarra">Adjarra</option>
                  <option value="Adjohoun">Adjohoun</option>
                  <option value="Akpro-Missérété">Akpro-Missérété</option>
                  <option value="Avrankou">Avrankou</option>
                  <option value="Bonou">Bonou</option>
                  <option value="Dangbo">Dangbo</option>
                  <option value="Porto-Novo">Porto-Novo</option>
                  <option value="Sèmè-Kpodji">Sèmè-Kpodji</option>
                </optgroup>
                <optgroup label="Plateau">
                  <option value="Adja-Ouèrè">Adja-Ouèrè</option>
                  <option value="Ifangni">Ifangni</option>
                  <option value="Kétou">Kétou</option>
                  <option value="Pobè">Pobè</option>
                  <option value="Sakété">Sakété</option>
                </optgroup>
                <optgroup label="Zou">
                  <option value="Abomey">Abomey</option>
                  <option value="Agbangnizoun">Agbangnizoun</option>
                  <option value="Bohicon">Bohicon</option>
                  <option value="Covè">Covè</option>
                  <option value="Djidja">Djidja</option>
                  <option value="Ouinhi">Ouinhi</option>
                  <option value="Za-Kpota">Za-Kpota</option>
                  <option value="Zagnanado">Zagnanado</option>
                  <option value="Zogbodomey">Zogbodomey</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full bg-white px-4 py-3.5 pr-12 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#137551] text-gray-700 text-sm placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Soumission licence pharmaceutique */}
          <div className="mt-8">
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base md:text-lg font-semibold" style={{ color: "#137551" }}>
                Soumission de votre licence pharmaceutique
                <span className="text-red-500 ml-1">*</span>
              </span>
              {!formData.licence && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full p-2 flex items-center justify-center border-2 transition hover:opacity-80"
                  style={{ borderColor: "#137551", color: "#137551" }}
                  title="Télécharger votre licence"
                >
                  <Download size={28} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {formData.licence ? (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <span className="w-full truncate text-sm text-gray-700 sm:flex-1 sm:w-auto" title={fileName}>{fileName}</span>
                <button
                  type="button"
                  onClick={() => setLicencePreviewOpen(true)}
                  className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-80"
                  style={{ backgroundColor: "#137551" }}
                  title="Visualiser"
                >
                  <Eye size={14} />
                  Voir
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                  title="Modifier"
                >
                  <Pencil size={14} />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={handleDeleteLicence}
                  className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">PDF, JPG ou PNG — max 5 Mo</p>
            )}
          </div>

          {/* Modal prévisualisation licence */}
          {licencePreviewOpen && licencePreviewUrl && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setLicencePreviewOpen(false)}
            >
              <div
                className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setLicencePreviewOpen(false)}
                  className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
                <p className="mb-3 truncate text-sm font-medium text-gray-700">{fileName}</p>
                {formData.licence?.type === "application/pdf" ? (
                  <iframe
                    src={licencePreviewUrl}
                    className="h-[75vh] w-full rounded border"
                    title="Aperçu de la licence"
                  />
                ) : (
                  <img
                    src={licencePreviewUrl}
                    alt="Aperçu de la licence"
                    className="mx-auto max-h-[75vh] rounded object-contain"
                  />
                )}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            En vous inscrivant, vous acceptez nos{" "}
            <Link
              href="/partenaire/cgu"
              className="font-semibold underline hover:underline"
              style={{ color: "#137551" }}
            >
              Conditions d&apos;utilisation
            </Link>{" "}
            et notre{" "}
            <Link
              href="/privacy"
              className="font-semibold underline hover:underline"
              style={{ color: "#137551" }}
            >
              Politique de confidentialité
            </Link>
            .
          </p>

          {/* Bouton S'inscrire */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={submitting || !passwordValid}
              className="w-full py-4 text-white font-bold text-base rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: "#137551" }}
            >
              {submitting ? "Inscription..." : "S\'inscrire"}
            </button>
          </div>
        </form>

        {/* Lien connexion */}
        <p className="text-center mt-8 text-lg text-gray-700">
          Déjà un compte ?{" "}
          <Link
            href="/partenaire/connexion"
            className="font-bold hover:underline"
            style={{ color: "#137551", fontSize: "1.18rem" }}
          >
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}