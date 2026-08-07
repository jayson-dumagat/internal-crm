import { z } from "zod";

const noteFields = {
  title: z.string().trim().min(1).max(255),
  content: z.string().trim().min(1).max(100000),
  contentHtml: z.string().max(200000).optional().nullable(),
  relatedTo: z.string().trim().max(255).optional().nullable(),
  category: z.enum(["Client", "Follow-up", "Investment", "Internal"]),
};

export const createNoteSchema = z.object(noteFields);
export const updateNoteSchema = createNoteSchema.partial();
