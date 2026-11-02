// Single source of truth for sizing. Edit here to change what sizes exist
// (e.g. add "XL" to letter, or odd waist sizes to waist).
export const SIZE_TYPES = {
  none: [] as string[],
  letter: ["S", "M", "L"],
  waist: ["32", "34", "36", "38", "40", "42", "44"],
  shoe: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
};

export type SizeType = keyof typeof SIZE_TYPES;

export const isSizeType = (v: any): v is SizeType =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(SIZE_TYPES, v);