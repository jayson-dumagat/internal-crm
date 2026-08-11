import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import Sheet from "../ui/sheet/Sheet";

import type { PipelineView } from "./types";
import { pipelineNameSchema, type PipelineNameValues } from "../../validations/pipeline";

interface ViewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (view: PipelineView) => void;
}

export default function ViewSheet({
  isOpen,
  onClose,
  onCreate,
}: ViewSheetProps) {
  const form = useForm<PipelineNameValues>({
    resolver: zodResolver(pipelineNameSchema),
    defaultValues: { name: "" },
  });
  const name = form.watch("name");

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: "" });
    }
  }, [form, isOpen]);

  const handleCreate = form.handleSubmit((values) => {
    const trimmedName = values.name.trim();

    const viewId = createId("pipeline");
    const stageId = createId("stage");

    onCreate({
      id: viewId,
      name: trimmedName,
      stages: [
        {
          id: stageId,
          name: "New",
          color: "info",
          order: 0,
        },
      ],
    });

    onClose();
  });

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Create Pipeline View"
      description="Create a separate pipeline with its own stages."
      side="right"
      className="w-full sm:max-w-lg"
    >
      <form onSubmit={handleCreate} noValidate className="space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pipeline Name
          </span>

          <input
            {...form.register("name")}
            maxLength={100}
            placeholder="Example: PERA, KYC or Institutional"
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          {form.formState.errors.name?.message && <p className="mt-1 text-xs text-error-500">{form.formState.errors.name.message}</p>}
        </label>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!name.trim()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create View
          </button>
        </div>
      </form>
    </Sheet>
  );
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
