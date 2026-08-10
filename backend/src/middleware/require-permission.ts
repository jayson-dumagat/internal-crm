import type { NextFunction, Request, Response } from "express";

import type { AccessPermission } from "../modules/access/access-control";
import { hasPermission } from "../modules/access/access-control";

export function requirePermission(permission: AccessPermission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const roles = req.session.user?.roles ?? [];

    if (!hasPermission(roles, permission)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
        code: "forbidden",
        requiredPermission: permission,
      });
      return;
    }

    next();
  };
}

