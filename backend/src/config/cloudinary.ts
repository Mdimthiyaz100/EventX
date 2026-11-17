import { createHash, randomUUID } from "node:crypto";
import { env } from "./env.js";
import { AppError } from "../utils/http.js";

type MovieImageKind = "poster" | "banner";

function cloudinaryConfig() {
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = env;
  if (!cloud || !key || !secret) {
    throw new AppError(503, "IMAGE_STORAGE_UNAVAILABLE", "Cloudinary image storage is not configured.");
  }
  return { cloud, key, secret };
}

function sign(parameters: Record<string, string>, secret: string): string {
  const canonical = Object.entries(parameters)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${canonical}${secret}`).digest("hex");
}

export async function uploadMovieImage(file: Express.Multer.File, kind: MovieImageKind) {
  const detected = await import("file-type").then(({ fileTypeFromBuffer }) => fileTypeFromBuffer(file.buffer));
  if (!detected || !["image/jpeg", "image/png", "image/webp"].includes(detected.mime)) {
    throw new AppError(415, "UNSUPPORTED_IMAGE", "Upload a valid JPEG, PNG, or WebP image.");
  }

  const { cloud, key, secret } = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = kind === "poster" ? "eventx/movies/posters" : "eventx/movies/banners";
  const publicId = randomUUID();
  const parameters = { folder, public_id: publicId, timestamp };
  const body = new FormData();
  body.set("file", new Blob([new Uint8Array(file.buffer)], { type: detected.mime }), `${publicId}.${detected.ext}`);
  body.set("api_key", key);
  body.set("timestamp", timestamp);
  body.set("folder", folder);
  body.set("public_id", publicId);
  body.set("signature", sign(parameters, secret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, {
    method: "POST",
    body,
  });
  const payload = await response.json() as { secure_url?: string; public_id?: string; error?: { message?: string } };
  if (!response.ok || !payload.secure_url || !payload.public_id) {
    throw new AppError(502, "IMAGE_UPLOAD_FAILED", "Cloudinary could not store the uploaded image.");
  }
  return { url: payload.secure_url, publicId: payload.public_id };
}

export function cloudinaryPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") return null;
    const match = parsed.pathname.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]).replace(/\.[a-zA-Z0-9]+$/, "");
  } catch {
    return null;
  }
}

export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  const { cloud, key, secret } = cloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const parameters = { public_id: publicId, timestamp };
  const body = new FormData();
  body.set("api_key", key);
  body.set("public_id", publicId);
  body.set("timestamp", timestamp);
  body.set("signature", sign(parameters, secret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/destroy`, {
    method: "POST",
    body,
  });
  if (!response.ok) throw new Error("Cloudinary asset deletion failed.");
}
