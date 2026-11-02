// Keep in sync with backend/ppeSizes.ts
export type SizeType = "none" | "letter" | "waist" | "shoe";

export const SIZE_TYPES: Record<SizeType, string[]> = {
  none: [],
  letter: ["S", "M", "L"],
  waist: ["32", "34", "36", "38", "40", "42", "44"],
  shoe: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
};

export const SIZE_TYPE_LABELS: Record<SizeType, string> = {
  none: "No sizes (one-size / universal)",
  letter: "S – L (aprons, rainsuits, kidney belts…)",
  waist: "32 – 44 (overalls)",
  shoe: "3 – 12 (footwear)",
};

// Shape returned by GET /ppe/catalogue/types (the PPE dropdown list)
export interface PPEType {
  name: string;
  category: string;
  sizeType: SizeType;
}