import {
  getCategoryIcon,
  getDifficultyColor,
  getDifficultyBgColor,
  getPriorityColor,
  getPriorityBgColor,
  calculateProgressStats,
  getLearningRecommendations,
  formatTime,
  sampleLearningItems,
} from "./progress";
import { describe, it, expect } from "vitest";
import { LearningItem } from "@elzatona/types";

describe("progress", () => {
  describe("getCategoryIcon", () => {
    it("returns correct icon for known categories", () => {
      expect(getCategoryIcon("javascript")).toBe("⚡");
      expect(getCategoryIcon("react")).toBe("⚛️");
    });
    it("returns default icon for unknown categories", () => {
      expect(getCategoryIcon("unknown")).toBe("📚");
    });
  });

  describe("getDifficultyColor", () => {
    it("returns correct color", () => {
      expect(getDifficultyColor("beginner")).toBe("text-green-400");
    });
    it("returns default color", () => {
      expect(getDifficultyColor("unknown")).toBe("text-gray-400");
    });
  });

  describe("getDifficultyBgColor", () => {
    it("returns correct bg color", () => {
      expect(getDifficultyBgColor("beginner")).toBe("bg-green-600");
    });
    it("returns default bg color", () => {
      expect(getDifficultyBgColor("unknown")).toBe("bg-gray-600");
    });
  });

  describe("getPriorityColor", () => {
    it("returns correct color", () => {
      expect(getPriorityColor("high")).toBe("text-red-400");
    });
    it("returns default color", () => {
      expect(getPriorityColor("unknown")).toBe("text-gray-400");
    });
  });

  describe("getPriorityBgColor", () => {
    it("returns correct bg color", () => {
      expect(getPriorityBgColor("high")).toBe("bg-red-600");
    });
    it("returns default bg color", () => {
      expect(getPriorityBgColor("unknown")).toBe("bg-gray-600");
    });
  });

  describe("calculateProgressStats", () => {
    it("handles empty items array", () => {
      const stats = calculateProgressStats([]);
      expect(stats.totalItems).toBe(0);
      expect(stats.completionPercentage).toBe(0);
    });

    it("calculates stats correctly", () => {
      const items: LearningItem[] = [
        { ...sampleLearningItems[0], isCompleted: true, actualTimeSpent: 15 },
        { ...sampleLearningItems[1], isCompleted: false, actualTimeSpent: 0 },
      ];
      const stats = calculateProgressStats(items);
      expect(stats.totalItems).toBe(2);
      expect(stats.completedItems).toBe(1);
      expect(stats.completionPercentage).toBe(50);
      expect(stats.categoryBreakdown["javascript"]).toBeDefined();
    });
  });

  describe("getLearningRecommendations", () => {
    it("returns top 5 recommendations sorted correctly", () => {
      const recs = getLearningRecommendations(sampleLearningItems);
      expect(recs.length).toBeLessThanOrEqual(5);
      expect(recs[0].priority).toBe("high");
    });
  });

  describe("formatTime", () => {
    it("formats minutes", () => {
      expect(formatTime(45)).toBe("45m");
      expect(formatTime(60)).toBe("1h");
      expect(formatTime(90)).toBe("1h 30m");
    });
  });
});
