import { SupabaseLearningCardsService } from "./supabase-learning-cards-service";
import { supabaseClient } from "./supabase";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

vi.mock("./supabase", () => ({
  supabaseClient: {
    getLearningCards: vi.fn(),
    createLearningCard: vi.fn(),
    updateLearningCard: vi.fn(),
    deleteLearningCard: vi.fn(),
  },
}));

describe("SupabaseLearningCardsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllCards", () => {
    it("should fetch and transform learning cards", async () => {
      const mockCards = [
        {
          id: "1",
          title: "Test Card",
          type: "concept",
          description: "Test Desc",
          color: "#fff",
          icon: "icon",
          order_index: 1,
          isActive: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      vi.mocked(supabaseClient.getLearningCards).mockResolvedValue({
        data: mockCards,
        error: null,
      } as any);

      const result = await SupabaseLearningCardsService.getAllCards();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
      expect(result[0].title).toBe("Test Card");
      expect(result[0].type).toBe("concept");
    });

    it("should throw error if fetch fails", async () => {
      vi.mocked(supabaseClient.getLearningCards).mockResolvedValue({
        data: null,
        error: { message: "Fetch error" },
      } as any);

      await expect(SupabaseLearningCardsService.getAllCards()).rejects.toThrow(
        "Fetch error",
      );
    });
  });

  describe("getCardById", () => {
    it("should return null if card not found", async () => {
      vi.mocked(supabaseClient.getLearningCards).mockResolvedValue({
        data: [{ id: "2" }],
        error: null,
      } as any);

      const result = await SupabaseLearningCardsService.getCardById("1");
      expect(result).toBeNull();
    });

    it("should return card if found", async () => {
      const mockCards = [
        {
          id: "1",
          title: "Test Card",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      vi.mocked(supabaseClient.getLearningCards).mockResolvedValue({
        data: mockCards,
        error: null,
      } as any);

      const result = await SupabaseLearningCardsService.getCardById("1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("1");
    });

    it("should throw error if fetch fails", async () => {
      vi.mocked(supabaseClient.getLearningCards).mockResolvedValue({
        data: null,
        error: { message: "Fetch error" },
      } as any);

      await expect(
        SupabaseLearningCardsService.getCardById("1"),
      ).rejects.toThrow("Fetch error");
    });
  });

  describe("createCard", () => {
    it("should create a card and return its id", async () => {
      vi.mocked(supabaseClient.createLearningCard).mockResolvedValue({
        data: { id: "new-id" },
        error: null,
      } as any);

      const result = await SupabaseLearningCardsService.createCard({
        title: "New",
        type: "concept" as any,
        description: "Desc",
      });

      expect(result).toBe("new-id");
    });

    it("should throw error if create fails", async () => {
      vi.mocked(supabaseClient.createLearningCard).mockResolvedValue({
        data: null,
        error: { message: "Create error" },
      } as any);

      await expect(
        SupabaseLearningCardsService.createCard({
          title: "New",
          type: "concept" as any,
          description: "",
        }),
      ).rejects.toThrow("Create error");
    });
  });

  describe("updateCard", () => {
    it("should update a card", async () => {
      vi.mocked(supabaseClient.updateLearningCard).mockResolvedValue({
        data: null,
        error: null,
      } as any);

      await expect(
        SupabaseLearningCardsService.updateCard("1", {
          title: "Updated",
          type: "concept" as any,
          description: "Desc",
          color: "#000",
          icon: "icon",
          order: 2,
          is_active: true,
        }),
      ).resolves.not.toThrow();
    });

    it("should throw error if update fails", async () => {
      vi.mocked(supabaseClient.updateLearningCard).mockResolvedValue({
        data: null,
        error: { message: "Update error" },
      } as any);

      await expect(
        SupabaseLearningCardsService.updateCard("1", { title: "Updated" }),
      ).rejects.toThrow("Update error");
    });
  });

  describe("deleteCard", () => {
    it("should delete a card", async () => {
      vi.mocked(supabaseClient.deleteLearningCard).mockResolvedValue({
        data: null,
        error: null,
      } as any);

      await expect(
        SupabaseLearningCardsService.deleteCard("1"),
      ).resolves.not.toThrow();
    });

    it("should throw error if delete fails", async () => {
      vi.mocked(supabaseClient.deleteLearningCard).mockResolvedValue({
        data: null,
        error: { message: "Delete error" },
      } as any);

      await expect(
        SupabaseLearningCardsService.deleteCard("1"),
      ).rejects.toThrow("Delete error");
    });
  });

  describe("getCardsByType", () => {
    it("should return cards of a specific type", async () => {
      const mockCards = [
        {
          id: "1",
          title: "Test Card",
          type: "concept",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      vi.mocked(supabaseClient.getLearningCards).mockResolvedValue({
        data: mockCards,
        error: null,
      } as any);

      const result = await SupabaseLearningCardsService.getCardsByType(
        "concept" as any,
      );
      expect(result).toHaveLength(1);
    });

    it("should throw error if fetch fails", async () => {
      vi.mocked(supabaseClient.getLearningCards).mockResolvedValue({
        data: null,
        error: { message: "Fetch error" },
      } as any);

      await expect(
        SupabaseLearningCardsService.getCardsByType("concept" as any),
      ).rejects.toThrow("Fetch error");
    });
  });

  describe("getActiveCardsCount", () => {
    it("should return the count of active cards", async () => {
      vi.mocked(supabaseClient.getLearningCards).mockResolvedValue({
        data: [{}, {}],
        error: null,
      } as any);

      const result = await SupabaseLearningCardsService.getActiveCardsCount();
      expect(result).toBe(2);
    });

    it("should throw error if fetch fails", async () => {
      vi.mocked(supabaseClient.getLearningCards).mockResolvedValue({
        data: null,
        error: { message: "Fetch error" },
      } as any);

      await expect(
        SupabaseLearningCardsService.getActiveCardsCount(),
      ).rejects.toThrow("Fetch error");
    });
  });

  describe("LearningPlanCards operations", () => {
    it("getLearningPlanCards", async () => {
      const result =
        await SupabaseLearningCardsService.getLearningPlanCards("plan1");
      expect(result).toEqual([]);
    });

    it("addCardToPlan", async () => {
      await expect(
        SupabaseLearningCardsService.addCardToPlan("1", "2"),
      ).resolves.not.toThrow();
    });

    it("removeCardFromPlan", async () => {
      await expect(
        SupabaseLearningCardsService.removeCardFromPlan("1", "2"),
      ).resolves.not.toThrow();
    });
  });

  describe("Card Progress operations", () => {
    it("getCardProgress", async () => {
      const result = await SupabaseLearningCardsService.getCardProgress(
        "u1",
        "c1",
      );
      expect(result).toBeNull();
    });

    it("updateCardProgress", async () => {
      await expect(
        SupabaseLearningCardsService.updateCardProgress("u1", "c1", {}),
      ).resolves.not.toThrow();
    });
  });
});
