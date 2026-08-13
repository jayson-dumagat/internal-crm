import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import Badge from "../ui/badge/Badge";

import PipelineCard from "./PipelineCard";

import type {
  PipelineLead,
  PipelineStage,
  StageColor,
} from "../../types/Pipelines";

type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface PipelineColumnProps {
  stage: PipelineStage;
  leads: PipelineLead[];
  onEditStage: (stage: PipelineStage) => void;
  onAddCard: (stage: PipelineStage) => void;
  onViewLead?: (lead: PipelineLead) => void;
  onEditLead?: (lead: PipelineLead) => void;
  canManage?: boolean;
}

const stageBadgeColor: Record<
  StageColor,
  BadgeColor
> = {
  default: "light",
  brand: "primary",
  info: "info",
  warning: "warning",
  success: "success",
  error: "error",
};

export default function PipelineColumn({
  stage,
  leads,
  onEditStage,
  onAddCard,
  onViewLead,
  onEditLead,
  canManage = true,
}: PipelineColumnProps) {
  const columnRef = useRef<HTMLElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const element = columnRef.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.type === "pipeline-lead",
      getData: () => ({ type: "pipeline-stage", stageId: stage.id }),
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => setIsOver(false),
    });
  }, [stage.id]);

  return (
    <section
      ref={columnRef}
      className={[
        "min-h-[520px] min-w-[320px] px-4 py-5 transition-colors sm:px-5",
        isOver
          ? "bg-brand-50/50 dark:bg-brand-500/[0.04]"
          : "",
      ].join(" ")}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
            {stage.name}
          </h3>

          <Badge
            variant="light"
            color={stageBadgeColor[stage.color]}
            size="sm"
          >
            {leads.length}
          </Badge>
        </div>

        <button
          type="button"
          disabled={!canManage}
          aria-label={`Edit ${stage.name}`}
          title={`Edit ${stage.name}`}
          onClick={() => onEditStage(stage)}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/[0.05] dark:hover:text-gray-300"
        >
          <MoreIcon />
        </button>
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <PipelineCard
            key={lead.id}
            lead={lead}
            onViewLead={onViewLead}
            onEditLead={onEditLead}
          />
        ))}

        {leads.length === 0 && (
          <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-gray-200 px-5 py-8 text-center dark:border-gray-800">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Drop leads here
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={!canManage}
          onClick={() => onAddCard(stage)}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 text-sm font-medium text-gray-500 transition hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-800 dark:hover:bg-brand-500/[0.06] dark:hover:text-brand-400"
        >
          <PlusIcon />
          Add card
        </button>
      </div>
    </section>
  );
}

function MoreIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
    >
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
