import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";
import Avatar from "../components/ui/avatar/Avatar";
import Badge from "../components/ui/badge/Badge";
import Sheet from "../components/ui/sheet/Sheet";
import { useAccessCatalogQuery, useAccessResourcesQuery, useAccessUsersQuery, useUpdateAccessUser } from "../hooks/access/useAccessControl";
import type { AccessUser } from "../validations/api";

type PermissionState = {
  allowedPermissions: string[];
  deniedPermissions: string[];
  fieldRules: Record<string, "visible" | "hidden">;
  dataScopes: Record<string, "all" | "assigned" | "own">;
  resourceAssignments: Record<string, string[]>;
  baselinePermissions: string[];
  effectivePermissions: string[];
};

const cardClassName = "rounded-xl border border-gray-100 bg-white shadow-theme-xs dark:border-white/[0.05] dark:bg-white/[0.03]";
const checkboxClassName = "size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900";

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
  const catalogQuery = useAccessCatalogQuery();
  const usersQuery = useAccessUsersQuery();
  const resourcesQuery = useAccessResourcesQuery();
  const updateUser = useUpdateAccessUser();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [draft, setDraft] = useState<PermissionState>(policyState(undefined));
  const [sheetOpen, setSheetOpen] = useState(false);
  const selectedUser = useMemo(() => usersQuery.data?.find((user) => user.id === selectedUserId), [selectedUserId, usersQuery.data]);

  useEffect(() => {
    setDraft(policyState(selectedUser));
  }, [selectedUser]);

  const openEditor = (user: AccessUser) => {
    setSelectedUserId(user.id);
    setSheetOpen(true);
  };
  const updateDraft = (change: Partial<PermissionState>) => setDraft((current) => ({ ...current, ...change }));
  const togglePermission = (code: string, enabled: boolean) => setDraft((current) => ({
    ...current,
    allowedPermissions: enabled ? Array.from(new Set([...current.allowedPermissions, code])) : current.allowedPermissions.filter((value) => value !== code),
    deniedPermissions: enabled ? current.deniedPermissions.filter((value) => value !== code) : Array.from(new Set([...current.deniedPermissions, code])),
  }));
  const toggleResourceRecord = (resource: string, id: string, enabled: boolean) => {
    const current = draft.resourceAssignments[resource] ?? [];
    updateDraft({ resourceAssignments: { ...draft.resourceAssignments, [resource]: enabled ? Array.from(new Set([...current, id])) : current.filter((value) => value !== id) } });
  };
  const clearResourceRestriction = (resource: string) => {
    const next = { ...draft.resourceAssignments };
    delete next[resource];
    updateDraft({ resourceAssignments: next });
  };
  const save = async () => {
    if (!selectedUser) return;
    try {
      const { effectivePermissions: _effective, baselinePermissions: _baseline, ...input } = draft;
      await updateUser.mutateAsync({ id: selectedUser.id, input });
      toast.success("Access policy saved.");
      setSheetOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save access policy.");
    }
  };

  return <>
    <PageMeta title="Access Control | Caballes-Go Securities, Inc." description="Manage CRM permissions and privacy policies." />
    <AppBreadcrumb pageName="Access Control" />
    <section className={`${cardClassName} overflow-hidden`}>
      <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]"><h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">Access control</h1><p className="text-sm text-gray-500 dark:text-gray-400">Review CRM users and open a permission sheet to manage least-privilege access.</p></div>
      {usersQuery.isLoading ? <p className="px-5 py-8 text-sm text-gray-500">Loading users...</p> : usersQuery.isError ? <p className="px-5 py-8 text-sm text-error-500">{usersQuery.error.message}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead><tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400 dark:border-white/[0.05]"><th className="px-5 py-3 font-medium">User</th><th className="px-5 py-3 font-medium">Entra roles</th><th className="px-5 py-3 font-medium">Effective permissions</th><th className="px-5 py-3 font-medium">Access</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead><tbody>{(usersQuery.data ?? []).map((user) => { const roles = user.roles ?? []; return <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.03]"><td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar src={user.avatarUrl} alt={user.name} size="small" /><div><p className="font-medium text-gray-800 dark:text-white/90">{user.name}{user.isCurrentUser ? " (Me)" : ""}</p><p className="text-xs text-gray-400">{user.email}</p></div></div></td><td className="px-5 py-4"><div className="flex flex-wrap gap-1">{roles.length ? roles.map((role) => <Badge key={role} color="light" size="sm">{role}</Badge>) : <span className="text-sm text-gray-400">No role</span>}</div></td><td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{user.policy.effectivePermissions.length}</td><td className="px-5 py-4"><Badge color={user.policy.effectivePermissions.length ? "success" : "error"} size="sm">{user.policy.effectivePermissions.length ? "Allowed" : "No access"}</Badge></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEditor(user)} className="inline-flex h-8 items-center rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.04]">View</button><button type="button" onClick={() => openEditor(user)} className="inline-flex h-8 items-center rounded-lg bg-brand-500 px-3 text-xs font-medium text-white hover:bg-brand-600">Edit</button></div></td></tr>; })}</tbody></table></div>}
    </section>

    <Sheet isOpen={sheetOpen && Boolean(selectedUser)} onClose={() => setSheetOpen(false)} title={`${selectedUser?.name ?? "User"} permissions`} description="Policies can restrict Entra access but cannot grant permissions missing from the user's Entra role." side="right" className="w-full sm:max-w-3xl xl:max-w-4xl">
      {selectedUser && catalogQuery.data && <div className="space-y-5">
        <section className={cardClassName}><div className="mb-4"><h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">Permissions</h2><p className="mt-1 text-xs text-gray-500">Uncheck a permission to explicitly revoke it.</p></div><div className="grid gap-2 sm:grid-cols-2">{catalogQuery.data.permissions.map((permission) => { const roleAllows = draft.baselinePermissions.includes(permission.code); const enabled = roleAllows && !draft.deniedPermissions.includes(permission.code); return <label key={permission.code} className={`flex items-start gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm dark:border-white/[0.06] ${!roleAllows ? "opacity-60" : ""}`}><input type="checkbox" className={`${checkboxClassName} mt-0.5`} checked={enabled} disabled={!roleAllows} onChange={(event) => togglePermission(permission.code, event.target.checked)} /><span><span className="block font-medium text-gray-700 dark:text-gray-200">{permission.label}</span><span className="text-xs text-gray-400">{permission.code}{!roleAllows ? " · Entra role required" : ""}</span></span></label>; })}</div></section>
        <section className={cardClassName}><div className="mb-4"><h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">Record scope</h2><p className="mt-1 text-xs text-gray-500">Limit records returned by the backend.</p></div><div className="grid gap-4 sm:grid-cols-2">{catalogQuery.data.scopes.map((scope) => <label key={scope.key} className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{scope.label}</span><select value={draft.dataScopes[scope.key] ?? "all"} onChange={(event) => updateDraft({ dataScopes: { ...draft.dataScopes, [scope.key]: event.target.value as "all" | "assigned" | "own" } })} className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900">{scope.options.map((option) => <option key={option} value={option}>{option === "all" ? "All records" : option === "assigned" ? "Assigned records" : "Own records"}</option>)}</select></label>)}</div></section>
        <section className={cardClassName}><div className="mb-4"><h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">Exact record assignments</h2><p className="mt-1 text-xs text-gray-500">When restricted, only selected records are visible. Empty selections mean no records.</p></div><div className="space-y-3">{catalogQuery.data.resources.map((resource) => { const restricted = Object.prototype.hasOwnProperty.call(draft.resourceAssignments, resource.key); const selected = draft.resourceAssignments[resource.key] ?? []; const records = resourcesQuery.data?.[resource.key] ?? []; return <div key={resource.key} className="rounded-lg border border-gray-100 p-3 dark:border-white/[0.06]"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-medium text-gray-700 dark:text-gray-200">{resource.label}</p><p className="text-xs text-gray-400">{restricted ? `${selected.length} selected` : "Unrestricted"}</p></div>{restricted ? <button type="button" onClick={() => clearResourceRestriction(resource.key)} className="text-xs font-medium text-brand-500">Clear restriction</button> : <button type="button" onClick={() => updateDraft({ resourceAssignments: { ...draft.resourceAssignments, [resource.key]: [] } })} className="text-xs font-medium text-brand-500">Restrict records</button>}</div>{restricted && <div className="mt-3 grid max-h-48 gap-1 overflow-y-auto rounded-lg bg-gray-50 p-2 sm:grid-cols-2 dark:bg-white/[0.03]">{records.map((record) => <label key={record.id} className="flex items-start gap-2 rounded px-2 py-1.5 text-xs"><input type="checkbox" className={`${checkboxClassName} mt-0.5`} checked={selected.includes(record.id)} onChange={(event) => toggleResourceRecord(resource.key, record.id, event.target.checked)} /><span className="min-w-0"><span className="block truncate text-gray-700 dark:text-gray-200">{record.name}</span>{record.secondary && <span className="block truncate text-gray-400">{record.secondary}</span>}</span></label>)}</div>}</div>; })}</div></section>
        <section className={cardClassName}><div className="mb-4"><h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">Field visibility</h2><p className="mt-1 text-xs text-gray-500">Hidden fields are redacted by the API.</p></div><div className="grid gap-2 sm:grid-cols-2">{catalogQuery.data.fields.map((field) => { const roleCanSee = !field.sensitive || draft.effectivePermissions.includes("data.sensitive.read"); const visible = roleCanSee && draft.fieldRules[field.key] !== "hidden"; return <label key={field.key} className={`flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2.5 text-sm dark:border-white/[0.06] ${!roleCanSee ? "opacity-60" : ""}`}><span className="min-w-0"><span className="block truncate font-medium text-gray-700 dark:text-gray-200">{field.label}</span><span className="block truncate text-xs text-gray-400">{field.key}</span></span><input type="checkbox" className={checkboxClassName} checked={visible} disabled={!roleCanSee} onChange={(event) => updateDraft({ fieldRules: { ...draft.fieldRules, [field.key]: event.target.checked ? "visible" : "hidden" } })} /></label>; })}</div></section>
        <div className="flex justify-end gap-2"><button type="button" onClick={() => setSheetOpen(false)} className="inline-flex h-10 items-center rounded-lg border border-gray-300 px-4 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">Cancel</button><button type="button" onClick={save} disabled={updateUser.isPending} className="inline-flex h-10 items-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white disabled:opacity-50">{updateUser.isPending ? "Saving..." : "Save policy"}</button></div>
      </div>}
    </Sheet>
  </>;
}
