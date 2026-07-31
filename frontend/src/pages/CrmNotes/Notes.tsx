import { useMemo, useState } from "react";

import AppBreadcrumb from "../../components/common/AppBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/pagination/Pagination";
import Badge from "../../components/ui/badge/Badge";
import SearchField from "../../components/ui/search/Search";
import Sheet from "../../components/ui/sheet/Sheet";
import { FilterIcon, PlusIcon } from "../../icons";
import LexicalNoteEditor from "../../components/notes/LexicalNoteEditor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type NoteCategory = "Client" | "Follow-up" | "Investment" | "Internal";

type Note = {
  id: number;
  title: string;
  content: string;
  contentHtml?: string;
  category: NoteCategory;
  relatedTo: string;
  author: string;
  authorAvatar: string;
  updatedAt: string;
};

const initialNotes: Note[] = [
  {
    id: 1,
    title: "Portfolio review priorities",
    content:
      "Abram wants the next review to focus on income-generating assets and downside protection.",
    category: "Investment",
    relatedTo: "Abram Schleifer",
    author: "Sarah Lim",
    authorAvatar: "/images/user/user-21.jpg",
    updatedAt: "Today, 9:30 AM",
  },
  {
    id: 2,
    title: "KYC document follow-up",
    content:
      "Requested the updated proof of address and signed beneficial ownership declaration.",
    category: "Follow-up",
    relatedTo: "Anderson Holdings",
    author: "Mark Santos",
    authorAvatar: "/images/user/user-24.jpg",
    updatedAt: "Yesterday, 4:15 PM",
  },
  {
    id: 3,
    title: "Preferred communication schedule",
    content:
      "Charlotte prefers concise email updates on Tuesdays and a monthly review call.",
    category: "Client",
    relatedTo: "Charlotte Anderson",
    author: "Mia Cruz",
    authorAvatar: "/images/user/user-25.jpg",
    updatedAt: "29 Jul 2026",
  },
  {
    id: 4,
    title: "Institutional onboarding notes",
    content:
      "Confirm authorized signatories before sending the final account-opening package.",
    category: "Internal",
    relatedTo: "Northbridge Capital",
    author: "John Reyes",
    authorAvatar: "/images/user/user-22.jpg",
    updatedAt: "27 Jul 2026",
  },
  {
    id: 5,
    title: "Risk profile discussion",
    content:
      "Ethan is comfortable with moderate volatility but wants a clear liquidity allocation.",
    category: "Investment",
    relatedTo: "Ethan Brown",
    author: "Ana Dela Cruz",
    authorAvatar: "/images/user/user-27.jpg",
    updatedAt: "24 Jul 2026",
  },
  {
    id: 6,
    title: "Referral introduction",
    content:
      "Prepare a short company overview before the introduction to Pacific Crest Partners.",
    category: "Follow-up",
    relatedTo: "Lumina Ventures",
    author: "Sarah Lim",
    authorAvatar: "/images/user/user-21.jpg",
    updatedAt: "22 Jul 2026",
  },
  {
    id: 7,
    title: "Quarterly relationship summary",
    content:
      "Engagement remains strong. The client attended two briefings and requested a new proposal.",
    category: "Client",
    relatedTo: "Martinez Family Office",
    author: "Mia Cruz",
    authorAvatar: "/images/user/user-25.jpg",
    updatedAt: "18 Jul 2026",
  },
  {
    id: 8,
    title: "Internal account handoff",
    content:
      "Transfer the latest correspondence and pending tasks to the new relationship owner.",
    category: "Internal",
    relatedTo: "Meridian Securities",
    author: "Mark Santos",
    authorAvatar: "/images/user/user-24.jpg",
    updatedAt: "15 Jul 2026",
  },
];

const categoryColor = {
  Client: "primary",
  "Follow-up": "warning",
  Investment: "success",
  Internal: "light",
} as const;

const NOTES_PER_PAGE = 6;
const noteSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Note content is required"),
  contentHtml: z.string(),
  relatedTo: z.string(),
  category: z.enum(["Client", "Follow-up", "Investment", "Internal"]),
});
type NoteFormValues = z.infer<typeof noteSchema>;

