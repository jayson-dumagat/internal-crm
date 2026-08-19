import type { NoteRecord } from "../../api/crm";
import { formatDisplayDate } from "../../utils/date";
import Avatar from "../ui/avatar/Avatar";
import Badge from "../ui/badge/Badge";

const categoryColor = {
  Client: "primary",
  "Follow-up": "warning",
  Investment: "success",
  Internal: "light",
} as const;

export type NoteRelatedOption = {
  value: string;
  label: string;
  avatar: string | null;
};

type NoteCardProps = {
  note: NoteRecord;
  relatedOptions: readonly NoteRelatedOption[];
  onOpen: (note: NoteRecord) => void;
};

export default function NoteCard({
  note,
  relatedOptions,
  onOpen,
}: NoteCardProps) {
  const related = relatedOptions.find((item) => item.value === note.relatedTo);
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(note);
        }
      }}
      className="group flex min-h-48 cursor-pointer flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-theme-xs transition hover:border-gray-200 hover:shadow-theme-sm focus:outline-none focus-visible:shadow-theme-sm dark:border-white/[0.05] dark:bg-gray-900 dark:hover:border-white/[0.08]"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge variant="light" color={categoryColor[note.category]} size="sm">{note.category}</Badge>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar src={note.relatedAvatar ?? related?.avatar ?? null} alt={note.relatedTo || "General"} size="xsmall" colorKey={note.relatedTo || note.id} />
          <h2 className="line-clamp-2 text-base font-semibold text-gray-800 dark:text-white/90">{note.title}</h2>
        </div>
      </div>
      {note.contentHtml ? (
        <div className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: note.contentHtml }} />
      ) : (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">{note.content}</p>
      )}
      <div className="mt-auto border-t border-gray-100 pt-3 dark:border-white/[0.05]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar src={note.authorAvatar} alt={note.author} size="xsmall" />
            <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{note.author}</span>
          </div>
          <time dateTime={note.updatedAt} className="shrink-0 text-xs text-gray-400">{formatDisplayDate(note.updatedAt)}</time>
        </div>
      </div>
    </article>
  );
}
