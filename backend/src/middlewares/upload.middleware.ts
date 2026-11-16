import multer from "multer";
import { env } from "../config/env.js";

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.UPLOAD_MAX_BYTES,
    files: 1,
    fields: 0,
    parts: 1,
  },
});