export default function Notes() {
  const [notes, setNotes] = useState(initialNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<NoteCategory | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const noteForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      contentHtml: "",
      relatedTo: "",
      category: "Client",
    },
  });
  const noteTitle = noteForm.watch("title");
  const noteContent = noteForm.watch("content");

  const filteredNotes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return notes.filter((note) => {
      const matchesCategory = category === "All" || note.category === category;
      const matchesSearch =
        !normalizedSearch ||
        [
          note.title,
          note.content,
          note.category,
          note.relatedTo,
          note.author,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [category, notes, searchTerm]);

  const totalPages = Math.max(
    Math.ceil(filteredNotes.length / NOTES_PER_PAGE),
    1,
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * NOTES_PER_PAGE;
  const visibleNotes = filteredNotes.slice(
    startIndex,
    startIndex + NOTES_PER_PAGE,
  );

  const closeAddNote = () => {
    setIsAddNoteOpen(false);
    noteForm.reset();
  };

  const addNote = (values: NoteFormValues) => {
    const nextId = Math.max(0, ...notes.map((note) => note.id)) + 1;
    setNotes((currentNotes) => [
      {
        id: nextId,
        title: values.title,
        content: values.content,
        contentHtml: values.contentHtml,
        category: values.category,
        relatedTo: values.relatedTo.trim() || "General",
        author: "Current User",
        authorAvatar: "/images/user/user-01.jpg",
        updatedAt: "Just now",
      },
      ...currentNotes,
    ]);
    setCurrentPage(1);
    closeAddNote();
  };

  return (
    <>
      <PageMeta
        title="CDEX Notes | Caballes-Go Securities, Inc."
        description="Manage client and relationship notes."
      />
      <AppBreadcrumb pageName="Notes" />

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 p-4 sm:p-5 dark:border-white/[0.05]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <SearchField
              value={searchTerm}
              onValueChange={(value) => {
                setSearchTerm(value);
                setCurrentPage(1);
              }}
              placeholder="Search notes..."
              containerClassName="w-full lg:w-80"
            />

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <FilterIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value as NoteCategory | "All");
                    setCurrentPage(1);
                  }}
                  aria-label="Filter notes by category"
                  className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pr-9 pl-10 text-sm font-medium text-gray-700 shadow-theme-xs outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 sm:w-44 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:focus:border-brand-800"
                >
                  <option value="All">All categories</option>
                  <option value="Client">Client</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Investment">Investment</option>
                  <option value="Internal">Internal</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsAddNoteOpen(true)}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
              >
                <PlusIcon className="size-5" />
                <span className="hidden sm:inline">Add Note</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {visibleNotes.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleNotes.map((note) => (
                <article
                  key={note.id}
                  className="flex min-h-60 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-theme-xs transition hover:border-gray-300 hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Badge
                      variant="light"
                      color={categoryColor[note.category]}
                      size="sm"
                    >
                      {note.category}
                    </Badge>
                    <span className="text-xs whitespace-nowrap text-gray-400 dark:text-gray-500">
                      {note.updatedAt}
                    </span>
                  </div>

                  <h2 className="mt-4 text-base font-semibold text-gray-800 dark:text-white/90">
                    {note.title}
                  </h2>
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

                  <div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-800">
                    <p className="mb-3 truncate text-xs text-gray-500 dark:text-gray-400">
                      Related to{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {note.relatedTo}
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <img
                        src={note.authorAvatar}
                        alt={note.author}
                        className="size-7 rounded-full object-cover"
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
                No notes found
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try another search or category.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center border-t border-gray-100 dark:border-white/[0.05] sm:justify-end">
          <Pagination
            totalPages={totalPages}
            currentPage={safeCurrentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>

      <Sheet
        isOpen={isAddNoteOpen}
        onClose={closeAddNote}
        title="Add Note"
        description="Capture a client, investment, or internal note."
        side="right"
        className="w-full sm:max-w-lg"
      >
        <div className="space-y-5">
          <NoteField label="Title">
            <input
              {...noteForm.register("title")}
              className={inputClassName}
              placeholder="Enter note title"
              autoFocus
            />
          </NoteField>

          <NoteField label="Category">
            <select
              {...noteForm.register("category")}
              className={inputClassName}
            >
              <option value="Client">Client</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Investment">Investment</option>
              <option value="Internal">Internal</option>
            </select>
          </NoteField>

          <NoteField label="Related To">
            <input
              {...noteForm.register("relatedTo")}
              className={inputClassName}
              placeholder="Contact or company"
            />
          </NoteField>

          <NoteField label="Note">
            <LexicalNoteEditor
              onChange={(plainText, html) => {
                noteForm.setValue("content", plainText, {
                  shouldValidate: true,
                });
                noteForm.setValue("contentHtml", html);
              }}
            />
          </NoteField>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
            <button
              type="button"
              onClick={closeAddNote}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!noteTitle.trim() || !noteContent.trim()}
              onClick={noteForm.handleSubmit(addNote)}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Note
            </button>
          </div>
        </div>
      </Sheet>
    </>
  );
}

function NoteField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";
