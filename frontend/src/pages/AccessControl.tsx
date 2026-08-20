import { useEffect, useMemo, useState } from "react";

import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";
import Avatar from "../components/ui/avatar/Avatar";
import Badge from "../components/ui/badge/Badge";
import Sheet from "../components/ui/sheet/Sheet";
import {
  useAccessCatalogQuery,
  useAccessResourcesQuery,
  useAccessRolesQuery,
  useAccessUsersQuery,
  useUpdateAccessRole,
  useUpdateAccessUser,
} from "../hooks/access/useAccessControl";
import type { AccessRole, AccessUser } from "../validations/api";
import { useToast } from "../hooks/useToast";
import Checkbox from "../components/form/input/Checkbox";

type PermissionState = {
  allowedPermissions: string[];
  deniedPermissions: string[];
  fieldRules: Record<string, "visible" | "hidden">;
  dataScopes: Record<string, "all" | "assigned" | "own">;
  resourceAssignments: Record<string, string[]>;
  baselinePermissions: string[];
  effectivePermissions: string[];
};

const cardClassName =
  "rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900";
const actionButtonClassName =
  "inline-flex h-9 items-center rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]";
const primaryActionButtonClassName =
  "inline-flex h-9 items-center rounded-lg bg-brand-500 px-3 text-xs font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50";
const tableClassName =
  "w-full text-left [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-2.5";
const tableHeaderClassName =
  "border-b border-gray-100 bg-gray-50/80 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400";

function policyState(user: AccessUser | undefined): PermissionState {
  return {
    allowedPermissions: user?.policy.allowedPermissions ?? [],
    deniedPermissions: user?.policy.deniedPermissions ?? [],
    fieldRules: user?.policy.fieldRules ?? {},
    dataScopes: user?.policy.dataScopes ?? {},
    resourceAssignments: user?.policy.resourceAssignments ?? {},
    baselinePermissions: user?.policy.baselinePermissions ?? [],
    effectivePermissions: user?.policy.effectivePermissions ?? [],
  };
}

