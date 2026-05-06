import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateAndSanitize, questionSchema } from "./validation";
import { sanitizeInputServer } from "./sanitize-server";

describe("Validation Utilities", () => {
  describe("validateAndSanitize", () => {
    const schema = z.object({
      name: z.string().transform((val) => sanitizeInputServer(val)),
      age: z.number(),
      bio: z.string().optional(),
    });

    it("should validate and sanitize valid data", () => {
      const input = {
        name: "  <b>John</b>  ",
        age: 30,
        bio: "Standard bio",
      };

      const result = validateAndSanitize(schema, input);

      if (!result.success) {
        console.error("Validation failed unexpectedly:", result.error);
      }

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John");
        expect(result.data.age).toBe(30);
      }
    });

    it("should return error for invalid data", () => {
      const input = {
        name: 123, // Should be string
        age: "thirty", // Should be number
      };

      // @ts-ignore - intentional invalid input
      const result = validateAndSanitize(schema, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should handle partial objects and optional fields", () => {
      const input = {
        name: "John",
        age: 30,
      };

      const result = validateAndSanitize(schema, input);
      expect(result.success).toBe(true);
    });
  });

  describe("questionSchema", () => {
    it("should validate a correct multiple-choice question", async () => {
      const question = {
        title: "Test Question",
        content: "What is the capital of France?",
        type: "multiple-choice",
        category: "Test Category",
        topic: "Test Topic",
        options: [
          { id: "1", text: "Paris", isCorrect: true },
          { id: "2", text: "London", isCorrect: false },
        ],
        difficulty: "beginner",
      };

      const result = await questionSchema.safeParseAsync(question);
      if (!result.success) {
        console.error(
          "questionSchema validation failed:",
          result.error.format(),
        );
      }
      expect(result.success).toBe(true);
    });

    it("should validate a correct coding question", async () => {
      const question = {
        title: "Code Question",
        content: "Implement a binary search.",
        type: "code",
        category: "Programming",
        topic: "Algorithms",
        prompt: "Write a function",
        initialCode: "function() {}",
        solution: "function() { return true; }",
        difficulty: "intermediate",
      };

      const result = await questionSchema.safeParseAsync(question);
      expect(result.success).toBe(true);
    });
  });
});
