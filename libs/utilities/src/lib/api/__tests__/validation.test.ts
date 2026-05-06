import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  questionSchema,
  validateAndSanitize,
} from "../validation";

describe("validation", () => {
  describe("emailSchema", () => {
    it("should validate correct emails", () => {
      expect(emailSchema.parse("test@example.com")).toBe("test@example.com");
    });

    it("should lowercase emails", () => {
      expect(emailSchema.parse("TEST@EXAMPLE.COM")).toBe("test@example.com");
    });

    it("should throw for invalid emails", () => {
      expect(() => emailSchema.parse("invalid-email")).toThrow();
    });
  });

  describe("passwordSchema", () => {
    it("should validate strong passwords", () => {
      expect(passwordSchema.parse("StrongPass123")).toBe("StrongPass123");
    });

    it("should throw for short passwords", () => {
      expect(() => passwordSchema.parse("Short1")).toThrow();
    });
  });

  describe("questionSchema", () => {
    it("should validate correct question objects", () => {
      const question = {
        title: "Test Question",
        content: "Test Content",
        type: "mcq",
        difficulty: "beginner",
        points: 5,
      };
      const result = questionSchema.parse(question);
      expect(result.title).toBe("Test Question");
    });
  });

  describe("validateAndSanitize", () => {
    it("should return success for valid data", () => {
      const schema = z.object({ name: z.string() });
      const result = validateAndSanitize(schema, { name: "Test" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Test");
      }
    });

    it("should return error for invalid data", () => {
      const schema = z.object({ name: z.string() });
      const result = validateAndSanitize(schema, { name: 123 });
      expect(result.success).toBe(false);
    });
  });
});
