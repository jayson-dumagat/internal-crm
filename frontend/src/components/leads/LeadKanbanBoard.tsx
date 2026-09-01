import { type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { draggable, dropTargetForElements, monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import type { Lead } from "../../types/Leads";
import type { LeadStatus } from "../../types/Leads";
import Avatar from "../ui/avatar/Avatar";
import Badge from "../ui/badge/Badge";
import { formatDisplayDate } from "../../utils/date";
import { leadInterestBadgeColor, leadStatusBadgeColor } from "../../utils/leads";

const columns: Array<{ status: LeadStatus; label: string }> = [
  { status: "New", label: "New" },
  { status: "Contacted", label: "Contacted" },
  { status: "Qualified", label: "Qualified" },
  { status: "Converted", label: "Converted" },
  { status: "Lost", label: "Lost" },
];

type LeadKanbanBoardProps = {
  leads: Lead[];
  canUpdate: boolean;
  onStatusChange: (leadId: string, status: LeadStatus) => Promise<void> | void;
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
};

export default function LeadKanbanBoard({
  leads,
  canUpdate,
  onStatusChange,
  onSelectLead,
  onEditLead,
}: LeadKanbanBoardProps) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, LeadStatus>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Drop is optimistic: the card moves as soon as the drop completes, while
  // the mutation runs in the background. A failed request rolls it back.
  const moveLead = useCallback(
    async (leadId: string, destination: LeadStatus) => {
      const lead = leads.find((item) => item.id === leadId);
      if (!lead) return;
      const previous = statusOverrides[leadId] ?? lead.status;
      if (previous === destination || !canUpdate) return;

      setStatusOverrides((current) => ({ ...current, [leadId]: destination }));
      try {
        await onStatusChange(leadId, destination);
        // Keep the optimistic value until the invalidated query returns, so
        // the card does not visibly jump back to its old column in between.
      } catch {
        setStatusOverrides((current) => ({ ...current, [leadId]: previous }));
      }
    },
    [canUpdate, leads, onStatusChange, statusOverrides],
  );

  useEffect(
    () =>
      monitorForElements({
        canMonitor: ({ source }) => source.data.type === "lead-kanban-card",
        onDrop: ({ source, location }) => {
          const target = location.current.dropTargets[0];
          const sourceData = source.data as { leadId?: string; status?: string };
          const targetData = target?.data as { status?: string } | undefined;
          const destination = columns.find((item) => item.status === targetData?.status)?.status;
          if (sourceData.leadId && destination && sourceData.status !== destination) {
            void moveLead(sourceData.leadId, destination);
          }
          setDraggingId(null);
        },
      }),
    [moveLead],
  );

  const visibleLeads = useMemo(
    () => leads.map((lead) => ({ ...lead, status: statusOverrides[lead.id] ?? lead.status })),
    [leads, statusOverrides],
  );

  return (
    <div className="custom-scrollbar overflow-x-auto">
      <div className="grid min-w-max divide-x divide-gray-200 border-t border-gray-100 dark:divide-white/[0.05] dark:border-white/[0.05]" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(340px, 1fr))` }}>
        {columns.map((column) => (
          <LeadKanbanColumn
            key={column.status}
            status={column.status}
            label={column.label}
            leads={visibleLeads.filter((lead) => lead.status === column.status)}
            canUpdate={canUpdate}
            dragging={Boolean(draggingId)}
            onDragStateChange={setDraggingId}
            onSelectLead={onSelectLead}
            onEditLead={onEditLead}
          />
        ))}
      </div>
    </div>
  );
}

function LeadKanbanColumn({
  status,
  label,
  leads,
  canUpdate,
  dragging,
  onDragStateChange,
  onSelectLead,
  onEditLead,
}: {
  status: LeadStatus;
  label: string;
  leads: Lead[];
  canUpdate: boolean;
  dragging: boolean;
  onDragStateChange: (id: string | null) => void;
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}) {
  const columnRef = useRef<HTMLElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    if (!columnRef.current) return;
    return dropTargetForElements({
      element: columnRef.current,
      canDrop: ({ source }) => canUpdate && source.data.type === "lead-kanban-card",
      getData: () => ({ type: "lead-kanban-column", status }),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    });
  }, [canUpdate, status]);

  return (
    <section ref={columnRef} className={["min-h-[560px] min-w-[340px] px-5 py-6 transition-colors sm:px-6", isOver ? "bg-brand-50/50 dark:bg-brand-500/[0.04]" : ""].join(" ")}>
      <div className="mb-5 flex items-center gap-2">
        <h3 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">{label}</h3>
        <Badge variant="light" color={leadStatusBadgeColor[status]} size="sm">{leads.length}</Badge>
        {dragging && <span className="ml-auto text-xs text-brand-500">Drop here</span>}
      </div>
      <div className="space-y-4">
        {leads.map((lead) => (
          <LeadKanbanCard key={lead.id} lead={lead} canUpdate={canUpdate} onDragStateChange={onDragStateChange} onSelectLead={onSelectLead} onEditLead={onEditLead} />
        ))}
        {!leads.length && <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-gray-200 px-5 py-8 text-center dark:border-gray-800"><p className="text-sm text-gray-400 dark:text-gray-500">{dragging ? "Drop leads here" : "No leads"}</p></div>}
      </div>
    </section>
  );
}

function LeadKanbanCard({
  lead,
  canUpdate,
  onDragStateChange,
  onSelectLead,
  onEditLead,
}: {
  lead: Lead;
  canUpdate: boolean;
  onDragStateChange: (id: string | null) => void;
  onSelectLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!cardRef.current || !canUpdate) return;
    return draggable({
      element: cardRef.current,
      getInitialData: () => ({ type: "lead-kanban-card", leadId: lead.id, status: lead.status }),
      onDragStart: () => {
        setIsDragging(true);
        onDragStateChange(lead.id);
      },
      onDrop: () => {
        setIsDragging(false);
        onDragStateChange(null);
      },
    });
  }, [canUpdate, lead.id, lead.status, onDragStateChange]);

  const stop = (event: MouseEvent<HTMLElement>) => event.stopPropagation();

  return (
    <article ref={cardRef} onClick={() => onSelectLead(lead)} className={["group rounded-xl border border-gray-100 bg-white shadow-theme-xs transition dark:border-white/[0.05] dark:bg-gray-900", canUpdate ? "cursor-grab hover:border-gray-200 hover:shadow-theme-sm" : "", isDragging ? "cursor-grabbing opacity-40" : ""].join(" ")}>
      <div className="p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar src={lead.avatar} alt={lead.name} size="medium" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">{lead.name}</p>
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{lead.role || "No role provided"}</p>
            </div>
          </div>
          <button type="button" aria-label={`Edit ${lead.name}`} title={`Edit ${lead.name}`} onClick={(event) => { stop(event); onEditLead(lead); }} disabled={!canUpdate} className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/[0.05] dark:hover:text-gray-300">
            <EditIcon />
          </button>
        </div>
        <p className="mt-4 truncate text-sm font-medium text-gray-700 dark:text-gray-300">{lead.company || "Individual"}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="light" color={leadInterestBadgeColor[lead.interestLevel]} size="sm">{lead.interestLevel} interest</Badge>
          <span className="text-xs text-gray-400">{formatDisplayDate(lead.lastActivity)}</span>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05]">
        <span className="max-w-48 truncate text-xs text-gray-500 dark:text-gray-400">{lead.owner.name}</span>
        <Avatar src={lead.owner.avatar} alt={lead.owner.name} size="small" />
      </div>
    </article>
  );
}

function EditIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4"><path d="m14.5 5.5 4 4M6 18l2.75-.55L18 8.2a1.75 1.75 0 0 0 0-2.48l-.72-.72a1.75 1.75 0 0 0-2.48 0l-9.25 9.25L5 17v1h1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
