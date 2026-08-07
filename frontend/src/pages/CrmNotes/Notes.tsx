import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import type { NoteRecord } from "../../api/crm";
import { useCreateNote, useDeleteNote, useNotesQuery } from "../../hooks/crm/useCrmDirectory";
import AppBreadcrumb from "../../components/common/AppBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/pagination/Pagination";
import Badge from "../../components/ui/badge/Badge";
import Avatar from "../../components/ui/avatar/Avatar";
import SearchField from "../../components/ui/search/Search";
import Sheet from "../../components/ui/sheet/Sheet";
import { FilterIcon, PlusIcon, TrashBinIcon } from "../../icons";
import LexicalNoteEditor from "../../components/notes/LexicalNoteEditor";
import { formatDisplayDate } from "../../utils/date";

type NoteCategory = NoteRecord["category"];
type NoteFormValues = { title: string; content: string; contentHtml: string; relatedTo: string; category: NoteCategory };
const categoryColor = { Client: "primary", "Follow-up": "warning", Investment: "success", Internal: "light" } as const;
const noteSchema = z.object({ title: z.string().trim().min(1, "Title is required"), content: z.string().trim().min(1, "Note content is required"), contentHtml: z.string(), relatedTo: z.string(), category: z.enum(["Client", "Follow-up", "Investment", "Internal"]) });
const inputClassName = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

export default function Notes() {
  const notesQuery = useNotesQuery();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();
  const notes = notesQuery.data ?? [];
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<NoteCategory | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const noteForm = useForm<NoteFormValues>({ resolver: zodResolver(noteSchema), defaultValues: { title: "", content: "", contentHtml: "", relatedTo: "", category: "Client" } });
  const noteTitle = noteForm.watch("title");
  const noteContent = noteForm.watch("content");
  const filteredNotes = useMemo(() => notes.filter((note) => {
    const term = searchTerm.trim().toLowerCase();
    return (category === "All" || note.category === category) && (!term || [note.title, note.content, note.category, note.relatedTo, note.author].join(" ").toLowerCase().includes(term));
  }), [category, notes, searchTerm]);
  const totalPages = Math.max(Math.ceil(filteredNotes.length / 6), 1);
  const safePage = Math.min(currentPage, totalPages);
  const visibleNotes = filteredNotes.slice((safePage - 1) * 6, safePage * 6);
  const closeAddNote = () => { setIsAddNoteOpen(false); noteForm.reset(); };
  const addNote = async (values: NoteFormValues) => {
    try {
      await createNote.mutateAsync({ title: values.title, content: values.content, contentHtml: values.contentHtml, category: values.category, relatedTo: values.relatedTo.trim() || null });
      toast.success("Note added successfully.");
      setCurrentPage(1);
      closeAddNote();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add note.");
    }
  };
  const removeNote = async (note: NoteRecord) => {
    if (!window.confirm(`Delete ${note.title}?`)) return;
    try { await deleteNote.mutateAsync(note.id); toast.success("Note deleted successfully."); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete note."); }
  };

  return <>
    <PageMeta title="CDEX Notes | Caballes-Go Securities, Inc." description="Manage client and relationship notes." />
    <AppBreadcrumb pageName="Notes" />
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 p-4 sm:p-5 dark:border-white/[0.05]"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><SearchField value={searchTerm} onValueChange={(value) => { setSearchTerm(value); setCurrentPage(1); }} placeholder="Search notes..." containerClassName="w-full lg:w-80" /><div className="flex items-center gap-2 sm:gap-3"><div className="relative min-w-0 flex-1 sm:flex-none"><FilterIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-500" /><select value={category} onChange={(event) => { setCategory(event.target.value as NoteCategory | "All"); setCurrentPage(1); }} className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pr-9 pl-10 text-sm font-medium text-gray-700 shadow-theme-xs sm:w-44 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"><option value="All">All categories</option><option>Client</option><option>Follow-up</option><option>Investment</option><option>Internal</option></select></div><button type="button" onClick={() => setIsAddNoteOpen(true)} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"><PlusIcon className="size-5" /><span className="hidden sm:inline">Add Note</span></button></div></div></div>
      {notesQuery.isLoading && <p className="px-5 py-3 text-sm text-gray-500">Loading notes...</p>}
      {notesQuery.isError && <p className="px-5 py-3 text-sm text-error-500">{notesQuery.error.message}</p>}
      <div className="p-4 sm:p-5">{visibleNotes.length > 0 ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleNotes.map((note) => <article key={note.id} className="flex min-h-60 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-theme-xs transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900"><div className="flex items-start justify-between gap-3"><Badge variant="light" color={categoryColor[note.category]} size="sm">{note.category}</Badge><div className="flex items-center gap-2"><span className="text-xs whitespace-nowrap text-gray-400">{formatDisplayDate(note.updatedAt)}</span><button type="button" onClick={() => removeNote(note)} aria-label={`Delete ${note.title}`} className="text-gray-400 hover:text-error-500"><TrashBinIcon className="size-4" /></button></div></div><h2 className="mt-4 text-base font-semibold text-gray-800 dark:text-white/90">{note.title}</h2>{note.contentHtml ? <div className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: note.contentHtml }} /> : <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">{note.content}</p>}<div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-800"><p className="mb-3 truncate text-xs text-gray-500">Related to <span className="font-medium text-gray-700 dark:text-gray-300">{note.relatedTo || "General"}</span></p><div className="flex items-center gap-2"><Avatar src={note.authorAvatar} alt={note.author} size="xsmall" /><span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">{note.author}</span></div></div></article>)}</div> : <div className="rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center dark:border-gray-800"><p className="text-sm font-medium text-gray-700 dark:text-gray-300">{notesQuery.isLoading ? "Loading notes..." : "No notes found"}</p><p className="mt-1 text-sm text-gray-500">{notesQuery.isLoading ? "" : "Try another search or category."}</p></div>}</div>
      <div className="flex justify-center border-t border-gray-100 dark:border-white/[0.05] sm:justify-end"><Pagination totalPages={totalPages} currentPage={safePage} onPageChange={setCurrentPage} /></div>
    </section>
    <Sheet isOpen={isAddNoteOpen} onClose={closeAddNote} title="Add Note" description="Capture a client, investment, or internal note." side="right" className="w-full sm:max-w-lg"><div className="space-y-5"><Field label="Title"><input {...noteForm.register("title")} className={inputClassName} placeholder="Enter note title" autoFocus /></Field><Field label="Category"><select {...noteForm.register("category")} className={inputClassName}><option>Client</option><option>Follow-up</option><option>Investment</option><option>Internal</option></select></Field><Field label="Related To"><input {...noteForm.register("relatedTo")} className={inputClassName} placeholder="Contact or company" /></Field><Field label="Note"><LexicalNoteEditor onChange={(plainText, html) => { noteForm.setValue("content", plainText, { shouldValidate: true }); noteForm.setValue("contentHtml", html); }} /></Field><div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]"><button type="button" onClick={closeAddNote} className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-400">Cancel</button><button type="button" disabled={createNote.isPending || !noteTitle.trim() || !noteContent.trim()} onClick={noteForm.handleSubmit(addNote)} className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">{createNote.isPending ? "Saving..." : "Add Note"}</button></div></div></Sheet>
  </>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>{children}</label>; }
