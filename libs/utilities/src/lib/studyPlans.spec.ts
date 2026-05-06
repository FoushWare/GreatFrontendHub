import {
  studyPlans,
  getStudyPlanById,
  getAllStudyPlans,
  getStudyPlansByDifficulty,
} from "./studyPlans";

describe("studyPlans", () => {
  it("should have 3 study plans defined", () => {
    expect(studyPlans.length).toBe(3);
  });

  describe("getStudyPlanById", () => {
    it("should return the correct plan for intensive", () => {
      const plan = getStudyPlanById("one-week-intensive");
      expect(plan).toBeDefined();
      expect(plan?.title).toContain("Intensive");
    });

    it("should return undefined for non-existent plan", () => {
      const plan = getStudyPlanById("non-existent");
      expect(plan).toBeUndefined();
    });
  });

  describe("getAllStudyPlans", () => {
    it("should return all 3 plans", () => {
      const plans = getAllStudyPlans();
      expect(plans.length).toBe(3);
    });
  });

  describe("getStudyPlansByDifficulty", () => {
    it("should filter plans by difficulty correctly", () => {
      const intPlans = getStudyPlansByDifficulty("intermediate");
      expect(intPlans.length).toBe(1);
      expect(intPlans[0].id).toBe("one-month-balanced");

      const advPlans = getStudyPlansByDifficulty("advanced");
      expect(advPlans.length).toBe(2);
    });
  });

  describe("Milestones Deduplication", () => {
    it("should have 3 milestones for each plan", () => {
      studyPlans.forEach((plan) => {
        expect(plan.milestones.length).toBe(3);
        expect(plan.milestones[0].id).toBe("m1");
        expect(plan.milestones[1].id).toBe("m2");
        expect(plan.milestones[2].id).toBe("m3");
      });
    });
  });

  describe("Data Integrity & Coverage", () => {
    it("should have valid tasks in every milestone of every plan", () => {
      studyPlans.forEach((plan) => {
        plan.milestones.forEach((milestone) => {
          expect(milestone.tasks.length).toBeGreaterThan(0);
          milestone.tasks.forEach((task) => {
            expect(task.id).toBeDefined();
            expect(task.title).toBeDefined();
            expect(task.estimatedTime).toBeGreaterThan(0);
          });
        });
      });
    });

    it("should have valid topics in every plan", () => {
      studyPlans.forEach((plan) => {
        expect(plan.topics.length).toBeGreaterThan(0);
        plan.topics.forEach((topic) => {
          expect(topic.id).toBeDefined();
          expect(topic.resources.length).toBeGreaterThan(0);
        });
      });
    });
  });
});
