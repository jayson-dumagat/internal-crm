import { z } from "zod";

import { emailText, requiredText } from "./common";

export const microsoftSignInSchema = z.object({}).strict();

export const signInSchema = z
  .object({
    email: emailText,
    password: z.string().min(1, "Password is required.").max(128, "Password must be 128 characters or fewer."),
    keepLoggedIn: z.boolean(),
  })
  .strict();

export const signUpSchema = z
  .object({
    firstName: requiredText("First name", 100),
    lastName: requiredText("Last name", 100),
    email: emailText,
    password: z
      .string()
      .min(12, "Password must be at least 12 characters.")
      .max(128, "Password must be 128 characters or fewer.")
      .regex(/[A-Z]/, "Password must contain an uppercase letter.")
      .regex(/[a-z]/, "Password must contain a lowercase letter.")
      .regex(/\d/, "Password must contain a number.")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character."),
    termsAccepted: z.boolean().refine((value) => value, "You must accept the Terms and Conditions."),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    email: emailText,
  })
  .strict();

export const otpSchema = z
  .object({
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code."),
  })
  .strict();

export type MicrosoftSignInValues = z.infer<typeof microsoftSignInSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
