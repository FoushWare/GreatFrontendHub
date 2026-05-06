import { GET, PUT, DELETE } from "./route";
import { NextRequest } from "next/server";
import {
  questionsGetByIdHandler,
  PUT as questionsPutHandler,
  DELETE as questionsDeleteHandler,
} from "@elzatona/utilities";

// Mock the imported library handlers
vi.mock("@elzatona/utilities", () => ({
  questionsGetByIdHandler: vi.fn(),
  PUT: vi.fn(),
  DELETE: vi.fn(),
}));

describe("Unified Questions Route (ById)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delegate GET requests to questionsGetByIdHandler", async () => {
    const request = new NextRequest(
      "http://localhost/api/questions/unified/123",
    );
    const mockParams = Promise.resolve({ id: "123" });
    const mockResponse = new Response("GET mock");
    vi.mocked(questionsGetByIdHandler).mockResolvedValueOnce(mockResponse);

    const response = await GET(request, { params: mockParams });

    expect(questionsGetByIdHandler).toHaveBeenCalledWith(request, {
      params: mockParams,
    });
    expect(response).toBe(mockResponse);
  });

  it("should delegate PUT requests to questionsPutHandler", async () => {
    const request = new NextRequest(
      "http://localhost/api/questions/unified/123",
      {
        method: "PUT",
        body: JSON.stringify({}),
      },
    );
    const mockParams = Promise.resolve({ id: "123" });
    const mockResponse = new Response("PUT mock");
    vi.mocked(questionsPutHandler).mockResolvedValueOnce(mockResponse);

    const response = await PUT(request, { params: mockParams });

    expect(questionsPutHandler).toHaveBeenCalledWith(request);
    expect(response).toBe(mockResponse);
  });

  it("should delegate DELETE requests to questionsDeleteHandler", async () => {
    const request = new NextRequest(
      "http://localhost/api/questions/unified/123",
      {
        method: "DELETE",
      },
    );
    const mockParams = Promise.resolve({ id: "123" });
    const mockResponse = new Response("DELETE mock");
    vi.mocked(questionsDeleteHandler).mockResolvedValueOnce(mockResponse);

    const response = await DELETE(request, { params: mockParams });

    expect(questionsDeleteHandler).toHaveBeenCalledWith(request);
    expect(response).toBe(mockResponse);
  });
});
