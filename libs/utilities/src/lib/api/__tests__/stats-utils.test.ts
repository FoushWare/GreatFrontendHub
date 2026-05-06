import { describe, it, expect } from "vitest";
import { calculateStreak, calculateAchievements } from "../stats-utils";

describe("stats-utils", () => {
  describe("calculateStreak", () => {
    it("should return zeros for empty activity", () => {
      expect(calculateStreak([])).toEqual({ current: 0, longest: 0 });
    });

    it("should calculate simple streaks", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const dates = [today.toISOString(), yesterday.toISOString()];

      const streak = calculateStreak(dates);
      expect(streak.current).toBe(2);
      expect(streak.longest).toBe(2);
    });

    it("should calculate longest streak correctly with gaps", () => {
      const dates = [
        "2026-01-01T10:00:00Z",
        "2026-01-02T10:00:00Z",
        "2026-01-03T10:00:00Z",
        "2026-01-05T10:00:00Z", // Gap on Jan 4
        "2026-01-06T10:00:00Z",
      ];

      const streak = calculateStreak(dates);
      expect(streak.longest).toBe(3);
      expect(streak.current).toBe(0); // Assuming "today" is much later than 2026-01-06
    });
  });

  describe("calculateAchievements", () => {
    it("should return achievements based on milestones", () => {
      const achievements = calculateAchievements(60, 600, 10, 10);
      const ids = achievements.map((a) => a.id);

      expect(ids).toContain("questions-10");
      expect(ids).toContain("questions-50");
      expect(ids).toContain("points-100");
      expect(ids).toContain("points-500");
      expect(ids).toContain("streak-7");
      expect(ids).not.toContain("questions-100");
    });
  });
});
