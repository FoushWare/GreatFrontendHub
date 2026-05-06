/**
 * Input Validation Schemas using Zod
 * Validates and sanitizes user inputs before processing
 */

import { z } from "zod";
import { sanitizeInputServer } from "./sanitize-server";

/**
 * Common validation schemas
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .transform((val) => sanitizeInputServer(val.toLowerCase().trim()));

// Password validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number",
  );

// Name validation
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .transform((val) => sanitizeInputServer(val));

// Title validation
export const titleSchema = z
  .string()
  .min(1, "Title is required")
  .max(500, "Title must be less than 500 characters")
  .transform((val) => sanitizeInputServer(val));

// Description/Content validation
export const contentSchema = z
  .string()
  .min(1, "Content is required")
  .max(10000, "Content must be less than 10000 characters")
  .transform((val) => sanitizeInputServer(val));

// URL validation
export const urlSchema = z
  .string()
  .url("Invalid URL")
  .transform((val) => sanitizeInputServer(val));

// ID validation (UUID or string ID)
export const idSchema = z
  .string()
  .min(1, "ID is required")
  .max(100, "ID must be less than 100 characters")
  .transform((val) => sanitizeInputServer(val));

// Helper for code field transformation
const transformCodeField = (val: any) => {
  return val === undefined ? null : val;
};

// Helper for difficulty field transformation
const transformDifficultyField = (val: any) => {
  if (val && (val as string) === "difficult") {
    return "advanced";
  }
  return val;
};

// Helper for explanation field transformation
const transformExplanationField = (val: any) => {
  if (!val || val === null || val === "") return undefined;
  return sanitizeInputServer(val);
};

// Helper for options field transformation
const transformOptionsField = (val: any) => {
  if (!val || !Array.isArray(val) || val.length === 0) {
    return undefined;
  }
  try {
    return val.filter(
      (item) => item && typeof item === "object" && item.id && item.text,
    );
  } catch (e) {
    console.warn("Error filtering options array:", e);
    return undefined;
  }
};

// Question validation schema
export const questionSchema = z
  .object({
    title: titleSchema,
    content: contentSchema,
    code: z
      .union([
        z.string().max(50000, "Code must be less than 50000 characters"),
        z.null(),
        z.undefined(),
        z.literal(""),
      ])
      .optional()
      .nullable()
      .transform(transformCodeField),
    type: z
      .union([
        z.enum(["multiple-choice", "true-false", "code", "mcq"]),
        z.undefined(),
      ])
      .optional()
      .default("multiple-choice"),
    category: z.string().min(1).optional(),
    category_id: z
      .union([z.string().uuid(), z.literal(""), z.undefined(), z.null()])
      .optional(),
    topic: z.string().optional(),
    topic_id: z
      .union([z.string().uuid(), z.literal(""), z.undefined(), z.null()])
      .optional(),
    difficulty: z
      .enum(["beginner", "intermediate", "advanced"])
      .optional()
      .transform(transformDifficultyField),
    explanation: z
      .string()
      .max(5000, "Explanation must be less than 5000 characters")
      .optional()
      .nullable()
      .transform(transformExplanationField),
    points: z.number().int().min(1).max(100).optional().default(1),
    is_active: z.boolean().optional().default(true),
    isActive: z.boolean().optional().default(true),
    timeLimit: z.number().int().min(0).max(3600).optional(),
    time_limit: z.number().int().min(0).max(3600).optional(),
    learningCardId: z
      .union([
        z.string().uuid(),
        z.string().min(1),
        z.literal(""),
        z.undefined(),
        z.null(),
      ])
      .optional(),
    learning_card_id: z
      .union([
        z.string().uuid(),
        z.string().min(1),
        z.literal(""),
        z.undefined(),
        z.null(),
      ])
      .optional(),
    tags: z.array(z.string()).optional(),
    hints: z.array(z.string()).optional(),
    metadata: z.any().optional().nullable(),
    options: z
      .union([
        z.array(
          z.object({
            id: z.string(),
            text: z
              .string()
              .min(1, "Option text is required")
              .transform((val) => sanitizeInputServer(val)),
            isCorrect: z.boolean(),
            explanation: z
              .string()
              .optional()
              .transform((val) => (val ? sanitizeInputServer(val) : undefined)),
          }),
        ),
        z.string().transform(() => undefined),
        z.undefined(),
        z.null(),
      ])
      .optional()
      .transform(transformOptionsField),
  })
  .catchall(z.any());
// Note: category_id and topic_id are optional in the database schema (nullable)
// No refinement needed - both can be null/undefined

// User registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  role: z.enum(["user", "admin"]).default("user"),
});

// User login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Category schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .transform((val) => sanitizeInputServer(val)),
  description: z
    .string()
    .max(1000)
    .optional()
    .transform((val) => (val ? sanitizeInputServer(val) : undefined)),
  slug: z
    .string()
    .max(100)
    .optional()
    .transform((val) => (val ? sanitizeInputServer(val) : undefined)),
});

// Topic schema
export const topicSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .transform((val) => sanitizeInputServer(val)),
  description: z
    .string()
    .max(1000)
    .optional()
    .transform((val) => (val ? sanitizeInputServer(val) : undefined)),
  slug: z
    .string()
    .max(100)
    .optional()
    .transform((val) => (val ? sanitizeInputServer(val) : undefined)),
  categoryId: idSchema,
});

// Learning card schema
export const learningCardSchema = z.object({
  title: titleSchema,
  description: z
    .string()
    .max(1000)
    .optional()
    .transform((val) => (val ? sanitizeInputServer(val) : undefined)),
  type: z
    .string()
    .max(50)
    .transform((val) => sanitizeInputServer(val)),
});

// Plan schema
export const planSchema = z.object({
  name: titleSchema,
  description: z
    .string()
    .max(2000)
    .transform((val) => sanitizeInputServer(val)),
  type: z
    .string()
    .max(50)
    .transform((val) => sanitizeInputServer(val)),
});

/**
 * Helper function to validate and sanitize options field
 */
