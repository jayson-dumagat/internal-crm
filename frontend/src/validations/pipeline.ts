import { z } from "zod";

import { emailText, optionalPhone, optionalText, requiredText } from "./common";

export const pipelineNameSchema = z
  .object({
    name: requiredText("Pipeline name", 100),
  })
  .strict();

export const pipelineStageSchema = z
  .object({
    name: requiredText("Stage name", 100),
    color: z.enum(["default", "brand", "info", "warning", "success", "error"]),
  })
  .strict();

export const pipelineCardSchema = z
  .object({
    name: requiredText("Name", 255),
    role: optionalText(200),
    company: optionalText(255),
    email: emailText.optional().or(z.literal("")),
    phone: optionalPhone,
  })
  .strict();

export type PipelineNameValues = z.infer<typeof pipelineNameSchema>;
export type PipelineStageValues = z.infer<typeof pipelineStageSchema>;
export type PipelineCardValues = z.infer<typeof pipelineCardSchema>;
