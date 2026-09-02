"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedicalFile = void 0;
const multer_1 = __importDefault(require("multer"));
const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(new Error("Invalid file type. Only PDF, JPG, and PNG files are allowed."));
        return;
    }
    cb(null, true);
};
exports.uploadMedicalFile = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
}).single("medicalFile");
