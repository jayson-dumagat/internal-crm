import type { Request } from "express";
import { ListQuery } from "../types/list-query";

function stringQuery(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function getListQuery(req: Request, defaultPageSize = 50): ListQuery {
  const page = Math.max(
    Number.parseInt(String(req.query.page ?? "1"), 10) || 1,
    1,
  );
  // Keep legacy callers compatible while allowing explicit server pagination.
  // A page is only constrained when the client actually sends page/pageSize.
  const hasExplicitPagination =
    req.query.page !== undefined || req.query.pageSize !== undefined;
  const pageSize = hasExplicitPagination
    ? Math.min(
        Math.max(
          Number.parseInt(String(req.query.pageSize ?? defaultPageSize), 10) ||
            defaultPageSize,
          1,
        ),
        200,
      )
    : 500;
  return {
    search: stringQuery(req.query.search),
    status: stringQuery(req.query.status),
    category: stringQuery(req.query.category),
    outcome: stringQuery(req.query.outcome),
    kind: stringQuery(req.query.kind),
    type: stringQuery(req.query.type),
    priority: stringQuery(req.query.priority),
    assignedTo: stringQuery(req.query.assignedTo),
    relatedTo: stringQuery(req.query.relatedTo),
    dateFrom: stringQuery(req.query.dateFrom),
    dateTo: stringQuery(req.query.dateTo),
    author: stringQuery(req.query.author),
    actor: stringQuery(req.query.actor),
    action: stringQuery(req.query.action),
    target: stringQuery(req.query.target),
    role: stringQuery(req.query.role),
    company: stringQuery(req.query.company),
    location: stringQuery(req.query.location),
    relationshipOwner: stringQuery(req.query.relationshipOwner),
    relationshipLevel: stringQuery(req.query.relationshipLevel),
    clientType: stringQuery(req.query.clientType),
    riskProfile: stringQuery(req.query.riskProfile),
    interestLevel: stringQuery(req.query.interestLevel),
    page,
    pageSize,
  };
}

export function paginate<T>(items: T[], query: ListQuery) {
  const total = items.length;
  const start = (query.page - 1) * query.pageSize;
  return {
    data: items.slice(start, start + query.pageSize),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / query.pageSize), 1),
    },
  };
}

export function matchesSearch(value: unknown, search?: string): boolean {
  if (!search) return true;
  return String(value ?? "")
    .toLowerCase()
    .includes(search.toLowerCase());
}

export function matchesStatus(value: unknown, status?: string): boolean {
  return !status || String(value ?? "").toLowerCase() === status.toLowerCase();
}

export function matchesQuery(value: unknown, query?: string): boolean {
  return !query || String(value ?? "").toLowerCase().includes(query.toLowerCase());
}

export function matchesDateRange(
  value: Date | string | null | undefined,
  from?: string,
  to?: string,
): boolean {
  if (!from && !to) return true;
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return false;
  if (from) {
    const start = new Date(`${from}T00:00:00.000Z`).getTime();
    if (!Number.isNaN(start) && timestamp < start) return false;
  }
  if (to) {
    const end = new Date(`${to}T23:59:59.999Z`).getTime();
    if (!Number.isNaN(end) && timestamp > end) return false;
  }
  return true;
}
