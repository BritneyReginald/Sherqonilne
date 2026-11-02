"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSizeType = exports.SIZE_TYPES = void 0;
// Single source of truth for sizing. Edit here to change what sizes exist
// (e.g. add "XL" to letter, or odd waist sizes to waist).
exports.SIZE_TYPES = {
    none: [],
    letter: ["S", "M", "L"],
    waist: ["32", "34", "36", "38", "40", "42", "44"],
    shoe: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
};
const isSizeType = (v) => typeof v === "string" && Object.prototype.hasOwnProperty.call(exports.SIZE_TYPES, v);
exports.isSizeType = isSizeType;
