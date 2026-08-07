import type { NextFunction, Request, Response } from "express";

import { AppDataSource } from "../../database/data-source";
import { User } from "../users/user.entity";
import { recordActivity } from "../activities/activity.service";
import { Note } from "./note.entity";
import { createNoteSchema, updateNoteSchema } from "./note.schema";

const noteRepository = () => AppDataSource.getRepository(Note);
const userRepository = () => AppDataSource.getRepository(User);

async function getAuthor(req: Request) {
  const sessionUser = req.session.user;
  if (!sessionUser) return null;
  return userRepository().findOne({ where: { entraTenantId: sessionUser.tenantId, entraObjectId: sessionUser.entraObjectId } });
}

export async function listNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }
    const notes = await noteRepository().find({ where: { tenantId }, order: { updatedAt: "DESC" }, take: 500 });
    res.status(200).json({ data: notes.map(toNoteDto) });
  } catch (error) {
    next(error);
  }
}

export async function createNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }
    const parsed = createNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Please check the note fields and try again.", errors: parsed.error.issues });
      return;
    }
    const author = await getAuthor(req);
    const note = noteRepository().create({
      ...parsed.data,
      tenantId: sessionUser.tenantId,
      relatedTo: parsed.data.relatedTo || null,
      contentHtml: parsed.data.contentHtml || null,
      authorId: author?.id ?? null,
      authorName: author?.displayName ?? sessionUser.name,
      authorAvatarUrl: author?.avatarUrl ? `/api/v1/users/${author.entraObjectId}/avatar` : null,
    });
    const saved = await noteRepository().save(note);
    await recordActivity({
      tenantId: sessionUser.tenantId,
      actorId: author?.id,
      actorName: author?.displayName ?? sessionUser.name,
      actorAvatarUrl: author?.avatarUrl ? `/api/v1/users/${author.entraObjectId}/avatar` : null,
      action: "created note",
      target: saved.title,
      category: "Client",
      ipAddress: req.ip,
      details: saved.relatedTo ? `Related to ${saved.relatedTo}.` : null,
    });
    res.status(201).json({ data: toNoteDto(saved) });
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }
    const note = await noteRepository().findOneBy({ id: String(req.params.id), tenantId: sessionUser.tenantId });
    if (!note) {
      res.status(404).json({ success: false, message: "Note not found." });
      return;
    }
    const parsed = updateNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: "Please check the note fields and try again.", errors: parsed.error.issues });
      return;
    }
    Object.assign(note, parsed.data);
    if ("relatedTo" in parsed.data) note.relatedTo = parsed.data.relatedTo || null;
    if ("contentHtml" in parsed.data) note.contentHtml = parsed.data.contentHtml || null;
    const saved = await noteRepository().save(note);
    res.status(200).json({ data: toNoteDto(saved) });
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tenantId = req.session.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: "Authentication is required." });
      return;
    }
    const result = await noteRepository().delete({ id: String(req.params.id), tenantId });
    if (!result.affected) {
      res.status(404).json({ success: false, message: "Note not found." });
      return;
    }
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

function toNoteDto(note: Note) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    contentHtml: note.contentHtml,
    category: note.category,
    relatedTo: note.relatedTo ?? "",
    author: note.authorName.replace(/\s*\(CGSI\)\s*$/i, "").trim(),
    authorAvatar: note.authorAvatarUrl,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}
