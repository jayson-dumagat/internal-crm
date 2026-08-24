import type { NextFunction, Request, Response } from "express";

import type { AccessPermission } from "../modules/access/access-control";
import { AppDataSource } from "../database/data-source";
import { toAccessPolicySnapshot } from "../modules/access/access-control";
import { getDatabaseEffectivePermissions } from "../modules/access/access-permission.service";
import { hasRbacPermission } from "../modules/access/rbac";
import { UserAccessPolicy } from "../modules/access/user-access-policy.entity";

export function requirePermission(permission: AccessPermission) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const sessionUser = req.session.user;
      const policy = sessionUser
        ? await AppDataSource.getRepository(UserAccessPolicy).findOne({
            where: {
              entraTenantId: sessionUser.tenantId,
              entraObjectId: sessionUser.entraObjectId,
            },
          })
        : null;
      if (policy) {
        req.accessPolicy = toAccessPolicySnapshot(policy);
      }

      const effectivePermissions = await getDatabaseEffectivePermissions(
        sessionUser?.roles ?? [],
        req.accessPolicy,
      );
      if (sessionUser) sessionUser.permissions = effectivePermissions;
      if (!hasRbacPermission(effectivePermissions, permission)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
          code: "forbidden",
          requiredPermission: permission,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
