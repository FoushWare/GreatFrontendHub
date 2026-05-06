// Utils library exports
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const generateId = (): string => {
  // Use cryptographic randomness instead of Math.random() for secure ID generation
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .substring(0, 11);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Normalizes code line breaks to \n
 */
export function normalizeCodeLineBreaks(code: string): string {
  if (!code) return "";
  return code.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

/**
 * Strips unsafe control characters from a string
 */
export function stripUnsafeControlCharacters(value: string): string {
  if (!value) return "";
  let sanitized = "";
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    // Allow standard printable ASCII (32-126) and exclude control characters
    if (
      (codePoint >= 32 && codePoint <= 126) ||
      codePoint === 10 || // \n
      codePoint === 13 || // \r
      codePoint === 9 // \t
    ) {
      sanitized += character;
    }
  }
  return sanitized;
}

/**
 * Gets a descriptive error message from an unknown error
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage = "An unknown error occurred",
): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return fallbackMessage;
}
