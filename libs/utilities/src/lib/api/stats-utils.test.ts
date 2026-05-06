import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateStreak, calculateAchievements } from "./stats-utils";

describe("Stats Utilities", () => {
  describe("calculateStreak", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return zeros for empty activity", () => {
      expect(calculateStreak([])).toEqual({ current: 0, longest: 0 });
    });

    it("should calculate correct longest streak", () => {
      const dates = [
        "2026-01-01",
        "2026-01-02",
        "2026-01-03",
        "2026-01-05",
        "2026-01-06",
      ];
      const result = calculateStreak(dates);
      expect(result.longest).toBe(3);
    });

    it("should calculate active current streak (today)", () => {
      // Create a date that is clearly "today" in both UTC and Local
      const today = new Date("2026-04-19T12:00:00Z");
      vi.setSystemTime(today);

      const dates = ["2026-04-17", "2026-04-18", "2026-04-19"];
      const result = calculateStreak(dates);
      expect(result.current).toBe(3);
    });

    it("should calculate active current streak (yesterday)", () => {
      const today = new Date("2026-04-20T12:00:00Z");
      vi.setSystemTime(today);

      const dates = ["2026-04-18", "2026-04-19"];
      const result = calculateStreak(dates);
      expect(result.current).toBe(2);
    });

    it("should return current streak 0 if broken beyond yesterday", () => {
      const today = new Date("2026-04-21T12:00:00Z");
      vi.setSystemTime(today);

      const dates = ["2026-04-18", "2026-04-19"];
      const result = calculateStreak(dates);
      expect(result.current).toBe(0);
      expect(result.longest).toBe(2);
    });
  });

  describe("calculateAchievements", () => {
    it("should award achievements for question milestones", () => {
      const result = calculateAchievements(10, 0, 0, 0);
      expect(result.some((a) => a.id === "questions-10")).toBe(true);
      expect(result.some((a) => a.id === "questions-50")).toBe(false);

      const result50 = calculateAchievements(55, 0, 0, 0);
      expect(result50.some((a) => a.id === "questions-50")).toBe(true);
    });

    it("should award achievements for point milestones", () => {
      const result = calculateAchievements(0, 150, 0, 0);
      expect(result.some((a) => a.id === "points-100")).toBe(true);
      expect(result.some((a) => a.id === "points-500")).toBe(false);
    });

    it("should award achievements for streak milestones", () => {
      const result = calculateAchievements(0, 0, 7, 7);
      expect(result.some((a) => a.id === "streak-7")).toBe(true);

      const result30 = calculateAchievements(0, 0, 30, 30);
      expect(result30.some((a) => a.id === "streak-30")).toBe(true);
      expect(result30.some((a) => a.id === "longest-streak-30")).toBe(true);
    });
  });
});
