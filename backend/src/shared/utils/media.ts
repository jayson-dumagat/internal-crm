import path from "node:path";

/** Returns a safe object-storage extension for a MIME type. */
export function mimeExtension(mimeType: string): string {
  const knownExtensions: Record<string, string> = {
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
  };
  if (knownExtensions[mimeType.toLowerCase()]) {
    return knownExtensions[mimeType.toLowerCase()];
  }

  const extension = mimeType
    .split("/")[1]
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return extension ? `.${extension}` : ".bin";
}

/** Uses the upload MIME type and falls back to its filename extension. */
export function resolveImageContentType(file: Express.Multer.File): string {
  if (file.mimetype.startsWith("image/")) return file.mimetype;

  switch (path.extname(file.originalname).toLowerCase()) {
    case ".gif": return "image/gif";
    case ".jpeg":
    case ".jpg": return "image/jpeg";
    case ".png": return "image/png";
    case ".svg": return "image/svg+xml";
    case ".webp": return "image/webp";
    default: return "application/octet-stream";
  }
}

export function inferImageContentType(objectKey: string): string {
  switch (path.extname(objectKey).toLowerCase()) {
    case ".gif": return "image/gif";
    case ".jpeg":
    case ".jpg": return "image/jpeg";
    case ".png": return "image/png";
    case ".svg": return "image/svg+xml";
    case ".webp": return "image/webp";
    default: return "application/octet-stream";
  }
}
