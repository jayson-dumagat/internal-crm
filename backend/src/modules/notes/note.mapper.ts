import type { Request } from "express";

import { canViewField } from "../access/access-control";
import { normalizeUserName } from "../../shared/utils/names";
import { Note } from "./note.entity";

export function toNoteDto(note: Note, req?: Request) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: note.id,
    title: note.title,
    content: canSee("notes.content") ? note.content : "Restricted",
    contentHtml: canSee("notes.content") ? note.contentHtml : null,
    category: note.category,
    relatedTo: canSee("notes.relatedTo") ? note.relatedTo ?? "" : "Restricted",
    author: canSee("notes.author") ? normalizeUserName(note.authorName) : "Restricted",
    authorAvatar: canSee("notes.author") ? note.authorAvatarUrl : null,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };

  if (!canSee("notes.title")) dto.title = "Restricted";
  if (!canSee("notes.category")) dto.category = "Restricted";

  return dto;
}
