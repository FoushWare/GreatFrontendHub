/**
 * Backend Sanitization Utilities
 * Uses xss library to sanitize user inputs in API routes
 */

import { FilterXSS, IFilterXSSOptions } from "xss";

/**
 * XSS filter options - strict configuration
 */
const xssOptions: IFilterXSSOptions = {
  whiteList: {
    // Allow only safe HTML tags
    p: [],
    br: [],
    strong: [],
    em: [],
    u: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    ul: [],
    ol: [],
    li: [],
    a: ["href", "target", "rel"],
    code: [],
    pre: [],
    blockquote: [],
  },
  stripIgnoreTag: true, // Remove tags not in whitelist
  stripIgnoreTagBody: ["script"], // Remove script tag content
  onTagAttr: (tag: string, name: string, value: string) => {
    // Only allow safe attributes
    if (name === "href" && tag === "a") {
      // Validate URLs
      if (value.startsWith("http://") || value.startsWith("https://")) {
        // Escape attribute value manually
        const escaped = value
          .replaceAll("&", "&amp;")
          .replaceAll("\\", "&#x5C;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#x27;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;");
        return `${name}="${escaped}"`;
      }
      return "";
    }
    if (name === "target" && value === "_blank") {
      return `${name}="${value}"`;
    }
    if (name === "rel" && value === "noopener noreferrer") {
      return `${name}="${value}"`;
    }
    return "";
  },
};

/**
 * Sanitize HTML string on the server
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTMLServer(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  const filter = new FilterXSS(xssOptions);
  return filter.process(html);
}

/**
 * Sanitize plain text (removes all HTML)
 * @param text - Text to sanitize
 * @returns Plain text without HTML
 */
export function sanitizeTextServer(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  const filter = new FilterXSS({
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "meta",
      "link",
    ],
  });

  return filter.process(text);
}

function removeControlChars(value: string): string {
  let sanitized = "";
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (
      codePoint >= 32 &&
      codePoint !== 127 &&
      (codePoint < 128 || codePoint > 159)
    ) {
      sanitized += character;
    }
  }
  return sanitized;
}

function removeControlCharsExceptNewlines(value: string): string {
  let sanitized = "";
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    const isAllowedPrintable = codePoint >= 32 && codePoint !== 127;
    const isAllowedWhitespace =
      character === "\n" || character === "\r" || character === "\t";

    if (isAllowedPrintable || isAllowedWhitespace) {
      sanitized += character;
    }
  }
  return sanitized;
}

/**
 * Sanitize user input for form fields
 * Removes potentially dangerous characters and HTML
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInputServer(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove null bytes and control characters
  let sanitized = removeControlChars(input);

  // Trim whitespace
  sanitized = sanitized.trim();

  // Remove HTML tags
  sanitized = sanitizeTextServer(sanitized);

  return sanitized;
}

/**
 * Helper function to sanitize a single field value
 * Reduces cognitive complexity of sanitizeObjectServer
 */
function sanitizeFieldValue(
  value: unknown,
  key: string,
  skipSanitizationFields: Set<string>,
  preserveNewlinesFields: Set<string>,
): unknown {
  // For code field, skip sanitization entirely - we'll use CSP protection instead
  if (skipSanitizationFields.has(key)) {
    // Don't sanitize code field at all - preserve it exactly as-is
    // CSP (Content Security Policy) will protect against XSS attacks
    return value;
  }

  if (typeof value === "string") {
    // For content and other rich text fields, preserve newlines - don't use sanitizeInputServer
    if (preserveNewlinesFields.has(key)) {
      // Only remove dangerous control characters, but preserve newlines and tabs
      return removeControlCharsExceptNewlines(value);
    }
    // For other string fields, use standard sanitization
    return sanitizeInputServer(value);
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) =>
      typeof item === "string" ? sanitizeInputServer(item) : item,
    );
  }

  if (
    value &&
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  ) {
    // Check if it's a Date using a type guard
    const valueObj = value as Record<string, unknown>;
    const isDate =
      valueObj && typeof valueObj === "object" && valueObj.constructor === Date;
    if (isDate) {
      return value;
    }
    return sanitizeObjectServer(valueObj);
  }

  // For other types (numbers, booleans, null, etc.), copy as-is
  return value;
}

