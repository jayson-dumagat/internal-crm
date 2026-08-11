import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import Sheet from "../ui/sheet/Sheet";

import type {
  PipelineStage,
  StageColor,
} from "./types";
import { pipelineStageSchema, type PipelineStageValues } from "../../validations/pipeline";

interface StageSheetProps {
  isOpen: boolean;
  stage: PipelineStage | null;
  stageCount: number;
  onClose: () => void;
  onSave: (stage: PipelineStage) => void;
  onDelete: (stageId: string) => void;
  onMoveLeft: (stageId: string) => void;
  onMoveRight: (stageId: string) => void;
}

const colorOptions: Array<{
  value: StageColor;
  label: string;
}> = [
  {
    value: "default",
    label: "Default",
  },
  {
    value: "brand",
    label: "Brand",
  },
  {
    value: "info",
    label: "Info",
  },
  {
    value: "warning",
    label: "Warning",
  },
  {
    value: "success",
    label: "Success",
  },
  {
    value: "error",
    label: "Error",
  },
];

export default function StageSheet({
  isOpen,
  stage,
  stageCount,
  onClose,
  onSave,
  onDelete,
  onMoveLeft,
  onMoveRight,
}: StageSheetProps) {
  const form = useForm<PipelineStageValues>({
    resolver: zodResolver(pipelineStageSchema),
    defaultValues: { name: "", color: "default" },
  });
  const name = form.watch("name");

  useEffect(() => {
    form.reset({ name: stage?.name ?? "", color: stage?.color ?? "default" });
  }, [form, stage]);

  const handleSave = form.handleSubmit((values) => {
    if (!stage) return;

    onSave({
      ...stage,
      name: values.name.trim(),
      color: values.color,
    });

    onClose();
  });

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Pipeline Stage"
      description="Update the stage name, color, and order."
      side="right"
      className="w-full sm:max-w-lg"
    >
      {stage && (
        <form onSubmit={handleSave} noValidate className="space-y-5">
          <FormField label="Stage Name">
            <input
              {...form.register("name")}
              maxLength={100}
              className={inputClassName}
              placeholder="Enter stage name"
            />
            {form.formState.errors.name?.message && <p className="mt-1 text-xs text-error-500">{form.formState.errors.name.message}</p>}
          </FormField>

          <FormField label="Stage Color">
            <select
              {...form.register("color")}
              className={inputClassName}
            >
              {colorOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <div className="border-t border-gray-100 pt-5 dark:border-white/[0.05]">
            <p className="mb-3 text-sm font-medium text-gray-800 dark:text-white/90">
              Stage Order
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={stage.order === 0}
                onClick={() => onMoveLeft(stage.id)}
                className={secondaryButtonClassName}
              >
                Move Left
              </button>

              <button
                type="button"
                disabled={
                  stage.order === stageCount - 1
                }
                onClick={() => onMoveRight(stage.id)}
                className={secondaryButtonClassName}
              >
                Move Right
              </button>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={stageCount <= 1}
              onClick={() => {
                onDelete(stage.id);
                onClose();
              }}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-error-300 bg-white px-4 text-sm font-medium text-error-600 shadow-theme-xs transition hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-error-500/30 dark:bg-gray-900 dark:text-error-400 dark:hover:bg-error-500/10"
            >
              Delete Stage
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className={secondaryButtonClassName}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!name.trim()}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Stage
              </button>
            </div>
          </div>
        </form>
      )}
    </Sheet>
  );
}

export function AddStageSheet({
  isOpen,
  onClose,
  onSave,
  nextOrder,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stage: PipelineStage) => void;
  nextOrder: number;
}) {
  const form = useForm<PipelineStageValues>({
    resolver: zodResolver(pipelineStageSchema),
    defaultValues: { name: "", color: "default" },
  });
  const name = form.watch("name");

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: "", color: "default" });
    }
  }, [form, isOpen]);

  const handleSave = form.handleSubmit((values) => {

    onSave({
      id: createId("stage"),
      name: values.name.trim(),
      color: values.color,
      order: nextOrder,
    });

    onClose();
  });

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add Pipeline Stage"
      description="Create another stage for the active pipeline."
      side="right"
      className="w-full sm:max-w-lg"
    >
      <form onSubmit={handleSave} noValidate className="space-y-5">
        <FormField label="Stage Name">
          <input
            {...form.register("name")}
            maxLength={100}
            className={inputClassName}
            placeholder="Enter stage name"
          />
          {form.formState.errors.name?.message && <p className="mt-1 text-xs text-error-500">{form.formState.errors.name.message}</p>}
        </FormField>

        <FormField label="Stage Color">
          <select
            {...form.register("color")}
            className={inputClassName}
          >
            {colorOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-white/[0.05]">
          <button
            type="button"
            onClick={onClose}
            className={secondaryButtonClassName}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!name.trim()}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Stage
          </button>
        </div>
      </form>
    </Sheet>
  );
}

function FormField({
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

const secondaryButtonClassName =
  "inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
