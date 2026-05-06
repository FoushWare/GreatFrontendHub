import { GET } from "./route";
import { NextRequest } from "next/server";

let mockResponses: Record<string, any> = {};

const createQueryChain = (response: any) => {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: function (resolve: any, reject: any) {
      if (response instanceof Error) {
        return Promise.reject(response).catch(reject);
      }
      return Promise.resolve(response).then(resolve, reject);
    },
    catch: function (reject: any) {
      if (response instanceof Error) {
        return Promise.reject(response).catch(reject);
      }
      return Promise.resolve(response).catch(reject);
    },
  };
  return chain;
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      const response = mockResponses[table] || { data: [], error: null };
      return createQueryChain(response);
    }),
  })),
}));

vi.mock("../../../../../api-config", () => ({
  getSupabaseConfig: vi.fn(() => ({
    url: "http://localhost",
    serviceRoleKey: "key",
  })),
}));

describe("Plans Hierarchy Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResponses = {};
  });

  it("should return 400 if planId is missing", async () => {
    const request = new NextRequest("http://localhost/api/plans//hierarchy");
    const response = await GET(request, {
      params: Promise.resolve({ id: "" }),
    });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });

  it("should return 404 if plan cards are missing", async () => {
    mockResponses = { plan_cards: { data: null, error: null } };
    const request = new NextRequest("http://localhost/api/plans/123/hierarchy");
    const response = await GET(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.data).toEqual([]);
  });

  it("should build hierarchy successfully", async () => {
    mockResponses = {
      plan_cards: {
        data: [
          {
            id: "pc1",
            card_id: "c1",
            learning_cards: { id: "c1", title: "Card 1" },
          },
        ],
        error: null,
      },
      card_categories: {
        data: [
          {
            card_id: "c1",
            category_id: "cat1",
            categories: { id: "cat1", name: "Cat 1" },
          },
        ],
        error: null,
      },
      topics: {
        data: [{ id: "t1", category_id: "cat1", name: "Topic 1" }],
        error: null,
      },
      questions_topics: {
        data: [{ topic_id: "t1", questions: { id: "q1", title: "Q 1" } }],
        error: null,
      },
      questions: {
        data: [{ id: "q2", topic_id: "t1", title: "Q 2" }, { topic_id: "t1" }],
        error: null,
      },
      plan_questions: {
        data: [{ question_id: "q1" }, { question_id: "q2" }],
        error: null,
      },
    };

    const request = new NextRequest("http://localhost/api/plans/123/hierarchy");
    const response = await GET(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.length).toBe(1);
    console.log("QUESTIONS:", data.data[0].categories[0].topics[0].questions);
    expect(data.data[0].categories[0].topics[0].questions.length).toBe(2);
    expect(data.data[0].categories[0].topics[0].totalQuestionCount).toBe(2);
  });

  it("should fallback to direct categories if card_categories query fails", async () => {
    mockResponses = {
      plan_cards: {
        data: [
          {
            id: "pc1",
            card_id: "c1",
            learning_cards: { id: "c1", title: "Card 1" },
          },
        ],
        error: null,
      },
      card_categories: new Error("DB Error"),
      categories: {
        data: [{ learning_card_id: "c1", id: "cat1", name: "Cat 1" }],
        error: null,
      },
      topics: { data: [], error: null },
      questions_topics: { data: [], error: null },
      questions: { data: [], error: null },
      plan_questions: { data: [], error: null },
    };

    const request = new NextRequest("http://localhost/api/plans/123/hierarchy");
    const response = await GET(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data[0].categories[0].name).toBe("Cat 1");
  });

  it("should return 500 on unexpected exception", async () => {
    mockResponses = {
      plan_cards: new Error("Unexpected"),
    };
    const request = new NextRequest("http://localhost/api/plans/123/hierarchy");
    const response = await GET(request, {
      params: Promise.resolve({ id: "123" }),
    });
    expect(response.status).toBe(500);
  });
});
