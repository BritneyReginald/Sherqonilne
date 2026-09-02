import multer from "multer";

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb,
) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(
      new Error(
        "Invalid file type. Only PDF, JPG, and PNG files are allowed.",
      ),
    );
    return;
  }

  cb(null, true);
};

export const uploadMedicalFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
}).single("medicalFile");