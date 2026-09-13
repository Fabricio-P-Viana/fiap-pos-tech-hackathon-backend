import multer from "multer";
import { ValidationError } from "../../domain/errors/ValidationError.ts";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(
        new ValidationError(
          `File type not allowed. Accepted types: ${ALLOWED_MIME_TYPES.join(
            ", "
          )}`
        )
      );
      return;
    }
    callback(null, true);
  },
}).single("file");
