"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LearningPlan } from "../types";
import { StudyMilestone } from "@elzatona/types";

interface UseActivePlanResult {
  currentPlan: LearningPlan | null;
  milestones: StudyMilestone[];
  currentMilestoneId: string | null;
  resumePlan: () => void;
  resetPlan: () => void;
  selectPlan: (plan: LearningPlan) => void;
}

export function useActivePlan(isAuthenticated: boolean): UseActivePlanResult {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<LearningPlan | null>(null);
  const [milestones, setMilestones] = useState<StudyMilestone[]>([]);
  const [currentMilestoneId, setCurrentMilestoneId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!isAuthenticated || globalThis.window === undefined) return;

    const stored = localStorage.getItem("active-guided-plan");
    if (stored) {
      try {
        const plan = JSON.parse(stored) as LearningPlan;
        setCurrentPlan(plan);
        setMilestones(plan.milestones || []);

        // Track current milestone from storage or default to first
        const storedMilestone = localStorage.getItem(
          `plan-progress-${plan.id}`,
        );
        if (storedMilestone) {
          setCurrentMilestoneId(storedMilestone);
        } else if (plan.milestones && plan.milestones.length > 0) {
          setCurrentMilestoneId(plan.milestones[0].id);
        }
      } catch {
        console.warn("Failed to parse active guided plan from localStorage");
        localStorage.removeItem("active-guided-plan");
      }
    }
  }, [isAuthenticated]);

  const resumePlan = useCallback(() => {
    if (currentPlan) {
      router.push(`/guided-practice?plan=${currentPlan.id}`);
    }
  }, [currentPlan, router]);

  const resetPlan = useCallback(() => {
    if (currentPlan) {
      localStorage.removeItem(`plan-progress-${currentPlan.id}`);
    }
    localStorage.removeItem("active-guided-plan");
    localStorage.removeItem("plan-start-date");
    setCurrentPlan(null);
    setMilestones([]);
    setCurrentMilestoneId(null);
  }, [currentPlan]);

  const selectPlan = useCallback(
    (plan: LearningPlan) => {
      localStorage.setItem("active-guided-plan", JSON.stringify(plan));
      localStorage.setItem("plan-start-date", new Date().toISOString());

      const firstMilestoneId =
        plan.milestones && plan.milestones.length > 0
          ? plan.milestones[0].id
          : null;

      if (firstMilestoneId) {
        localStorage.setItem(`plan-progress-${plan.id}`, firstMilestoneId);
      }

      setCurrentPlan(plan);
      setMilestones(plan.milestones || []);
      setCurrentMilestoneId(firstMilestoneId);
      router.push(`/guided-practice?plan=${plan.id}`);
    },
    [router],
  );

  return {
    currentPlan,
    milestones,
    currentMilestoneId,
    resumePlan,
    resetPlan,
    selectPlan,
  };
}
