import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import {
  questionsGetHandler,
  questionsPostHandler,
  PUT as questionsPutHandler,
  DELETE as questionsDeleteHandler,
} from "./questions-handler";

import { getSupabaseClient } from "../../index";

const mockSupabaseInstance = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

// Mock dependencies
vi.mock("../../index", () => ({
  getSupabaseClient: vi.fn(() => mockSupabaseInstance),
  validateAndSanitize: vi.fn((schema, data) => ({ success: true, data })),
  sanitizeObjectServer: vi.fn((data) => data),
  sanitizeRichContent: vi.fn((data) => data),
  getErrorMessage: vi.fn((err) => err?.message || "Error"),
  normalizeCodeLineBreaks: vi.fn((code) => code),
}));

vi.mock("./validation", () => ({
  questionSchema: {},
}));

describe("questions-handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all methods on the singleton mock instance
    Object.values(mockSupabaseInstance).forEach((m: any) => {
      if (typeof m.mockReset === "function") m.mockReset();
    });

    // Default: all methods return this for chaining
    mockSupabaseInstance.from.mockReturnThis();
    mockSupabaseInstance.select.mockReturnThis();
    mockSupabaseInstance.eq.mockReturnThis();
    mockSupabaseInstance.ilike.mockReturnThis();
    mockSupabaseInstance.range.mockReturnThis();
    mockSupabaseInstance.order.mockReturnThis();
    mockSupabaseInstance.limit.mockReturnThis();
    mockSupabaseInstance.single.mockReturnThis();
    mockSupabaseInstance.maybeSingle.mockReturnThis();
    mockSupabaseInstance.insert.mockReturnThis();
    mockSupabaseInstance.update.mockReturnThis();
    mockSupabaseInstance.delete.mockReturnThis();
  });

  describe("questionsGetHandler", () => {
    it("should fetch questions with pagination", async () => {
      const req = new NextRequest(
        "http://localhost/api/questions?page=1&pageSize=10",
      );

      // Final call in GET is .order()
      mockSupabaseInstance.order.mockResolvedValue({
        data: [{ id: "1", title: "Test Q" }],
        count: 1,
        error: null,
      });

      const response = await questionsGetHandler(req);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.pagination.page).toBe(1);
    });
  });

  describe("questionsPostHandler", () => {
    it("should create questions", async () => {
      const req = new NextRequest("http://localhost/api/questions", {
        method: "POST",
        body: JSON.stringify({
          questions: [{ title: "New Q", content: "Content" }],
        }),
      });

      // maybeSingle is used for duplicate check
      mockSupabaseInstance.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });
      // single is the final call for insert
      mockSupabaseInstance.single.mockResolvedValue({
        data: { id: "new-id" },
        error: null,
      });

      const response = await questionsPostHandler(req);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.success).toBe(1);
    });
  });

  describe("questionsPutHandler", () => {
    it("should update an existing question", async () => {
      const req = new NextRequest("http://localhost/api/questions", {
        method: "PUT",
        body: JSON.stringify({
          id: "123",
          title: "Updated Title",
        }),
      });

      // final call for update is eq()
      mockSupabaseInstance.eq.mockResolvedValue({ error: null });

      const response = await questionsPutHandler(req);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(mockSupabaseInstance.update).toHaveBeenCalled();
    });
  });

  describe("questionsDeleteHandler", () => {
    it("should delete a question", async () => {
      const req = new NextRequest("http://localhost/api/questions?id=123", {
        method: "DELETE",
      });

      // final call for delete is eq()
      mockSupabaseInstance.eq.mockResolvedValue({ error: null });

      const response = await questionsDeleteHandler(req);
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(mockSupabaseInstance.delete).toHaveBeenCalled();
    });
  });
});