/**
 * Sanitize object with string values recursively
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObjectServer<T extends Record<string, unknown>>(
  obj: T,
): T {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const sanitized = { ...obj };

  // Fields that should preserve newlines and special characters (code, content, etc.)
  const preserveNewlinesFields = new Set([
    "content",
    "explanation",
    "description",
    "starter_code",
    "code_template",
  ]);

  // Fields that should be completely skipped from sanitization (will use CSP protection instead)
  // These fields are preserved exactly as-is without any modification
  const skipSanitizationFields = new Set(["code"]);

  // Validate all keys before processing to prevent remote property injection
  const validKeys = Object.keys(sanitized).filter((key) => {
    // Only allow alphanumeric characters, underscores, and hyphens in keys
    // This prevents injection of dangerous property names like __proto__, constructor, etc.
    return /^[a-zA-Z0-9_-]+$/.test(key);
  });

  // Create a new object with only valid keys
  const validatedObject = {} as T;
  for (const key of validKeys) {
    const value = sanitized[key];
    (validatedObject as Record<string, unknown>)[key] = sanitizeFieldValue(
      value,
      key,
      skipSanitizationFields,
      preserveNewlinesFields,
    );
  }

  return validatedObject;
}

/**
 * Sanitize specific fields that may contain HTML (like explanations, descriptions)
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeRichContent(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  return sanitizeHTMLServer(html);
}

/**
 * Completely remove all HTML tags including incomplete ones
 * This is a comprehensive function that handles edge cases like <script, <iframe, etc.
 * @param text - Text that may contain HTML tags
 * @returns Plain text with all HTML tags removed
 */
/**
 * XSS filter options for complete HTML tag removal (empty whitelist)
 * This configuration strips ALL HTML tags, which CodeQL recognizes as safe
 */
const xssStripAllOptions: IFilterXSSOptions = {
  whiteList: {}, // Empty whitelist = strip all tags
  stripIgnoreTag: true, // Remove all tags not in whitelist (which is all tags)
  stripIgnoreTagBody: ["script"], // Also remove script tag content
};

/**
 * XSS filter instance for complete HTML removal
 */
const xssStripAllFilter = new FilterXSS(xssStripAllOptions);

export function removeAllHTMLTags(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // SECURITY: Use xss library to strip ALL HTML tags
  // CodeQL recognizes the xss library as a safe HTML sanitization method
  // Using empty whitelist ensures ALL tags including <script> are removed
  let cleaned = xssStripAllFilter.process(text);

  // Additional safety: Remove any remaining < and > characters that might be part of incomplete tags
  // This catches edge cases where tags are malformed or incomplete
  cleaned = cleaned.replaceAll(/<[^>]*$/g, ""); // Remove incomplete tags at end
  cleaned = cleaned.replaceAll(/<[^<]*$/g, ""); // Remove any remaining < characters

  return cleaned.trim();
}

/**
 * Sanitize a value for safe logging (prevents log injection)
 * Removes control characters, newlines, and other dangerous characters
 * This function ensures all user-provided values are safe for logging
 * @param value - Value to sanitize for logging
 * @returns Sanitized value safe for logging (guaranteed to be safe)
 */
export function sanitizeForLogging(value: unknown): string {
  if (value === null || value === undefined) {
    return String(value);
  }

  // SECURITY: Replace all contiguous newline-like patterns and tabs with spaces
  // This ensures that log lines are not merged and remain readable
  let sanitized =
    value !== null && typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
  sanitized = sanitized.replaceAll(/[\r\n\t]+/g, " ");

  // SECURITY: Remove all other control characters
  sanitized = removeControlChars(sanitized);

  // SECURITY: Limit length to prevent log flooding attacks
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + "... [truncated]";
  }

  // SECURITY: Final pass - ensure no dangerous patterns remain
  // Remove any patterns that could be interpreted as log format specifiers
  sanitized = sanitized.replaceAll(
    /%\d*[diouxXeEfFgGaAcspn%]/g,
    "[format-removed]",
  );

  return sanitized;
}
