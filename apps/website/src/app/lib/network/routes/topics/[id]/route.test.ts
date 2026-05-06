import { GET, PUT, DELETE } from "./route";
import { NextRequest } from "next/server";
import { getSupabaseClient } from "../../../../get-supabase-client";

// Mock Supabase
vi.mock("../../../../get-supabase-client", () => ({
  getSupabaseClient: vi.fn(),
}));

describe("Topics Route By Id", () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabase as any);
  });

  describe("GET", () => {
    it("should return 400 if id is missing", async () => {
      const request = new NextRequest("http://localhost/api/topics/");
      const response = await GET(request, {
        params: Promise.resolve({ id: "" }),
      });
      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe("Topic ID is required");
    });

    it("should return 404 if topic not found", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST116" },
      });
      const request = new NextRequest("http://localhost/api/topics/123");
      const response = await GET(request, {
        params: Promise.resolve({ id: "123" }),
      });
      const data = await response.json();
      expect(response.status).toBe(404);
      expect(data.error).toBe("Topic not found");
    });

    it("should return 500 on db error", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "DB Error" },
      });
      const request = new NextRequest("http://localhost/api/topics/123");
      const response = await GET(request, {
        params: Promise.resolve({ id: "123" }),
      });
      expect(response.status).toBe(500);
    });

    it("should return topic successfully", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "123", name: "Topic" },
        error: null,
      });
      const request = new NextRequest("http://localhost/api/topics/123");
      const response = await GET(request, {
        params: Promise.resolve({ id: "123" }),
      });
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.data.name).toBe("Topic");
    });

    it("should return 500 on unexpected exception", async () => {
      mockSupabase.single.mockRejectedValueOnce(new Error("Unexpected"));
      const request = new NextRequest("http://localhost/api/topics/123");
      const response = await GET(request, {
        params: Promise.resolve({ id: "123" }),
      });
      expect(response.status).toBe(500);
    });
  });

  describe("PUT", () => {
    it("should return 400 if name is missing", async () => {
      const request = new NextRequest("http://localhost/api/topics/123", {
        method: "PUT",
        body: JSON.stringify({}),
      });
      const response = await PUT(request, {
        params: Promise.resolve({ id: "123" }),
      });
      expect(response.status).toBe(400);
    });

    it("should update topic successfully", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "123", name: "New" },
        error: null,
      });
      const request = new NextRequest("http://localhost/api/topics/123", {
        method: "PUT",
        body: JSON.stringify({
          name: "New",
          categoryId: "cat1",
          order: 1,
          isActive: false,
        }),
      });
      const response = await PUT(request, {
        params: Promise.resolve({ id: "123" }),
      });
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.data.name).toBe("New");
    });

    it("should return 500 on db error", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "DB Error" },
      });
      const request = new NextRequest("http://localhost/api/topics/123", {
        method: "PUT",
        body: JSON.stringify({ name: "New" }),
      });
      const response = await PUT(request, {
        params: Promise.resolve({ id: "123" }),
      });
      expect(response.status).toBe(500);
    });

    it("should return 500 on unexpected exception", async () => {
      mockSupabase.single.mockRejectedValueOnce(new Error("Unexpected"));
      const request = new NextRequest("http://localhost/api/topics/123", {
        method: "PUT",
        body: JSON.stringify({ name: "New" }),
      });
      const response = await PUT(request, {
        params: Promise.resolve({ id: "123" }),
      });
      expect(response.status).toBe(500);
    });
  });

  describe("DELETE", () => {
    it("should return 400 if id is missing", async () => {
      const request = new NextRequest("http://localhost/api/topics/", {
        method: "DELETE",
      });
      const response = await DELETE(request, {
        params: Promise.resolve({ id: "" }),
      });
      expect(response.status).toBe(400);
    });

    it("should delete successfully", async () => {
      mockSupabase.eq.mockResolvedValueOnce({ error: null });
      const request = new NextRequest("http://localhost/api/topics/123", {
        method: "DELETE",
      });
      const response = await DELETE(request, {
        params: Promise.resolve({ id: "123" }),
      });
      expect(response.status).toBe(200);
    });

    it("should return 500 on error", async () => {
      mockSupabase.eq.mockResolvedValueOnce({ error: { message: "DB Error" } });
      const request = new NextRequest("http://localhost/api/topics/123", {
        method: "DELETE",
      });
      const response = await DELETE(request, {
        params: Promise.resolve({ id: "123" }),
      });
      expect(response.status).toBe(500);
    });
  });
});
