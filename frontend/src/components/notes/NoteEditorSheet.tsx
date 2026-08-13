import type { UseFormReturn } from "react-hook-form";
import type { NoteRecord } from "../../api/crm";
import type { NoteFormValues } from "../../validations/crm";
import LexicalNoteEditor from "./LexicalNoteEditor";
import Sheet from "../ui/sheet/Sheet";
import type { NoteRelatedOption } from "./NoteCard";

const inputClassName = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

type NoteEditorSheetProps = {
  isOpen: boolean;
  selectedNote: NoteRecord | null;
  relatedOptions: readonly NoteRelatedOption[];
  form: UseFormReturn<NoteFormValues>;
  canCreate: boolean;
  canUpdate: boolean;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: NoteFormValues) => void;
};

export default function NoteEditorSheet({
  isOpen,
  selectedNote,
  relatedOptions,
  form,
  canCreate,
  canUpdate,
  isPending,
  onClose,
  onSubmit,
}: NoteEditorSheetProps) {
  const noteTitle = form.watch("title");
  const noteContent = form.watch("content");
  const readOnly = Boolean(selectedNote) && !canUpdate;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={selectedNote ? (canUpdate ? "Edit Note" : "View Note") : "Add Note"}
      description="Capture a client, investment, or internal note."
      side="right"
      className="w-full sm:max-w-2xl xl:max-w-3xl"
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Field label="Title" error={form.formState.errors.title?.message}>
          <input disabled={readOnly} {...form.register("title")} maxLength={255} className={inputClassName} placeholder="Enter note title" autoFocus />
        </Field>
        <Field label="Category" error={form.formState.errors.category?.message}>
          <select disabled={readOnly} {...form.register("category")} className={inputClassName}>
            <option>Client</option><option>Follow-up</option><option>Investment</option><option>Internal</option>
          </select>
        </Field>
        <Field label="Related to" error={form.formState.errors.relatedTo?.message}>
          <select disabled={readOnly} {...form.register("relatedTo")} className={inputClassName}>
            <option value="">General</option>
            {relatedOptions.map((item) => <option key={`${item.label}-${item.value}`} value={item.value}>{item.label}</option>)}
          </select>
        </Field>
        <Field label="Note" error={form.formState.errors.content?.message}>
          <LexicalNoteEditor
            key={selectedNote?.id ?? "new"}
            readOnly={readOnly}
            initialContentHtml={selectedNote?.contentHtml}
            onChange={(plainText, html) => {
              form.setValue("content", plainText, { shouldValidate: true });
              form.setValue("contentHtml", html);
            }}
          />
        </Field>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
          <button type="button" onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-400">Close</button>
          <button type="submit" disabled={isPending || !noteTitle.trim() || !noteContent.trim() || (selectedNote ? !canUpdate : !canCreate)} className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50">
            {isPending ? "Saving..." : selectedNote ? "Save changes" : "Add Note"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-error-500">{error}</span>}
    </label>
  );
}
