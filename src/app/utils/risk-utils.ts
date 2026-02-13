// src/app/utils/risk-utils.ts

/* ---------------- TYPES ---------------- */
export type RiskRating =
  | "Critical"
  | "High Risk"
  | "Substantial Risk"
  | "Possible Risk"
  | "Low Risk";

/* ---------------- CALCULATIONS ---------------- */
export function calculateRiskScore(
  severity: number | null,
  probability: number | null
): number {
  if (!severity || !probability) return 0;
  return severity * probability;
}

export function calculateRiskRating(score: number): RiskRating {
  if (score === 25) return "Critical";
  if (score >= 15) return "High Risk";
  if (score >= 12) return "Substantial Risk";
  if (score >= 4) return "Possible Risk";
  return "Low Risk";
}

export function requiresAfterControls(rating: RiskRating): boolean {
  return rating === "Critical" || rating === "High Risk";
}

/* ---------------- UI HELPERS ---------------- */
export function getRiskRatingColor(rating: RiskRating): string {
  switch (rating) {
    case "Critical":
      return "bg-red-600 text-white";
    case "High Risk":
      return "bg-orange-500 text-white";
    case "Substantial Risk":
      return "bg-yellow-400 text-black";
    case "Possible Risk":
      return "bg-blue-400 text-white";
    case "Low Risk":
      return "bg-green-500 text-white";
  }
}
