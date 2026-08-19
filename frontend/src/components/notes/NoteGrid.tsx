import type { NoteRecord } from "../../api/crm";
import NoteCard, { type NoteRelatedOption } from "./NoteCard";
import { DataLoadingSkeleton } from "../common/PageLoadingSkeleton";

type NoteGridProps = {
  notes: readonly NoteRecord[];
  relatedOptions: readonly NoteRelatedOption[];
  isLoading: boolean;
  onOpen: (note: NoteRecord) => void;
};

export default function NoteGrid({
  notes,
  relatedOptions,
  isLoading,
  onOpen,
}: NoteGridProps) {
  if (!notes.length) {
    if (isLoading) return <DataLoadingSkeleton rows={6} />;
    return (
      <div className="rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center dark:border-gray-800">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          No notes found
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {isLoading ? "" : "Try another search or category."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          relatedOptions={relatedOptions}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
