import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import path from "node:path";

const fallbackImageExtensions = new Set([
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".svg",
  ".webp",
]);

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const hasImageMimeType = file.mimetype.startsWith("image/");
    const hasImageExtension = fallbackImageExtensions.has(
      path.extname(file.originalname).toLowerCase(),
    );

    if (!hasImageMimeType && !hasImageExtension) {
      callback(new Error("Please upload a valid image file."));
      return;
    }

    callback(null, true);
  },
});

export function parseImageUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  imageUpload.single("file")(req, res, (error) => {
    if (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof multer.MulterError
            ? "The image must be 5 MB or smaller."
            : "Please upload a valid image file.",
      });
      return;
    }

    next();
  });
}
