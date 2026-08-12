import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AppDataSource } from "../../database/data-source.js";
import { Activity } from "../activities/activity.entity.js";
import { Company } from "../companies/company.entity.js";
import { Contact } from "../contacts/contact.entity.js";
import { Lead } from "../leads/lead.entity.js";
import { Note } from "../notes/note.entity.js";
import { Task } from "../tasks/task.entity.js";
import { User } from "../users/user.entity.js";
import { UserStatus } from "../users/user.types.js";
import {
  accessFieldCatalog,
  accessScopeCatalog,
  accessResourceCatalog,
  toAccessPolicySnapshot,
  type DataScope,
  type FieldRule,
} from "./access-control.js";
import { applyPermissionPolicy, getDatabaseEffectivePermissions, getDatabasePermissionCatalog, getDatabasePermissionsForRoles } from "./access-permission.service.js";
import { UserAccessPolicy } from "./user-access-policy.entity.js";

const userRepository = () => AppDataSource.getRepository(User);
const policyRepository = () => AppDataSource.getRepository(UserAccessPolicy);
const resourceRepositories = {
  leads: () => AppDataSource.getRepository(Lead),
  companies: () => AppDataSource.getRepository(Company),
  contacts: () => AppDataSource.getRepository(Contact),
  tasks: () => AppDataSource.getRepository(Task),
  notes: () => AppDataSource.getRepository(Note),
  activities: () => AppDataSource.getRepository(Activity),
};
const fieldSet = new Set<string>(accessFieldCatalog.map((field) => field.key));
const scopeMap = new Map(accessScopeCatalog.map((scope) => [scope.key, new Set(scope.options)]));

const policySchema = z.object({
  allowedPermissions: z.array(z.string()).max(500).default([]),
  deniedPermissions: z.array(z.string()).max(500).default([]),
  fieldRules: z.record(z.string(), z.enum(["visible", "hidden"])).default({}),
  dataScopes: z.record(z.string(), z.enum(["all", "assigned", "own"])).default({}),
  resourceAssignments: z.record(z.string(), z.array(z.string().uuid()).max(5000)).default({}),
}).strict();

