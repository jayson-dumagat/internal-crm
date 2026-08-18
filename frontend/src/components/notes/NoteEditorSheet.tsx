import type { UseFormReturn } from "react-hook-form";
import type { NoteRecord } from "../../api/crm";
import type { NoteFormValues } from "../../validations/crm";
import LexicalNoteEditor from "./LexicalNoteEditor";
import Sheet from "../ui/sheet/Sheet";
import type { NoteRelatedOption } from "./NoteCard";
import ArkCombobox, { type ArkComboboxOption } from "../crm/ArkCombobox";
import {
  CrmFormField as Field,
  CrmInfoSection as FormSection,
  crmInputClassName as inputClassName,
  crmPrimaryButtonClassName as primaryButtonClassName,
  crmSecondaryButtonClassName as secondaryButtonClassName,
} from "../crm/FormPrimitives";

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
  const categoryOptions: ArkComboboxOption[] = [
    { value: "Client", label: "Client" },
    { value: "Follow-up", label: "Follow-up" },
    { value: "Investment", label: "Investment" },
    { value: "Internal", label: "Internal" },
  ];
  const relatedToOptions: ArkComboboxOption[] = [
    { value: "", label: "General" },
    ...relatedOptions.map((item) => ({ value: item.value, label: item.label })),
  ];

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={selectedNote ? (canUpdate ? "Edit Note" : "View Note") : "Add Note"}
      description="Capture a client, investment, or internal note."
      side="right"
      className="w-full sm:max-w-2xl xl:max-w-3xl"
    >
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormSection title="Note details" description="Capture the note, classify it, and connect it to a CRM record.">
          <Field label="Title" required error={form.formState.errors.title?.message}>
            <input disabled={readOnly} {...form.register("title")} maxLength={255} className={inputClassName} placeholder="Enter note title" autoFocus />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" required error={form.formState.errors.category?.message}>
              <input type="hidden" {...form.register("category")} />
              <ArkCombobox value={form.watch("category")} options={categoryOptions} onChange={(value) => form.setValue("category", value as NoteFormValues["category"], { shouldValidate: true, shouldDirty: true })} placeholder="Search category" disabled={readOnly} />
            </Field>
            <Field label="Related to" error={form.formState.errors.relatedTo?.message}>
              <input type="hidden" {...form.register("relatedTo")} />
              <ArkCombobox value={form.watch("relatedTo") ?? ""} options={relatedToOptions} onChange={(value) => form.setValue("relatedTo", value, { shouldValidate: true, shouldDirty: true })} placeholder="Search records" disabled={readOnly} />
            </Field>
          </div>
          <Field label="Note" required error={form.formState.errors.content?.message}>
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
        </FormSection>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
          <button type="button" onClick={onClose} className={secondaryButtonClassName}>Cancel</button>
          <button type="submit" disabled={isPending || !noteTitle.trim() || !noteContent.trim() || (selectedNote ? !canUpdate : !canCreate)} className={primaryButtonClassName}>
            {isPending ? "Saving..." : selectedNote ? "Save changes" : "Add Note"}
          </button>
        </div>
      </form>
    </Sheet>
  );
}
