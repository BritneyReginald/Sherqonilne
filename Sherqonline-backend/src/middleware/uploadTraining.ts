import multer from "multer";

const storage = multer.memoryStorage();

// Matches the original form's accept=".pdf,.jpg,.png" exactly.
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export const uploadTrainingCertificate = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, or PNG files are allowed"));
    }
  },
}).single("certificateFile");