export async function getAccessCatalog(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const permissions = await getDatabasePermissionCatalog();
    res.status(200).json({
      permissions: permissions.map((permission) => ({ code: permission.code, label: permission.name })),
      fields: accessFieldCatalog,
      scopes: accessScopeCatalog,
      resources: accessResourceCatalog,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns only the minimal identity fields needed by an administrator to
 * create a record-level assignment. No sensitive record fields are exposed.
 */
export async function listAccessResources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    const [leads, companies, contacts, tasks, notes, activities] = await Promise.all([
      resourceRepositories.leads().find({ where: { owner: { entraTenantId: tenantId } }, order: { createdAt: "DESC" }, take: 5000 }),
      resourceRepositories.companies().find({ where: { tenantId }, order: { name: "ASC" }, take: 5000 }),
      resourceRepositories.contacts().find({ where: { tenantId }, order: { name: "ASC" }, take: 5000 }),
      resourceRepositories.tasks().find({ where: { tenantId }, order: { createdAt: "DESC" }, take: 5000 }),
      resourceRepositories.notes().find({ where: { tenantId }, order: { updatedAt: "DESC" }, take: 5000 }),
      resourceRepositories.activities().find({ where: { tenantId }, order: { createdAt: "DESC" }, take: 5000 }),
    ]);

    res.status(200).json({
      data: {
        leads: leads.map((record) => ({ id: record.id, name: `${record.firstName} ${record.lastName}`.trim(), secondary: record.companyName })),
        companies: companies.map((record) => ({ id: record.id, name: record.name, secondary: record.industry })),
        contacts: contacts.map((record) => ({ id: record.id, name: record.name, secondary: record.companyName })),
        tasks: tasks.map((record) => ({ id: record.id, name: record.title, secondary: record.status })),
        notes: notes.map((record) => ({ id: record.id, name: record.title, secondary: record.category })),
        activities: activities.map((record) => ({ id: record.id, name: record.action, secondary: record.target })),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listAccessPolicies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    const [users, policies] = await Promise.all([
      userRepository().find({
        where: { entraTenantId: tenantId, status: UserStatus.ACTIVE, isAccessEnabled: true },
        order: { displayName: "ASC" },
      }),
      policyRepository().find({ where: { entraTenantId: tenantId } }),
    ]);
    const policyByUser = new Map(policies.map((policy) => [policy.entraObjectId, policy]));

    res.status(200).json({
      data: await Promise.all(users.map((user) => toAccessUserDto(user, policyByUser.get(user.entraObjectId), req))),
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAccessPolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }

    const targetId = String(req.params.entraObjectId);
    const target = await userRepository().findOne({
      where: { entraTenantId: sessionUser.tenantId, entraObjectId: targetId, status: UserStatus.ACTIVE, isAccessEnabled: true },
    });
    if (!target) {
      res.status(404).json({ success: false, message: "Active CRM user not found." });
      return;
    }

    const parsed = policySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Please check the access policy fields.", errors: parsed.error.issues });
      return;
    }

    const permissionSet = new Set((await getDatabasePermissionCatalog()).map((permission) => permission.code));
    const invalidPermission = [...parsed.data.allowedPermissions, ...parsed.data.deniedPermissions]
      .find((permission) => !permissionSet.has(permission));
    if (invalidPermission) {
      res.status(400).json({ success: false, message: `Unknown permission: ${invalidPermission}.` });
      return;
    }

    const invalidField = Object.keys(parsed.data.fieldRules).find((field) => !fieldSet.has(field));
    if (invalidField) {
      res.status(400).json({ success: false, message: `Unknown data field: ${invalidField}.` });
      return;
    }

    const invalidScope = Object.entries(parsed.data.dataScopes).find(([resource, scope]) => !scopeMap.get(resource as typeof accessScopeCatalog[number]["key"])?.has(scope));
    if (invalidScope) {
      res.status(400).json({ success: false, message: `Invalid data scope for ${invalidScope[0]}.` });
      return;
    }

    const resourceKeys = new Set(accessResourceCatalog.map((resource) => resource.key));
    const invalidResource = Object.keys(parsed.data.resourceAssignments).find((resource) => !resourceKeys.has(resource as typeof accessResourceCatalog[number]["key"]));
    if (invalidResource) {
      res.status(400).json({ success: false, message: `Unknown resource: ${invalidResource}.` });
      return;
    }

    const policy = await policyRepository().findOne({
      where: { entraTenantId: sessionUser.tenantId, entraObjectId: targetId },
    }) ?? policyRepository().create({
      entraTenantId: sessionUser.tenantId,
      entraObjectId: targetId,
    });
    policy.allowedPermissions = [...new Set(parsed.data.allowedPermissions)];
    policy.deniedPermissions = [...new Set(parsed.data.deniedPermissions)];
    policy.fieldRules = parsed.data.fieldRules as Record<string, FieldRule>;
    policy.dataScopes = parsed.data.dataScopes as Record<string, DataScope>;
    policy.resourceAssignments = parsed.data.resourceAssignments as Record<string, string[]>;
    await policyRepository().save(policy);
    if (targetId === sessionUser.entraObjectId) {
      sessionUser.permissions = await getDatabaseEffectivePermissions(target.entraRoles ?? [], policy);
      sessionUser.accessPolicy = toAccessPolicySnapshot(policy);
      await new Promise<void>((resolve, reject) => req.session.save((error) => error ? reject(error) : resolve()));
    }

    res.status(200).json({ data: await toAccessUserDto(target, policy, req) });
  } catch (error) {
    next(error);
  }
}

async function toAccessUserDto(user: User, policy: UserAccessPolicy | undefined, req: Request) {
  const baselinePermissions = await getDatabasePermissionsForRoles(user.entraRoles ?? []);
  const effectivePermissions = applyPermissionPolicy(baselinePermissions, policy);
  return {
    id: user.entraObjectId,
    name: user.displayName.replace(/\s*\(CGSI\)\s*$/i, "").trim(),
    email: user.email ?? "",
    roles: user.entraRoles ?? [],
    avatarUrl: user.avatarUrl ? `/api/v1/users/${user.entraObjectId}/avatar` : null,
    isCurrentUser: user.entraObjectId === req.session.user?.entraObjectId,
    policy: {
      allowedPermissions: policy?.allowedPermissions ?? [],
      deniedPermissions: policy?.deniedPermissions ?? [],
      fieldRules: policy?.fieldRules ?? {},
      dataScopes: policy?.dataScopes ?? {},
      resourceAssignments: policy?.resourceAssignments ?? {},
      baselinePermissions,
      effectivePermissions,
    },
  };
}
