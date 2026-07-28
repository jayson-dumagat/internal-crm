import { useEffect, useRef, type MouseEvent } from "react";
import { useDrag } from "react-dnd";

import Avatar from "../ui/avatar/Avatar";

import type { DraggedPipelineLead, PipelineLead } from "./types";

const PIPELINE_LEAD_TYPE = "PIPELINE_LEAD";

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

  const [{ isDragging }, dragRef] = useDrag<
    DraggedPipelineLead,
    void,
    { isDragging: boolean }
  >({
    type: PIPELINE_LEAD_TYPE,
    item: {
      type: PIPELINE_LEAD_TYPE,
      leadId: lead.id,
      sourceStageId: lead.stageId,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    if (!cardRef.current) {
      return;
    }

    dragRef(cardRef.current);
  }, [dragRef]);

  const handleInteractiveClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const progress = Math.min(Math.max(lead.progress, 0), 100);

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
              aria-label={`View ${lead.name}`}
              title={`View ${lead.name}`}
              onClick={() => onViewLead?.(lead)}
              className="inline-flex size-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/[0.05] dark:hover:text-gray-300"
            >
              <EyeIcon />
            </button>

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
        <div className="mt-4">
          <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
            {lead.company}
          </p>

          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            Company
          </p>
        </div>

        {/* Contact */}
        <div className="mt-4 space-y-1.5">
          <a
            href={`mailto:${lead.email}`}
            onClick={handleInteractiveClick}
            className="flex min-w-0 items-center gap-2 text-sm text-gray-500 transition hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
          >
            <EmailIcon />

            <span className="truncate">{lead.email}</span>
          </a>

          <a
            href={`tel:${normalizePhone(lead.phone)}`}
            onClick={handleInteractiveClick}
            className="flex min-w-0 items-center gap-2 text-sm text-gray-500 transition hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
          >
            <PhoneIcon />

            <span className="truncate">{lead.phone}</span>
          </a>
        </div>

        {/* Metadata */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <CardMetadata label="Lead Source" value={lead.source} />

          <CardMetadata label="Date Created" value={lead.dateCreated} />
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">Progress</p>

            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {progress}%
            </p>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-brand-500 transition-[width]"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
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

        <div className="flex shrink-0 items-center gap-4">
          <AvatarMetadata
            label="Owner"
            name={lead.owner.name}
            avatar={lead.owner.avatar}
          />

          <AvatarMetadata
            label="Assigned"
            name={lead.assignedTo.name}
            avatar={lead.assignedTo.avatar}
          />
        </div>
      </div>
    </article>
  );
}

function CardMetadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>

      <p
        title={value}
        className="mt-1 truncate text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {value}
      </p>
    </div>
  );
}

function AvatarMetadata({
  label,
  name,
  avatar,
}: {
  label: string;
  name: string;
  avatar: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <p className="mb-1 text-[10px] text-gray-400 dark:text-gray-500">
        {label}
      </p>

      <div title={name}>
        <Avatar src={avatar} alt={name} size="small" />
      </div>
    </div>
  );
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4 shrink-0"
    >
      <path
        d="M4 6.75h16v10.5H4V6.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      <path
        d="m4.75 7.5 7.25 5 7.25-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4 shrink-0"
    >
      <path
        d="M8.4 4.75 10 8.4 8.2 10a14.5 14.5 0 0 0 5.8 5.8l1.6-1.8 3.65 1.6v2.5c0 .64-.49 1.17-1.13 1.22C10.74 19.9 4.1 13.26 4.68 5.88A1.23 1.23 0 0 1 5.9 4.75h2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4">
      <path
        d="M2.75 12s3.25-5 9.25-5 9.25 5 9.25 5-3.25 5-9.25 5-9.25-5-9.25-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <circle
        cx="12"
        cy="12"
        r="2.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
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
