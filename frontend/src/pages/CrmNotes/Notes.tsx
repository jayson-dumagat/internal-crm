import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDebounce } from "../../hooks/useDebounce";

import type { NoteRecord } from "../../api/crm";
import { noteFormSchema, type NoteFormValues } from "../../validations/crm";
import {
  useCompaniesQuery,
  useContactsQuery,
  useCreateNote,
  useDeleteNote,
  useLeadsQuery,
  useNotesQuery,
  useUpdateNote,
} from "../../hooks/crm/useCrmDirectory";
import AppBreadcrumb from "../../components/common/AppBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/pagination/Pagination";
import Badge from "../../components/ui/badge/Badge";
import Avatar from "../../components/ui/avatar/Avatar";
import Sheet from "../../components/ui/sheet/Sheet";
import { FilterIcon, PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import LexicalNoteEditor from "../../components/notes/LexicalNoteEditor";
import { formatDisplayDate } from "../../utils/date";
import { useCan } from "../../hooks/auth/useCan";
import { Card } from "../../components/ui/card";
import { useSearch } from "../../hooks/useSearch";
import SearchField from "../../components/search/SearchField";

type NoteCategory = NoteRecord["category"];
const categoryColor = {
  Client: "primary",
  "Follow-up": "warning",
  Investment: "success",
  Internal: "light",
} as const;
const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";
const emptyValues: NoteFormValues = {
  title: "",
  content: "",
  contentHtml: "",
  relatedTo: "",
  category: "Client",
};

export default function Notes() {
  const notesQuery = useNotesQuery();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { search } = useSearch();
  
  const canCreate = useCan("notes.create");
  const canUpdate = useCan("notes.update");
  const canDelete = useCan("notes.delete");
  const notes = notesQuery.data ?? [];
  const contactsQuery = useContactsQuery();
  const companiesQuery = useCompaniesQuery();
  const leadsQuery = useLeadsQuery();
  const debouncedSearch = useDebounce(search, 300);
  const relatedOptions = useMemo(
    () => [
      ...(leadsQuery.data ?? []).map((lead) => ({
        value: lead.name,
        label: `Lead · ${lead.name}`,
        avatar: lead.avatar,
      })),
      ...(contactsQuery.data ?? []).map((contact) => ({
        value: contact.user.name,
        label: `Contact · ${contact.user.name}`,
        avatar: contact.user.image,
      })),
      ...(companiesQuery.data ?? []).map((company) => ({
        value: company.name,
        label: `Company · ${company.name}`,
        avatar: company.logoUrl ?? null,
      })),
    ],
    [companiesQuery.data, contactsQuery.data, leadsQuery.data],
  );
  const [category, setCategory] = useState<NoteCategory | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNote, setSelectedNote] = useState<NoteRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const noteForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: emptyValues,
  });
  const noteTitle = noteForm.watch("title");
  const noteContent = noteForm.watch("content");

  const filteredNotes = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return notes.filter(
      (note) =>
        (category === "All" || note.category === category) &&
        (!term ||
          [note.title, note.content, note.category, note.relatedTo, note.author]
            .join(" ")
            .toLowerCase()
            .includes(term)),
    );
  }, [category, notes, debouncedSearch]);
  const totalPages = Math.max(Math.ceil(filteredNotes.length / 6), 1);
  const safePage = Math.min(currentPage, totalPages);
  const visibleNotes = filteredNotes.slice((safePage - 1) * 6, safePage * 6);

  const openNewNote = () => {
    if (!canCreate) return;
    setSelectedNote(null);
    noteForm.reset(emptyValues);
    setIsEditorOpen(true);
  };
  const openNote = (note: NoteRecord) => {
    setSelectedNote(note);
    noteForm.reset({
      title: note.title,
      content: note.content,
      contentHtml: note.contentHtml ?? "",
      relatedTo: note.relatedTo ?? "",
      category: note.category,
    });
    setIsEditorOpen(true);
  };
  const closeEditor = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    noteForm.reset(emptyValues);
  };
  const saveNote = async (values: NoteFormValues) => {
    if (selectedNote && !canUpdate) return;
    if (!selectedNote && !canCreate) return;
    const input = {
      title: values.title.trim(),
      content: values.content.trim(),
      contentHtml: values.contentHtml || null,
      category: values.category,
      relatedTo: values.relatedTo?.trim() || null,
    };
    try {
      if (selectedNote) {
        await updateNote.mutateAsync({ id: selectedNote.id, input });
        toast.success("Note updated successfully.");
      } else {
        await createNote.mutateAsync(input);
        toast.success("Note added successfully.");
        setCurrentPage(1);
      }
      closeEditor();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save note.",
      );
    }
  };
  const removeNote = async (note: NoteRecord) => {
    if (!canDelete || !window.confirm(`Delete ${note.title}?`)) return;
    try {
      await deleteNote.mutateAsync(note.id);
      toast.success("Note deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete note.",
      );
    }
  };

  return (
    <>
      <PageMeta
        title="CDEX Notes | Caballes-Go Securities, Inc."
        description="Manage client and relationship notes."
      />
      <AppBreadcrumb pageName="Notes" />
      <Card>
        <div className="border-b border-gray-100 px-4 py-2.5 sm:px-5 dark:border-white/[0.05]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <SearchField />
            <div className="flex shrink-0 items-center justify-end gap-2 [&_svg]:size-4">
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <FilterIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />
                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value as NoteCategory | "All");
                    setCurrentPage(1);
                  }}
                  className="h-9 w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pr-9 pl-9 text-sm font-medium text-gray-700 shadow-theme-xs sm:w-44 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                >
                  <option value="All">All categories</option>
                  <option>Client</option>
                  <option>Follow-up</option>
                  <option>Investment</option>
                  <option>Internal</option>
                </select>
              </div>
              <button
                type="button"
                disabled={!canCreate}
                title={canCreate ? "Add Note" : "Read-only access"}
                onClick={openNewNote}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <PlusIcon className="size-4" />
                <span className="hidden sm:inline">Add Note</span>
              </button>
            </div>
          </div>
        </div>
        {notesQuery.isLoading && (
          <p className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-white/[0.05]">
            Loading notes...
          </p>
        )}
        {notesQuery.isError && (
          <p className="border-b border-gray-100 px-4 py-3 text-sm text-error-500 dark:border-white/[0.05]">
            {notesQuery.error.message}
          </p>
        )}
        <div className="p-4 sm:p-5">
          {visibleNotes.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleNotes.map((note) => (
                <article
                  key={note.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openNote(note)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openNote(note);
                    }
                  }}
                  className="group flex min-h-48 cursor-pointer flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-theme-xs transition hover:border-gray-200 hover:shadow-theme-sm focus:ring-2 focus:ring-brand-500/20 focus:outline-none dark:border-white/[0.05] dark:bg-gray-900 dark:hover:border-white/[0.08]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Badge
                      variant="light"
                      color={categoryColor[note.category]}
                      size="sm"
                    >
                      {note.category}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs whitespace-nowrap text-gray-400">
                        {formatDisplayDate(note.updatedAt)}
                      </span>
                      <button
                        type="button"
                        disabled={!canDelete}
                        title={
                          canDelete
                            ? `Delete ${note.title}`
                            : "Read-only access"
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          void removeNote(note);
                        }}
                        aria-label={`Delete ${note.title}`}
                        className="inline-flex size-7 items-center justify-center rounded-lg text-gray-400 hover:bg-error-50 hover:text-error-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-error-500/10"
                      >
                        <TrashBinIcon className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar
                        src={
                          relatedOptions.find(
                            (item) => item.value === note.relatedTo,
                          )?.avatar ?? null
                        }
                        alt={note.relatedTo || "General"}
                        size="xsmall"
                        colorKey={note.relatedTo || note.id}
                      />
                      <h2 className="line-clamp-2 text-base font-semibold text-gray-800 dark:text-white/90">
                        {note.title}
                      </h2>
                    </div>
                    <PencilIcon className="mt-0.5 size-4 shrink-0 text-gray-300 opacity-0 transition group-hover:opacity-100 dark:text-gray-600" />
                  </div>
                  {note.contentHtml ? (
                    <div
                      className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400"
                      dangerouslySetInnerHTML={{ __html: note.contentHtml }}
                    />
                  ) : (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {note.content}
                    </p>
                  )}
                  <div className="mt-auto border-t border-gray-100 pt-3 dark:border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={note.authorAvatar}
                        alt={note.author}
                        size="xsmall"
                      />
                      <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                        {note.author}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center dark:border-gray-800">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {notesQuery.isLoading ? "Loading notes..." : "No notes found"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {notesQuery.isLoading ? "" : "Try another search or category."}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-center border-t border-gray-100 px-4 sm:justify-end dark:border-white/[0.05]">
          <Pagination
            totalPages={totalPages}
            currentPage={safePage}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>
      <Sheet
        isOpen={isEditorOpen}
        onClose={closeEditor}
        title={
          selectedNote ? (canUpdate ? "Edit Note" : "View Note") : "Add Note"
        }
        description="Capture a client, investment, or internal note."
        side="right"
        className="w-full sm:max-w-2xl xl:max-w-3xl"
      >
        <form
          className="space-y-5"
          onSubmit={noteForm.handleSubmit(saveNote)}
          noValidate
        >
          <Field label="Title" error={noteForm.formState.errors.title?.message}>
            <input
              disabled={Boolean(selectedNote) && !canUpdate}
              {...noteForm.register("title")}
              maxLength={255}
              className={inputClassName}
              placeholder="Enter note title"
              autoFocus
            />
          </Field>
          <Field
            label="Category"
            error={noteForm.formState.errors.category?.message}
          >
            <select
              disabled={Boolean(selectedNote) && !canUpdate}
              {...noteForm.register("category")}
              className={inputClassName}
            >
              <option>Client</option>
              <option>Follow-up</option>
              <option>Investment</option>
              <option>Internal</option>
            </select>
          </Field>
          <Field
            label="Related to"
            error={noteForm.formState.errors.relatedTo?.message}
          >
            <select
              disabled={Boolean(selectedNote) && !canUpdate}
              {...noteForm.register("relatedTo")}
              className={inputClassName}
            >
              <option value="">General</option>
              {relatedOptions.map((item) => (
                <option key={`${item.label}-${item.value}`} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Note"
            error={noteForm.formState.errors.content?.message}
          >
            <LexicalNoteEditor
              key={selectedNote?.id ?? "new"}
              readOnly={Boolean(selectedNote) && !canUpdate}
              initialContentHtml={selectedNote?.contentHtml}
              onChange={(plainText, html) => {
                noteForm.setValue("content", plainText, {
                  shouldValidate: true,
                });
                noteForm.setValue("contentHtml", html);
              }}
            />
          </Field>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
            <button
              type="button"
              onClick={closeEditor}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-400"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={
                createNote.isPending ||
                updateNote.isPending ||
                !noteTitle.trim() ||
                !noteContent.trim() ||
                (selectedNote ? !canUpdate : !canCreate)
              }
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createNote.isPending || updateNote.isPending
                ? "Saving..."
                : selectedNote
                  ? "Save changes"
                  : "Add Note"}
            </button>
          </div>
        </form>
      </Sheet>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-error-500">{error}</span>
      )}
    </label>
  );
}
