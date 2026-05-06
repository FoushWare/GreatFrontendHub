import { describe, it, expect } from "vitest";
import {
  sanitizeHTMLServer,
  sanitizeTextServer,
  sanitizeInputServer,
  sanitizeObjectServer,
  sanitizeRichContent,
  removeAllHTMLTags,
  sanitizeForLogging,
} from "./sanitize-server";

describe("Sanitize Server Utilities", () => {
  describe("sanitizeHTMLServer", () => {
    it("should allow safe HTML tags", () => {
      const input = "<p>Hello <strong>World</strong></p>";
      expect(sanitizeHTMLServer(input)).toBe(input);
    });

    it("should strip unsafe tags like script", () => {
      const input = '<p>Hello <script>alert("xss")</script></p>';
      expect(sanitizeHTMLServer(input)).toBe("<p>Hello </p>");
    });

    it("should sanitize a tags with safe href", () => {
      const input = '<a href="https://example.com" target="_blank">Link</a>';
      expect(sanitizeHTMLServer(input)).toBe(
        '<a href="https://example.com" target="_blank">Link</a>',
      );
    });

    it("should strip unsafe href protocols", () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      expect(sanitizeHTMLServer(input)).toBe("<a>Link</a>");
    });
  });

  describe("sanitizeTextServer", () => {
    it("should remove all HTML tags", () => {
      const input = "<div>Hello <p>World</p></div>";
      expect(sanitizeTextServer(input)).toBe("Hello World");
    });
  });

  describe("sanitizeInputServer", () => {
    it("should remove control characters and HTML", () => {
      const input = "Hello \x00 <script></script> \x07 World";
      // xss strips script tags and leaves space. Normalize spaces for test.
      const result = sanitizeInputServer(input).replace(/\s+/g, " ");
      expect(result).toBe("Hello World");
    });

    it("should trim whitespace", () => {
      const input = "  Hello World  ";
      expect(sanitizeInputServer(input)).toBe("Hello World");
    });
  });

  describe("sanitizeObjectServer", () => {
    it("should sanitize strings in an object", () => {
      const input = {
        name: "  <b>John</b>  ",
        bio: "Standard text",
      };
      const result = sanitizeObjectServer(input);
      expect(result.name).toBe("John");
      expect(result.bio).toBe("Standard text");
    });

    it("should skip sanitization for 'code' field", () => {
      const input = {
        code: "const x = <script>alert(1)</script>;",
      };
      const result = sanitizeObjectServer(input);
      expect(result.code).toBe(input.code);
    });

    it("should preserve newlines for 'content' and 'explanation'", () => {
      const input = {
        content: "Line 1\nLine 2",
        explanation: "Line A\r\nLine B",
      };
      const result = sanitizeObjectServer(input);
      expect(result.content).toBe("Line 1\nLine 2");
      expect(result.explanation).toBe("Line A\r\nLine B");
    });

    it("should sanitize arrays recursively", () => {
      const input = {
        tags: ["<b>tag1</b>", "tag2"],
      };
      const result = sanitizeObjectServer(input);
      expect(result.tags).toEqual(["tag1", "tag2"]);
    });

    it("should prevent prototype pollution via keys", () => {
      const input = {
        __proto__: { polluted: true },
        name: "John",
      };
      const result = sanitizeObjectServer(input);
      expect(result.hasOwnProperty("__proto__")).toBe(false);
      expect(result.name).toBe("John");
    });
  });

  describe("removeAllHTMLTags", () => {
    it("should completely remove all tags even if malformed", () => {
      const input =
        "Hello <script src='...'> alert(1) </script> World <img src='x' onerror='...'>";
      const result = removeAllHTMLTags(input).replace(/\s+/g, " ");
      expect(result).not.toContain("<script");
      expect(result).not.toContain("<img");
      expect(result).toBe("Hello World");
    });
  });

  describe("sanitizeForLogging", () => {
    it("should remove newlines and tabs", () => {
      const input = "Log line 1\nLog line 2\tTabbed";
      expect(sanitizeForLogging(input)).toBe("Log line 1 Log line 2 Tabbed");
    });

    it("should truncate long strings", () => {
      const input = "a".repeat(300);
      const result = sanitizeForLogging(input);
      expect(result.length).toBeLessThan(300);
      expect(result).toContain("[truncated]");
    });

    it("should remove log format specifiers", () => {
      const input = "User name: %s, ID: %d";
      expect(sanitizeForLogging(input)).toBe(
        "User name: [format-removed], ID: [format-removed]",
      );
    });
  });
});
