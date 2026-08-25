import type { NextFunction, Request, Response } from "express";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session.user) {
    res.status(401).json({
      success: false,
      message: "You don't have access to this resource, please try agian.",
    });
    return;
  }

  next();
}
