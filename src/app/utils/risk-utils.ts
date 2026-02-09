

// src/app/utils/risk-utils.ts



export const calculateRiskScore = (
  severity: number | null,
  probability: number | null
) => {
  if (!severity || !probability) return 0;
  return severity * probability;
};

export type RiskRating = "Low" | "Medium" | "High" | "Critical";

export function calculateRiskRating(score: number): RiskRating {
  if (score >= 15) return "Critical";
  if (score >= 10) return "High";
  if (score >= 5) return "Medium";
  return "Low";
}

export const getRiskRating = (score: number) => {
  if (score >= 15) return "Critical";
  if (score >= 10) return "High Risk";
  if (score >= 5) return "Medium Risk";
  return "Low Risk";
};


export function requiresAfterControls(rating: string) {
  return rating === "Critical" || rating === "High Risk";
}
