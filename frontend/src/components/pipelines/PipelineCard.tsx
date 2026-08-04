import { type MouseEvent, useEffect, useRef, useState } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import Avatar from "../ui/avatar/Avatar";

import type { PipelineLead } from "./types";

interface PipelineCardProps {
  lead: PipelineLead;
  onViewLead?: (lead: PipelineLead) => void;
  onEditLead?: (lead: PipelineLead) => void;
}

export default function PipelineCard({
  lead,
  onViewLead,
  onEditLead,
}: PipelineCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    return draggable({
      element,
      getInitialData: () => ({
        type: "pipeline-lead",
        leadId: lead.id,
        sourceStageId: lead.stageId,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [lead.id, lead.stageId]);

  const handleInteractiveClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <article
      ref={cardRef}
      onClick={() => onViewLead?.(lead)}
      className={[
        "group rounded-xl border border-gray-100 bg-white shadow-theme-xs transition",
        "hover:border-gray-200 hover:shadow-theme-sm",
        "dark:border-white/[0.05] dark:bg-gray-900 dark:hover:border-white/[0.08]",
        isDragging ? "cursor-grabbing opacity-40" : "cursor-grab",
      ].join(" ")}
    >
      <div className="p-4">
        {/* Lead identity */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar src={lead.avatar} alt={lead.name} size="medium" />

            <div className="min-w-0">
              <p className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {lead.name}
              </p>

              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {lead.role}
              </p>
            </div>
          </div>

          <div
            className="flex shrink-0 items-center gap-1"
            onClick={handleInteractiveClick}
          >
            <button
              type="button"
              aria-label={`Edit ${lead.name}`}
              title={`Edit ${lead.name}`}
              onClick={() => onEditLead?.(lead)}
              className="inline-flex size-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.05] dark:hover:text-gray-300"
            >
              <EditIcon />
            </button>
          </div>
        </div>

        {/* Company */}
        <div className="mt-3">
          <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
            {lead.company}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-4 py-3 dark:border-white/[0.05]">
        <div className="min-w-0">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Last activity
          </p>

          <p className="mt-0.5 truncate text-xs font-medium text-gray-600 dark:text-gray-300">
            {lead.lastActivity}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="max-w-24 truncate text-xs text-gray-500 dark:text-gray-400">
            {lead.owner.name}
          </span>
          <AvatarMetadata
            name={lead.owner.name}
            avatar={lead.owner.avatar}
          />
        </div>
      </div>
    </article>
  );
}

function AvatarMetadata({
  name,
  avatar,
}: {
  name: string;
  avatar: string;
}) {
  return (
    <div title={`Owner: ${name}`}>
      <Avatar src={avatar} alt={name} size="small" />
    </div>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4">
      <path
        d="M14.5 5.5 18.5 9.5M6 18l2.75-.55L18 8.2a1.75 1.75 0 0 0 0-2.48l-.72-.72a1.75 1.75 0 0 0-2.48 0l-9.25 9.25L5 17v1h1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