export default function AccessControl() {
  const toast = useToast();
  const catalogQuery = useAccessCatalogQuery();
  const rolesQuery = useAccessRolesQuery();
  const usersQuery = useAccessUsersQuery();
  const resourcesQuery = useAccessResourcesQuery();
  const updateRole = useUpdateAccessRole();
  const updateUser = useUpdateAccessUser();

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [roleDraft, setRoleDraft] = useState<string[]>([]);
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [draft, setDraft] = useState<PermissionState>(policyState(undefined));
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectedRole = useMemo(
    () => rolesQuery.data?.find((role) => role.id === selectedRoleId),
    [rolesQuery.data, selectedRoleId],
  );
  const selectedUser = useMemo(
    () => usersQuery.data?.find((user) => user.id === selectedUserId),
    [selectedUserId, usersQuery.data],
  );
  const userStats = useMemo(() => {
    const users = usersQuery.data ?? [];
    return {
      total: users.length,
      withAccess: users.filter((user) => user.policy.effectivePermissions.length > 0).length,
      withoutAccess: users.filter((user) => user.policy.effectivePermissions.length === 0).length,
      restricted: users.filter((user) => Object.keys(user.policy.resourceAssignments).length > 0).length,
    };
  }, [usersQuery.data]);
  const roleLabelByEntraValue = useMemo(
    () =>
      new Map(
        (rolesQuery.data ?? []).map((role) => [
          role.entraAppRoleValue,
          role.name,
        ]),
      ),
    [rolesQuery.data],
  );

  useEffect(() => {
    setRoleDraft(selectedRole?.permissionCodes ?? []);
  }, [selectedRole]);

  useEffect(() => {
    setDraft(policyState(selectedUser));
  }, [selectedUser]);

  const openRoleEditor = (role: AccessRole) => {
    setSelectedRoleId(role.id);
    setRoleSheetOpen(true);
  };

  const openUserEditor = (user: AccessUser) => {
    setSelectedUserId(user.id);
    setSheetOpen(true);
  };

  const updateDraft = (change: Partial<PermissionState>) =>
    setDraft((current) => ({ ...current, ...change }));

  const toggleRolePermission = (code: string, enabled: boolean) => {
    setRoleDraft((current) =>
      enabled
        ? Array.from(new Set([...current, code]))
        : current.filter((value) => value !== code),
    );
  };

  const togglePermission = (code: string, enabled: boolean) =>
    setDraft((current) => ({
      ...current,
      // Entra roles grant permissions; this page only adds/removes explicit
      // revocations. Do not build an allowlist when a permission is re-enabled,
      // otherwise all of the user's other role permissions disappear.
      allowedPermissions: current.allowedPermissions.filter(
        (value) => value !== code,
      ),
      deniedPermissions: enabled
        ? current.deniedPermissions.filter((value) => value !== code)
        : Array.from(new Set([...current.deniedPermissions, code])),
    }));

  const toggleResourceRecord = (
    resource: string,
    id: string,
    enabled: boolean,
  ) => {
    const current = draft.resourceAssignments[resource] ?? [];
    updateDraft({
      resourceAssignments: {
        ...draft.resourceAssignments,
        [resource]: enabled
          ? Array.from(new Set([...current, id]))
          : current.filter((value) => value !== id),
      },
    });
  };

  const clearResourceRestriction = (resource: string) => {
    const next = { ...draft.resourceAssignments };
    delete next[resource];
    updateDraft({ resourceAssignments: next });
  };

  const saveRole = async () => {
    if (!selectedRole) return;
    try {
      await updateRole.mutateAsync({
        id: selectedRole.id,
        input: { permissionCodes: roleDraft },
      });
      toast.success(`${selectedRole.name} permissions saved.`);
      setRoleSheetOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save role permissions.",
      );
    }
  };

  const saveUserPolicy = async () => {
    if (!selectedUser) return;
    try {
      const {
        effectivePermissions: _effective,
        baselinePermissions: _baseline,
        ...input
      } = draft;
      await updateUser.mutateAsync({
        id: selectedUser.id,
        input: { ...input, allowedPermissions: [] },
      });
      toast.success("Access policy saved.");
      setSheetOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save access policy.",
      );
    }
  };

  return (
    <>
      <PageMeta
        title="Access Control | Caballes-Go Securities, Inc."
        description="Manage CRM roles, permissions, and privacy policies."
      />
      <AppBreadcrumb pageName="Access Control" />

      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Access control
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Control role permissions, record scope, and field visibility from one place.
          </p>
        </div>
        <Badge color="info" size="sm">Database-backed policies</Badge>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "CRM users", value: userStats.total, color: "primary" as const },
          { label: "With access", value: userStats.withAccess, color: "success" as const },
          { label: "No access", value: userStats.withoutAccess, color: "error" as const },
          { label: "Record restricted", value: userStats.restricted, color: "warning" as const },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-800 dark:text-white/90">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className={`${cardClassName} overflow-hidden`}>
        <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">User access</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Per-user restrictions override, but never grant, role access.</p>
          </div>
          <Badge color={userStats.withoutAccess ? "warning" : "success"} size="sm">
            {userStats.total} {userStats.total === 1 ? "user" : "users"}
          </Badge>
        </div>
        {usersQuery.isLoading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading users...</p>
        ) : usersQuery.isError ? (
          <p className="px-5 py-8 text-sm text-error-500">
            {usersQuery.error.message}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={`${tableClassName} min-w-[700px]`}>
              <thead>
                <tr className={tableHeaderClassName}>
                  <th className="font-semibold">User</th>
                  <th className="font-semibold">Entra roles</th>
                  <th className="font-semibold">Permissions</th>
                  <th className="font-semibold">Access</th>
                  <th className="text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(usersQuery.data ?? []).map((user) => {
                  const roles = user.roles ?? [];
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatarUrl}
                            alt={user.name}
                            size="small"
                          />
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white/90">
                              {user.name}
                              {user.isCurrentUser ? " (Me)" : ""}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {roles.length ? (
                            roles.map((role) => (
                              <Badge key={role} color="light" size="sm">
                                {roleLabelByEntraValue.get(role) ?? role}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">
                              No role
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-semibold text-gray-800 dark:text-white/90">{user.policy.effectivePermissions.length}</span>
                        <span className="ml-1 text-xs text-gray-400">active</span>
                      </td>
                      <td>
                        <Badge
                          color={
                            user.policy.effectivePermissions.length
                              ? "success"
                              : "error"
                          }
                          size="sm"
                        >
                          {user.policy.effectivePermissions.length
                            ? "Allowed"
                            : "No access"}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openUserEditor(user)}
                            className={actionButtonClassName}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => openUserEditor(user)}
                            className={primaryActionButtonClassName}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={`${cardClassName} mt-4 overflow-hidden`}>
        <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">CRM roles</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Customize the permissions inherited from each Entra app role.</p>
          </div>
          <Badge color="primary" size="sm">{rolesQuery.data?.length ?? 0} roles</Badge>
        </div>
        {rolesQuery.isLoading ? (
          <p className="px-5 py-8 text-sm text-gray-500">Loading roles...</p>
        ) : rolesQuery.isError ? (
          <p className="px-5 py-8 text-sm text-error-500">
            {rolesQuery.error.message}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={`${tableClassName} min-w-[780px]`}>
              <thead>
                <tr className={tableHeaderClassName}>
                  <th className="font-semibold">Role</th>
                  <th className="font-semibold">Entra app role</th>
                  <th className="font-semibold">Permissions</th>
                  <th className="font-semibold">Description</th>
                  <th className="text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(rolesQuery.data ?? []).map((role) => (
                  <tr
                    key={role.id}
                    className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-white/[0.03]"
                  >
                    <td>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {role.name}
                      </p>
                      <p className="text-xs text-gray-400">{role.code}</p>
                    </td>
                    <td>
                      <Badge color="light" size="sm">
                        {role.entraAppRoleValue}
                      </Badge>
                    </td>
                    <td className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-gray-800 dark:text-white/90">{role.permissionCodes.length}</span>
                      <span className="ml-1 text-xs text-gray-400">granted</span>
                    </td>
                    <td className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                      {role.description ?? "No description"}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => openRoleEditor(role)}
                        className={primaryActionButtonClassName}
                      >
                        Edit permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Sheet
        isOpen={roleSheetOpen && Boolean(selectedRole)}
        onClose={() => setRoleSheetOpen(false)}
        title={`${selectedRole?.name ?? "Role"} permissions`}
        description="These permissions are stored in the CRM database and are inherited by users with this Entra app role."
        side="right"
        className="w-full sm:max-w-3xl xl:max-w-4xl"
      >
        {selectedRole && catalogQuery.data && (
          <div className="space-y-5">
            <section className={`${cardClassName} p-4 sm:p-5`}>
              <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Role permissions
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Select only the permissions this role needs. Access
                  administration remains restricted to roles that retain
                  access.manage.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {catalogQuery.data.permissions.map((permission) => (
                  <label
                    key={permission.code}
                    className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors dark:border-white/[0.06] ${roleDraft.includes(permission.code) ? "border-brand-200 bg-brand-50/60 dark:border-brand-500/30 dark:bg-brand-500/10" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/70 dark:hover:border-gray-700 dark:hover:bg-white/[0.03]"}`}
                  >
                    <Checkbox
                      checked={roleDraft.includes(permission.code)}
                      onChange={(checked) =>
                        toggleRolePermission(permission.code, checked)
                      }
                    />
                    <span>
                      <span className="block font-medium text-gray-700 dark:text-gray-200">
                        {permission.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {permission.code}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRoleSheetOpen(false)}
                className={actionButtonClassName}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRole}
                disabled={updateRole.isPending}
                className={`${primaryActionButtonClassName} h-10 px-4`}
              >
                {updateRole.isPending ? "Saving..." : "Save role permissions"}
              </button>
            </div>
          </div>
        )}
      </Sheet>

      <Sheet
        isOpen={sheetOpen && Boolean(selectedUser)}
        onClose={() => setSheetOpen(false)}
        title={`${selectedUser?.name ?? "User"} permissions`}
        description="Policies can restrict Entra access but cannot grant permissions missing from the user's Entra role."
        side="right"
        className="w-full sm:max-w-3xl xl:max-w-4xl"
      >
        {selectedUser && catalogQuery.data && (
          <div className="space-y-5">
            <section className={`${cardClassName} p-4 sm:p-5`}>
              <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Permissions
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Uncheck a permission to explicitly revoke it.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {catalogQuery.data.permissions.map((permission) => {
                  const roleAllows = draft.baselinePermissions.includes(
                    permission.code,
                  );
                  const enabled =
                    roleAllows &&
                    !draft.deniedPermissions.includes(permission.code);
                  return (
                    <label
                      key={permission.code}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors dark:border-white/[0.06] ${!roleAllows ? "border-gray-100 opacity-60 dark:border-white/[0.06]" : enabled ? "border-brand-200 bg-brand-50/60 dark:border-brand-500/30 dark:bg-brand-500/10" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/70 dark:hover:border-gray-700 dark:hover:bg-white/[0.03]"}`}
                    >
                      <Checkbox
                        checked={enabled}
                        disabled={!roleAllows}
                        onChange={(checked) =>
                          togglePermission(permission.code, checked)
                        }
                      />
                      <span>
                        <span className="block font-medium text-gray-700 dark:text-gray-200">
                          {permission.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {permission.code}
                          {!roleAllows ? " · Entra role required" : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
            <section className={`${cardClassName} p-4 sm:p-5`}>
              <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Record scope
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Limit records returned by the backend.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {catalogQuery.data.scopes.map((scope) => (
                  <label key={scope.key} className="block">
                    <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {scope.label}
                    </span>
                    <select
                      value={draft.dataScopes[scope.key] ?? "all"}
                      onChange={(event) =>
                        updateDraft({
                          dataScopes: {
                            ...draft.dataScopes,
                            [scope.key]: event.target.value as
                              | "all"
                              | "assigned"
                              | "own",
                          },
                        })
                      }
                      className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                      {scope.options.map((option) => (
                        <option key={option} value={option}>
                          {option === "all"
                            ? "All records"
                            : option === "assigned"
                              ? "Assigned records"
                              : "Own records"}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </section>
            <section className={`${cardClassName} p-4 sm:p-5`}>
              <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Exact record assignments
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  When restricted, only selected records are visible. Empty
                  selections mean no records.
                </p>
              </div>
              <div className="space-y-3">
                {catalogQuery.data.resources.map((resource) => {
                  const restricted = Object.prototype.hasOwnProperty.call(
                    draft.resourceAssignments,
                    resource.key,
                  );
                  const selected =
                    draft.resourceAssignments[resource.key] ?? [];
                  const records = resourcesQuery.data?.[resource.key] ?? [];
                  return (
                    <div
                      key={resource.key}
                      className={`rounded-lg border p-3 transition-colors dark:border-white/[0.06] ${restricted ? "border-brand-200 bg-brand-50/30 dark:border-brand-500/30 dark:bg-brand-500/5" : "border-gray-100"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {resource.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {restricted
                              ? `${selected.length} selected`
                              : "Unrestricted"}
                          </p>
                        </div>
                        {restricted ? (
                          <button
                            type="button"
                            onClick={() =>
                              clearResourceRestriction(resource.key)
                            }
                            className="text-xs font-medium text-brand-500"
                          >
                            Clear restriction
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft({
                                resourceAssignments: {
                                  ...draft.resourceAssignments,
                                  [resource.key]: [],
                                },
                              })
                            }
                            className="text-xs font-medium text-brand-500"
                          >
                            Restrict records
                          </button>
                        )}
                      </div>
                      {restricted && (
                        <div className="mt-3 grid max-h-48 gap-1 overflow-y-auto rounded-lg bg-gray-50 p-2 sm:grid-cols-2 dark:bg-white/[0.03]">
                          {records.map((record) => (
                            <label
                              key={record.id}
                              className="flex items-start gap-2 rounded px-2 py-1.5 text-xs"
                            >
                              <Checkbox
                                checked={selected.includes(record.id)}
                                onChange={(checked) =>
                                  toggleResourceRecord(
                                    resource.key,
                                    record.id,
                                    checked,
                                  )
                                }
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-gray-700 dark:text-gray-200">
                                  {record.name}
                                </span>
                                {record.secondary && (
                                  <span className="block truncate text-gray-400">
                                    {record.secondary}
                                  </span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
            <section className={`${cardClassName} p-4 sm:p-5`}>
              <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  Field visibility
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Hidden fields are redacted by the API.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {catalogQuery.data.fields.map((field) => {
                  const roleCanSee =
                    !field.sensitive ||
                    draft.effectivePermissions.includes("data.sensitive.read");
                  const visible =
                    roleCanSee && draft.fieldRules[field.key] !== "hidden";
                  return (
                    <label
                      key={field.key}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors dark:border-white/[0.06] ${!roleCanSee ? "border-gray-100 opacity-60 dark:border-white/[0.06]" : visible ? "border-brand-200 bg-brand-50/60 dark:border-brand-500/30 dark:bg-brand-500/10" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/70 dark:hover:border-gray-700 dark:hover:bg-white/[0.03]"}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-gray-700 dark:text-gray-200">
                          {field.label}
                        </span>
                        <span className="block truncate text-xs text-gray-400">
                          {field.key}
                        </span>
                      </span>
                      <Checkbox
                        checked={visible}
                        disabled={!roleCanSee}
                        onChange={(checked) =>
                          updateDraft({
                            fieldRules: {
                              ...draft.fieldRules,
                              [field.key]: checked ? "visible" : "hidden",
                            },
                          })
                        }
                      />
                    </label>
                  );
                })}
              </div>
            </section>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className={actionButtonClassName}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveUserPolicy}
                disabled={updateUser.isPending}
                className={`${primaryActionButtonClassName} h-10 px-4`}
              >
                {updateUser.isPending ? "Saving..." : "Save policy"}
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}
