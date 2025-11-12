/**
 * @fileoverview Validation Schemas and Utilities
 * Form validation schemas using Zod for type-safe validation of all user inputs.
 * Provides schemas for authentication, sites, users, and API keys.
 *
 * @module lib/validation
 */

import { z } from "zod";

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .min(6, "Password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const initialSetupSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type InitialSetupInput = z.infer<typeof initialSetupSchema>;

// ============================================================================
// SITE SCHEMAS
// ============================================================================

export const siteSchema = z.object({
  name: z
    .string()
    .min(1, "Site name is required")
    .min(3, "Site name must be at least 3 characters")
    .max(255, "Site name must be less than 255 characters"),
  url: z.string().min(1, "URL is required").url("Must be a valid URL"),
  axe_score: z
    .number()
    .min(0, "Axe score must be at least 0")
    .max(100, "Axe score must be at most 100"),
  lighthouse_score: z
    .number()
    .min(0, "Lighthouse score must be at least 0")
    .max(100, "Lighthouse score must be at most 100"),
});

export type SiteInput = z.infer<typeof siteSchema>;

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const userSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(255, "Username must be less than 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "viewer"], {
    errorMap: () => ({ message: "Role must be either admin or viewer" }),
  }),
});

export type UserInput = z.infer<typeof userSchema>;

// ============================================================================
// API KEY SCHEMAS
// ============================================================================

export const apiKeySchema = z.object({
  key_name: z
    .string()
    .min(1, "Key name is required")
    .min(3, "Key name must be at least 3 characters")
    .max(255, "Key name must be less than 255 characters"),
  scopes: z.array(z.string()).min(1, "At least one scope must be selected"),
});

export type ApiKeyInput = z.infer<typeof apiKeySchema>;

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate form data and return errors
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with field errors or null if valid
 */
export function validateForm<T>(
  schema: z.ZodSchema,
  data: unknown
): Record<string, string> | null {
  try {
    schema.parse(data);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return errors;
    }
    return { form: "Validation error" };
  }
}

/**
 * Get first error message from validation result
 * @param errors - Validation errors object
 * @returns First error message or null
 */
export function getFirstError(
  errors: Record<string, string> | null
): string | null {
  if (!errors) return null;
  const firstKey = Object.keys(errors)[0];
  return errors[firstKey] || null;
}
