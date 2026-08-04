import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
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
        name: currentUser.name,
        email: currentUser.email,
        avatarUrl: null,
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

function toUserDto(user: User) {
  return {
    id: user.entraObjectId,
    name: user.displayName,
    email: user.email ?? "",
    avatarUrl: user.avatarUrl,
    isCurrentUser: false,
  };
}
