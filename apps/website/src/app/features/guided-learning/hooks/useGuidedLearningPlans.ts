"use client";

import { useState, useEffect, useMemo } from "react";
import { LearningPlan } from "../types";
import {
  sortPlansByDifficulty,
  getQuestionsRange,
  getMilestoneRange,
} from "../utils/plan-helpers";

interface UsePlansResult {
  plans: LearningPlan[];
  allPlans: LearningPlan[];
  isLoading: boolean;
  error: string | null;
  questionsRange: string;
  milestoneRange: string;
}

export function useGuidedLearningPlans(): UsePlansResult {
  const [allPlans, setAllPlans] = useState<LearningPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/guided-learning/plans", {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Failed to load plans (${response.status})`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setAllPlans(data.data);
        } else if (Array.isArray(data)) {
          setAllPlans(data);
        } else {
          setAllPlans([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setAllPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, []);

  const plans = useMemo(() => sortPlansByDifficulty(allPlans), [allPlans]);
  const questionsRange = useMemo(() => getQuestionsRange(plans).label, [plans]);
  const milestoneRange = useMemo(() => getMilestoneRange(plans), [plans]);

  return { plans, allPlans, isLoading, error, questionsRange, milestoneRange };
}
