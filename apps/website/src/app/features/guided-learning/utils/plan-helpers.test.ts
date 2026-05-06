import {
  getGradeColor,
  getGradeText,
  getGradeLevel,
  sortPlansByDifficulty,
  getQuestionsRange,
  getMilestoneRange,
} from "./plan-helpers";

describe("plan-helpers", () => {
  describe("getGradeColor", () => {
    it("should return master classes for 90+", () => {
      const result = getGradeColor(95);
      expect(result).toContain("emerald");
    });

    it("should return solid classes for 80-89", () => {
      const result = getGradeColor(85);
      expect(result).toContain("blue");
    });

    it("should return proficient classes for 70-79", () => {
      const result = getGradeColor(75);
      expect(result).toContain("indigo");
    });

    it("should return developing classes for 60-69", () => {
      const result = getGradeColor(65);
      expect(result).toContain("amber");
    });

    it("should return needs review classes for <60", () => {
      const result = getGradeColor(50);
      expect(result).toContain("rose");
    });
  });

  describe("getGradeText", () => {
    it("should return Mastered for 90+", () => {
      expect(getGradeText(90)).toBe("Mastered (A+)");
    });
    it("should return Needs Review for <60", () => {
      expect(getGradeText(59)).toBe("Needs Review (C)");
    });
  });

  describe("getGradeLevel", () => {
    it("should return A+ for 90+", () => {
      expect(getGradeLevel(90)).toBe("A+");
    });
    it("should return C for <60", () => {
      expect(getGradeLevel(59)).toBe("C");
    });
  });

  describe("sortPlansByDifficulty", () => {
    it("should sort plans correctly by beginner, intermediate, advanced", () => {
      const plans = [
        { difficulty: "advanced", id: "a" },
        { difficulty: "beginner", id: "b" },
        { difficulty: "intermediate", id: "i" },
      ];
      const sorted = sortPlansByDifficulty(plans);
      expect(sorted[0].id).toBe("b");
      expect(sorted[1].id).toBe("i");
      expect(sorted[2].id).toBe("a");
    });
  });

  describe("getQuestionsRange", () => {
    it("should return numeric range if totalQuestions exists", () => {
      const plans = [{ totalQuestions: 10 }, { totalQuestions: 20 }];
      expect(getQuestionsRange(plans)).toBe("10-20");
    });

    it("should return single number if only one plan has questions", () => {
      const plans = [{ totalQuestions: 15 }];
      expect(getQuestionsRange(plans)).toBe("15-15");
    });

    it("should fallback to duration hours if no questions", () => {
      const plans = [
        { duration: { totalHours: 5 } },
        { duration: { totalHours: 10 } },
      ];
      expect(getQuestionsRange(plans)).toBe("5-10");
    });

    it("should return default text if no data", () => {
      expect(getQuestionsRange([])).toBe("Foundational to Expert");
    });
  });

  describe("getMilestoneRange", () => {
    it("should return range of milestone lengths", () => {
      const plans = [{ milestones: [1, 2] }, { milestones: [1, 2, 3] }];
      expect(getMilestoneRange(plans)).toBe("2-3");
    });

    it("should return single number if all plans have same length", () => {
      const plans = [{ milestones: [1, 2] }, { milestones: [3, 4] }];
      expect(getMilestoneRange(plans)).toBe("2");
    });

    it("should return default text if no milestones", () => {
      expect(getMilestoneRange([])).toBe("Modular");
    });
  });
});
