import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../hooks/useToast";

import type { NoteRecord } from "../api/crm";
import { noteFormSchema, type NoteFormValues } from "../validations/crm";
import {
  useCompaniesQuery,
  useContactsQuery,
  useCreateNote,
  useDeleteNote,
  useLeadsQuery,
  useNotesQuery,
  useUpdateNote,
} from "../hooks/crm/useCrmDirectory";
import AppBreadcrumb from "../components/common/AppBreadcrumb";
import PageMeta from "../components/common/PageMeta";
import Pagination from "../components/pagination/Pagination";
import { useCan } from "../hooks/auth/useCan";
import { useSearch } from "../hooks/useSearch";
import NoteGrid from "../components/notes/NoteGrid";
import NotesToolbar from "../components/notes/NotesToolbar";
import type { NoteRelatedOption } from "../components/notes/NoteCard";
import NoteEditorSheet from "../components/notes/NoteEditorSheet";

type NoteCategory = NoteRecord["category"];
const emptyValues: NoteFormValues = {
  title: "",
  content: "",
  contentHtml: "",
  relatedTo: "",
  category: "Client",
};

export default function Notes() {
  const toast = useToast();
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
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <NotesToolbar
          category={category}
          canCreate={canCreate}
          onCategoryChange={(value) => {
            setCategory(value);
            setCurrentPage(1);
          }}
          onAdd={openNewNote}
        />
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
          <NoteGrid
            notes={visibleNotes}
            relatedOptions={relatedOptions as NoteRelatedOption[]}
            canDelete={canDelete}
            isLoading={notesQuery.isLoading}
            onOpen={openNote}
            onDelete={(note) => void removeNote(note)}
          />
        </div>
        <div className="flex justify-center border-t border-gray-100 px-4 sm:justify-end dark:border-white/[0.05]">
          <Pagination
            totalPages={totalPages}
            currentPage={safePage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <NoteEditorSheet
        isOpen={isEditorOpen}
        selectedNote={selectedNote}
        relatedOptions={relatedOptions as NoteRelatedOption[]}
        form={noteForm}
        canCreate={canCreate}
        canUpdate={canUpdate}
        isPending={createNote.isPending || updateNote.isPending}
        onClose={closeEditor}
        onSubmit={saveNote}
      />
    </>
  );
}
