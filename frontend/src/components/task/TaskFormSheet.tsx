import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { CreateTaskInput, TaskRecord } from "../../api/crm";
import Sheet from "../ui/sheet/Sheet";

const schema = z.object({
  title: z.string().trim().min(1, "Task title is required."),
  description: z.string().optional(),
  type: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["todo", "in-progress", "completed", "cancelled"]),
  startAt: z.string().optional(),
  dueAt: z.string().optional(),
});
type Values = z.infer<typeof schema>;
const inputClassName = "h-10 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const toInputDate = (value: string | null) => value ? value.slice(0, 16) : "";

export default function TaskFormSheet({ isOpen, task, onClose, onSubmit, isPending }: { isOpen: boolean; task: TaskRecord | null; onClose: () => void; onSubmit: (input: CreateTaskInput, task?: TaskRecord) => Promise<void>; isPending: boolean }) {
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: "", description: "", type: "general", priority: "medium", status: "todo", startAt: "", dueAt: "" } });
  useEffect(() => { if (isOpen) form.reset(task ? { title: task.title, description: task.description ?? "", type: task.type, priority: task.priority, status: task.status, startAt: toInputDate(task.startAt), dueAt: toInputDate(task.dueAt) } : undefined); }, [form, isOpen, task]);
  const submit = form.handleSubmit(async (values) => onSubmit({ ...values, description: values.description || null, startAt: values.startAt ? new Date(values.startAt).toISOString() : null, dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : null }, task ?? undefined));
  return <Sheet isOpen={isOpen} onClose={onClose} title={task ? "Edit Task" : "Add Task"} description="Plan follow-ups and relationship work." side="right" className="w-full sm:max-w-lg"><form onSubmit={submit} className="space-y-5"><Field label="Title" error={form.formState.errors.title?.message}><input {...form.register("title")} className={inputClassName} placeholder="Follow up with client" autoFocus /></Field><Field label="Description"><textarea {...form.register("description")} rows={3} className={`${inputClassName} h-auto py-2`} placeholder="Add context for the task" /></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Type"><select {...form.register("type")} className={inputClassName}><option value="general">General</option><option value="call">Call</option><option value="email">Email</option><option value="meeting">Meeting</option><option value="follow_up">Follow-up</option><option value="document">Document</option><option value="review">Review</option></select></Field><Field label="Priority"><select {...form.register("priority")} className={inputClassName}><option>low</option><option>medium</option><option>high</option><option>urgent</option></select></Field></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Start"><input type="datetime-local" {...form.register("startAt")} className={inputClassName} /></Field><Field label="Due"><input type="datetime-local" {...form.register("dueAt")} className={inputClassName} /></Field></div><Field label="Status"><select {...form.register("status")} className={inputClassName}><option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></Field><div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]"><button type="button" onClick={onClose} className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-400">Cancel</button><button type="submit" disabled={isPending} className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">{isPending ? "Saving..." : task ? "Save Changes" : "Add Task"}</button></div></form></Sheet>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>{children}{error && <span className="mt-1 block text-xs text-error-500">{error}</span>}</label>; }
