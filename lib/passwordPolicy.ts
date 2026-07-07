export interface PasswordRuleResult {
  id: "length" | "uppercase" | "lowercase" | "digit" | "special";
  label: string;
  valid: boolean;
}

export function getPasswordRuleResults(password: string): PasswordRuleResult[] {
  return [
    { id: "length", label: "Au moins 8 caractères", valid: password.length >= 8 },
    { id: "uppercase", label: "Au moins une majuscule", valid: /\p{Lu}/u.test(password) },
    { id: "lowercase", label: "Au moins une minuscule", valid: /\p{Ll}/u.test(password) },
    { id: "digit", label: "Au moins un chiffre", valid: /\d/.test(password) },
    // Strictement ponctuation/symbole Unicode: espace et lettres accentuées ne comptent pas.
    { id: "special", label: "Au moins un symbole", valid: /[\p{P}\p{S}]/u.test(password) },
  ];
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordRuleResults(password).every((rule) => rule.valid);
}

export function getPasswordStrength(password: string): {
  score: number;
  percent: number;
  label: "Faible" | "Moyen" | "Fort";
  colorClass: string;
} {
  const score = getPasswordRuleResults(password).filter((rule) => rule.valid).length;
  const percent = (score / 5) * 100;

  if (score <= 2) {
    return { score, percent, label: "Faible", colorClass: "bg-red-500" };
  }

  if (score <= 4) {
    return { score, percent, label: "Moyen", colorClass: "bg-amber-500" };
  }

  return { score, percent, label: "Fort", colorClass: "bg-emerald-600" };
}
