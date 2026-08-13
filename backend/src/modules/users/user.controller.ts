import type { NextFunction, Request, Response } from "express";

import { getObject, statObject } from "../../config/storage";
import { AppDataSource } from "../../database/data-source";
import { normalizeUserName } from "../../shared/utils/names";
import { User } from "./user.entity";
import { UserStatus } from "./user.types";

const userRepository = () => AppDataSource.getRepository(User);

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const currentUser = req.session.user;
    if (!currentUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    await userRepository().upsert({
      entraTenantId: currentUser.tenantId,
      entraObjectId: currentUser.entraObjectId,
      email: currentUser.email || currentUser.username,
      displayName: currentUser.name,
      entraRoles: currentUser.roles,
      status: UserStatus.ACTIVE,
      isAccessEnabled: true,
      lastLoginAt: new Date(),
      lastSyncedAt: new Date(),
    }, ["entraTenantId", "entraObjectId"]);

    const users = await userRepository().find({
      where: {
        entraTenantId: currentUser.tenantId,
        status: UserStatus.ACTIVE,
        isAccessEnabled: true,
      },
      order: { displayName: "ASC" },
    });

    const currentUserExists = users.some(
      (user) => user.entraObjectId === currentUser.entraObjectId,
    );

    const records = users.map(toUserDto);
    if (!currentUserExists) {
      records.unshift({
        id: currentUser.entraObjectId,
        name: normalizeUserName(currentUser.name),
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl ? "/api/v1/users/me/avatar" : null,
        isCurrentUser: true,
      });
    } else {
      for (const record of records) {
        record.isCurrentUser = record.id === currentUser?.entraObjectId;
      }
    }

    res.status(200).json({ data: records });
  } catch (error) {
    next(error);
  }
}

export async function getUserAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const currentUser = req.session.user;
    if (!currentUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    const requestedUserId = String(req.params.id ?? "me");
    const user = await userRepository().findOne({
      where: {
        entraTenantId: currentUser.tenantId,
        entraObjectId: requestedUserId === "me" ? currentUser.entraObjectId : requestedUserId,
        status: UserStatus.ACTIVE,
        isAccessEnabled: true,
      },
    });

    if (!user?.avatarUrl) {
      res.status(404).json({ success: false, message: "User avatar not found." });
      return;
    }

    const [objectStream, objectInfo] = await Promise.all([
      getObject(user.avatarUrl),
      statObject(user.avatarUrl),
    ]);
    res.setHeader(
      "Content-Type",
      user.avatarContentType ?? objectInfo.metaData["content-type"] ?? "image/jpeg",
    );
    res.setHeader("Cache-Control", "private, max-age=3600");
    objectStream.on("error", next);
    objectStream.pipe(res);
  } catch (error) {
    next(error);
  }
}

function toUserDto(user: User) {
  return {
    id: user.entraObjectId,
    name: normalizeUserName(user.displayName),
    email: user.email ?? "",
    avatarUrl: user.avatarUrl
      ? `/api/v1/users/${user.entraObjectId}/avatar`
      : null,
    isCurrentUser: false,
  };
}
