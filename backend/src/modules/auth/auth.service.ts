import { putObject } from "../../config/storage";
import { AppDataSource } from "../../database/data-source";
import { User } from "../users/user.entity";
import { UserStatus } from "../users/user.types";
import type { EntraUser } from "./auth.types";

export async function syncAuthenticatedUser(
  authenticatedUser: EntraUser,
  profilePhoto: { data: Buffer; contentType: string } | null,
): Promise<void> {
  const repository = AppDataSource.getRepository(User);
  let user = await repository.findOne({
    where: {
      entraTenantId: authenticatedUser.tenantId,
      entraObjectId: authenticatedUser.entraObjectId,
    },
  });

  const values = {
    entraTenantId: authenticatedUser.tenantId,
    entraObjectId: authenticatedUser.entraObjectId,
    email: authenticatedUser.email || authenticatedUser.username,
    displayName: authenticatedUser.name,
    entraRoles: authenticatedUser.roles,
    lastLoginAt: new Date(),
    lastSyncedAt: new Date(),
  };

  if (user) {
    if (user.status !== UserStatus.ACTIVE || !user.isAccessEnabled) {
      throw new Error("Your CDEX account is not enabled for access.");
    }
    Object.assign(user, values);
  } else {
    user = repository.create({
      ...values,
      status: UserStatus.ACTIVE,
      isAccessEnabled: true,
    });
  }

  if (profilePhoto) {
    const objectKey = `users/${authenticatedUser.entraObjectId}/avatar`;
    await putObject(objectKey, profilePhoto.data, profilePhoto.contentType);
    user.avatarUrl = objectKey;
    user.avatarContentType = profilePhoto.contentType;
  }

  await repository.save(user);
}
