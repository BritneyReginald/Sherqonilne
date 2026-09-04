"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTrainingCertificate = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
// Matches the original form's accept=".pdf,.jpg,.png" exactly.
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
exports.uploadTrainingCertificate = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB
    },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only PDF, JPG, or PNG files are allowed"));
        }
    },
}).single("certificateFile");
