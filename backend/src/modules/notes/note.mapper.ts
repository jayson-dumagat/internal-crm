import type { Request } from "express";

import { canViewField } from "../access/access-control";
import { normalizeUserName } from "../../shared/utils/names";
import { Note } from "./note.entity";
import { maskSensitive } from "../../shared/utils/privacy";

export function toNoteDto(note: Note, req?: Request) {
  const canSee = (field: string) => !req || canViewField(req, field);
  const dto = {
    id: note.id,
    title: note.title,
    content: canSee("notes.content") ? note.content : maskSensitive(note.content),
    contentHtml: canSee("notes.content") ? note.contentHtml : null,
    category: note.category,
    relatedTo: canSee("notes.relatedTo") ? note.relatedTo ?? "" : maskSensitive(note.relatedTo),
    author: canSee("notes.author") ? normalizeUserName(note.authorName) : maskSensitive(note.authorName),
    authorAvatar: canSee("notes.author") ? note.authorAvatarUrl : null,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };

  if (!canSee("notes.title")) dto.title = maskSensitive(note.title);
  if (!canSee("notes.category")) dto.category = "Restricted";

  return dto;
}
