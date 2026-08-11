import { z } from "zod";

const phonePattern = /^[+]?\d[\d\s().-]*$/;
const websitePattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

export const requiredText = (label: string, maxLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maxLength, `${label} must be ${maxLength} characters or fewer.`);

export const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength, `Must be ${maxLength} characters or fewer.`).optional();

export const emailText = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(320, "Email must be 320 characters or fewer.")
  .email("Enter a valid email address.");

export const optionalPhone = z
  .string()
  .trim()
  .max(50, "Phone must be 50 characters or fewer.")
  .refine(
    (value) =>
      value === "" ||
      (phonePattern.test(value) && value.replace(/\D/g, "").length >= 7),
    "Enter a valid phone number.",
  )
  .optional();

export const optionalWebsite = z
  .string()
  .trim()
  .max(500, "Website must be 500 characters or fewer.")
  .refine(
    (value) => value === "" || websitePattern.test(value),
    "Enter a valid website address.",
  )
  .optional();

export const optionalDate = z
  .string()
  .refine(
    (value) =>
      value === "" ||
      (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))),
    "Enter a valid date.",
  )
  .optional();

export const optionalDateTimeLocal = z
  .string()
  .refine(
    (value) =>
      value === "" ||
      (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))),
    "Enter a valid date and time.",
  )
  .optional();

export const tagInput = z
  .string()
  .trim()
  .max(500, "Tags must be 500 characters or fewer.")
  .refine(
    (value) =>
      value === "" ||
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .every((tag) => tag.length <= 50),
    "Each tag must be 50 characters or fewer.",
  )
  .optional();

export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid color.");
