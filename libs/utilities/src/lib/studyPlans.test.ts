import {
  studyPlans,
  getStudyPlanById,
  getAllStudyPlans,
  getStudyPlansByDifficulty,
  getStudyPlansByDuration,
} from "./studyPlans";

describe("studyPlans", () => {
  test("should exported studyPlans array be populated", () => {
    expect(Array.isArray(studyPlans)).toBe(true);
    expect(studyPlans.length).toBeGreaterThan(0);
  });

  test("getAllStudyPlans should return all plans", () => {
    const plans = getAllStudyPlans();
    expect(plans).toEqual(studyPlans);
  });

  test("getStudyPlanById should return the correct plan", () => {
    const firstPlan = studyPlans[0];
    const plan = getStudyPlanById(firstPlan.id);
    expect(plan).toEqual(firstPlan);
  });

  test("getStudyPlanById should return undefined for non-existent id", () => {
    const plan = getStudyPlanById("non-existent");
    expect(plan).toBeUndefined();
  });

  test("getStudyPlansByDifficulty should filter plans correctly", () => {
    const advancedPlans = getStudyPlansByDifficulty("advanced");
    expect(advancedPlans.every((p) => p.difficulty === "advanced")).toBe(true);

    // Check if it actually found some (since we know there are advanced plans)
    expect(advancedPlans.length).toBeGreaterThan(0);
  });

  test("getStudyPlansByDuration should filter plans correctly", () => {
    // 1 week plan exists
    const oneWeekPlans = getStudyPlansByDuration(1);
    expect(oneWeekPlans.every((p) => p.duration.weeks === 1)).toBe(true);
    expect(oneWeekPlans.length).toBeGreaterThan(0);

    // 4 week plan exists
    const fourWeekPlans = getStudyPlansByDuration(4);
    expect(fourWeekPlans.every((p) => p.duration.weeks === 4)).toBe(true);
    expect(fourWeekPlans.length).toBeGreaterThan(0);
  });

  test("each plan should have required fields", () => {
    studyPlans.forEach((plan) => {
      expect(plan.id).toBeDefined();
      expect(plan.title).toBeDefined();
      expect(plan.duration).toBeDefined();
      expect(Array.isArray(plan.milestones)).toBe(true);
      expect(plan.milestones.length).toBeGreaterThan(0);
    });
  });
});
