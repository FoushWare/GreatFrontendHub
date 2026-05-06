import { GET, POST, DELETE } from "../route";
import { NextRequest } from "next/server";
import {
  getSupabaseClient,
  getSupabaseClientWithAnonKey,
} from "../../../../../get-supabase-client";

// Mock the modules used in the route
jest.mock("../../../../../get-supabase-client", () => ({
  getSupabaseClient: jest.fn(),
  getSupabaseClientWithAnonKey: jest.fn(),
}));

jest.mock("../../../../../auto-linking-service", () => ({
  AutoLinkingService: jest.fn().mockImplementation(() => ({
    getSectionsForPlan: jest.fn().mockResolvedValue(["Section 1", "Section 2"]),
  })),
}));

jest.mock("@elzatona/utilities", () => ({
  studyPlans: [{ id: "h1", title: "Hardcoded Plan 1" }],
}));

describe("Guided Learning Plans API Route", () => {
  const createMockRequest = (url: string, method = "GET", body?: any) => {
    return new NextRequest(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
    // Allow it to be used in promise chains
    then: undefined,
    catch: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
    (getSupabaseClientWithAnonKey as jest.Mock).mockReturnValue(mockSupabase);

    // Default success for common chain
    mockSupabase.order.mockResolvedValue({ data: [], error: null });
    mockSupabase.single.mockResolvedValue({ data: {}, error: null });
    mockSupabase.eq.mockResolvedValue({ data: {}, error: null });
  });

  describe("GET", () => {
    it("returns hardcoded plans successfully", async () => {
      const req = createMockRequest(
        "http://localhost/api/guided-learning/plans",
      );
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toContainEqual({ id: "h1", title: "Hardcoded Plan 1" });
    });

    it("returns sections when getSections query param is true", async () => {
      const req = createMockRequest(
        "http://localhost/api/guided-learning/plans?getSections=true",
      );
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual(["Section 1", "Section 2"]);
    });

    it("merges hardcoded plans with DB plans", async () => {
      mockSupabase.order.mockResolvedValue({
        data: [{ id: "db1", title: "DB Plan 1" }],
        error: null,
      });

      const req = createMockRequest(
        "http://localhost/api/guided-learning/plans",
      );
      const response = await GET(req);
      const json = await response.json();

      expect(json.data.length).toBe(2);
    });

    it("falls back to hardcoded plans if DB fetch fails", async () => {
      mockSupabase.order.mockRejectedValue(new Error("DB Error"));

      const req = createMockRequest(
        "http://localhost/api/guided-learning/plans",
      );
      const response = await GET(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.length).toBe(1);
    });
  });

  describe("POST", () => {
    it("creates a new plan successfully", async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: "new-id", name: "New Plan" },
        error: null,
      });

      const req = createMockRequest(
        "http://localhost/api/guided-learning/plans",
        "POST",
        {
          name: "New Plan",
          duration: 10,
        },
      );
      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.plan.id).toBe("new-id");
    });

    it("returns 400 if required fields are missing", async () => {
      const req = createMockRequest(
        "http://localhost/api/guided-learning/plans",
        "POST",
        {
          name: "Incomplete",
        },
      );
      const response = await POST(req);
      expect(response.status).toBe(400);
    });
  });

  describe("DELETE", () => {
    it("deletes a plan successfully", async () => {
      const req = createMockRequest(
        "http://localhost/api/guided-learning/plans?id=delete-me",
        "DELETE",
      );
      const response = await DELETE(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it("returns 400 if no ID is provided", async () => {
      const req = createMockRequest(
        "http://localhost/api/guided-learning/plans",
        "DELETE",
      );
      const response = await DELETE(req);
      expect(response.status).toBe(400);
    });
  });
});