function validateOptionsField(dataObj: any): void {
  if (dataObj.options !== undefined && dataObj.options !== null) {
    if (
      typeof dataObj.options === "string" ||
      !Array.isArray(dataObj.options) ||
      dataObj.options.length === 0
    ) {
      delete dataObj.options;
    }
  }
}

/**
 * Helper function to convert array field to single string value
 */
function convertArrayFieldToString(
  dataObj: any,
  arrayField: string,
  stringField: string,
): void {
  if (dataObj[arrayField] && Array.isArray(dataObj[arrayField])) {
    if (dataObj[arrayField].length > 0 && dataObj[arrayField][0]) {
      dataObj[stringField] =
        dataObj[arrayField][0]?.name ||
        dataObj[arrayField][0]?.title ||
        dataObj[stringField] ||
        "";
    }
    delete dataObj[arrayField];
  }
}

/**
 * Helper function to validate metadata field
 */
function validateMetadataField(dataObj: any): void {
  if (dataObj.metadata !== undefined && dataObj.metadata !== null) {
    if (
      typeof dataObj.metadata !== "object" ||
      Array.isArray(dataObj.metadata)
    ) {
      delete dataObj.metadata;
    }
  }
}

/**
 * Helper function to preprocess data structure
 */
function _preprocessData(data: unknown): unknown {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const dataObj = data as any;

    validateOptionsField(dataObj);
    convertArrayFieldToString(dataObj, "categories", "category");
    convertArrayFieldToString(dataObj, "topics", "topic");
    validateMetadataField(dataObj);
  }
  return data;
}

/**
 * Helper function to handle validation errors and format them for return
 * Extracts complex error handling logic from validateAndSanitize to reduce complexity
 */
function _handleValidationError(
  error: any,
  data: unknown,
): { success: false; error: string } {
  _logValidationErrorContext(error, data);

  if (error instanceof z.ZodError) {
    return _formatZodError(error);
  }

  return {
    success: false,
    error: getErrorMessage(error, "Validation failed: Internal error"),
  };
}

/**
 * Logs context for validation errors to assist debugging.
 */
function _logValidationErrorContext(error: any, data: unknown): void {
  console.error(
    "🔴 Validation catch block - Error type:",
    error?.constructor?.name,
  );
  console.error("🔴 Validation catch block - Error message:", error?.message);
  console.error(
    "🔴 Input data being validated:",
    JSON.stringify(data, null, 2),
  );
}

/**
 * Formats a Zod issue path into a string.
 */
function _getIssuePath(issue: z.ZodIssue): string {
  return issue?.path && issue.path.length > 0 ? issue.path.join(".") : "root";
}

/**
 * Logs multiple validation issues for debugging purposes.
 */
function _logMultipleIssues(issues: z.ZodIssue[]): void {
  if (issues.length <= 1) return;

  console.warn(
    `⚠️ Multiple validation errors for question:`,
    issues.map((e: z.ZodIssue) => ({
      path: _getIssuePath(e),
      message: e.message,
      code: e.code,
    })),
  );
}

/**
 * Formats a ZodError into a user-friendly error message.
 */
function _formatZodError(error: z.ZodError): { success: false; error: string } {
  const issues = error.issues || [];
  if (issues.length === 0) {
    return { success: false, error: "Validation failed: Unknown details" };
  }

  const firstIssue = issues[0];
  const errorPath = _getIssuePath(firstIssue);
  const errorMessage = firstIssue?.message || "Validation failed";

  _logMultipleIssues(issues);

  return {
    success: false,
    error: `${errorMessage} (field: ${errorPath})`,
  };
}

/**
 * Validates and sanitizes data using a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate and sanitize
 * @returns Validated and sanitized data
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  try {
    // Validate schema is a valid Zod schema
    if (!schema || typeof schema !== "object" || !("_def" in schema)) {
      console.error("❌ Invalid schema provided to validateAndSanitize");
      return { success: false, error: "Validation error: Invalid schema" };
    }

    // Pre-validate data structure to prevent "Cannot read properties of undefined" errors
    const processedData = _preprocessData(data);

    const result = schema.parse(processedData);
    return { success: true, data: result };
  } catch (error: unknown) {
    return _handleValidationError(error, data);
  }
}
