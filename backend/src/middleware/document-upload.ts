import multer from "multer";
import type { NextFunction, Request, Response } from "express";

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const allowed = new Set([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]);
    if (!allowed.has(file.mimetype)) {
      callback(new Error("Please upload a PDF, image, document, or spreadsheet."));
      return;
    }
    callback(null, true);
  },
});

export function parseDocumentUpload(req: Request, res: Response, next: NextFunction): void {
  documentUpload.single("file")(req, res, (error) => {
    if (error) {
      res.status(400).json({
        success: false,
        message: error instanceof multer.MulterError
          ? "The document must be 25 MB or smaller."
          : error.message,
      });
      return;
    }
    next();
  });
}
