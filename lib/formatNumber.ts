export function formatNumberFr(value: number): string {
  // Intl utilise une espace fine insécable (U+202F) pour le séparateur des
  // milliers, quasi invisible en gras/grande taille — on la remplace par une
  // espace insécable normale (U+00A0), nettement plus visible.
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 })
    .format(value)
    .replace(/ /g, " ");
}
