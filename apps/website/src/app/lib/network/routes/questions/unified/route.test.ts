import { GET, POST, PUT, DELETE } from "./route";
import { NextRequest } from "next/server";
import {
  questionsGetHandler,
  questionsPostHandler,
  PUT as questionsPutHandler,
  DELETE as questionsDeleteHandler,
} from "@elzatona/utilities";

// Mock the imported library handlers
vi.mock("@elzatona/utilities", () => ({
  questionsGetHandler: vi.fn(),
  questionsPostHandler: vi.fn(),
  PUT: vi.fn(),
  DELETE: vi.fn(),
}));

describe("Unified Questions Route (Root)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delegate GET requests to questionsGetHandler", async () => {
    const request = new NextRequest("http://localhost/api/questions/unified");
    const mockResponse = new Response("GET mock");
    vi.mocked(questionsGetHandler).mockResolvedValueOnce(mockResponse);

    const response = await GET(request);

    expect(questionsGetHandler).toHaveBeenCalledWith(request);
    expect(response).toBe(mockResponse);
  });

  it("should delegate POST requests to questionsPostHandler", async () => {
    const request = new NextRequest("http://localhost/api/questions/unified", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const mockResponse = new Response("POST mock");
    vi.mocked(questionsPostHandler).mockResolvedValueOnce(mockResponse);

    const response = await POST(request);

    expect(questionsPostHandler).toHaveBeenCalledWith(request);
    expect(response).toBe(mockResponse);
  });

  it("should delegate PUT requests to questionsPutHandler", async () => {
    const request = new NextRequest("http://localhost/api/questions/unified", {
      method: "PUT",
      body: JSON.stringify({}),
    });
    const mockResponse = new Response("PUT mock");
    vi.mocked(questionsPutHandler).mockResolvedValueOnce(mockResponse);

    const response = await PUT(request);

    expect(questionsPutHandler).toHaveBeenCalledWith(request);
    expect(response).toBe(mockResponse);
  });

  it("should delegate DELETE requests to questionsDeleteHandler", async () => {
    const request = new NextRequest("http://localhost/api/questions/unified", {
      method: "DELETE",
    });
    const mockResponse = new Response("DELETE mock");
    vi.mocked(questionsDeleteHandler).mockResolvedValueOnce(mockResponse);

    const response = await DELETE(request);

    expect(questionsDeleteHandler).toHaveBeenCalledWith(request);
    expect(response).toBe(mockResponse);
  });

  it("should handle errors in delegated GET handler", async () => {
    const request = new NextRequest("http://localhost/api/questions/unified");
    vi.mocked(questionsGetHandler).mockRejectedValueOnce(
      new Error("GET failed"),
    );

    await expect(GET(request)).rejects.toThrow("GET failed");
  });
});
