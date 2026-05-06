import { GradeLevel } from "../types";

export function getGradeColor(percentage: number): string {
  if (percentage >= 90)
    return "border-emerald-500 dark:border-emerald-400 ring-4 ring-emerald-200 dark:ring-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20";
  if (percentage >= 80)
    return "border-blue-500 dark:border-blue-400 ring-4 ring-blue-200 dark:ring-blue-800 bg-blue-50/50 dark:bg-blue-900/20";
  if (percentage >= 70)
    return "border-indigo-500 dark:border-indigo-400 ring-4 ring-indigo-200 dark:ring-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20";
  if (percentage >= 60)
    return "border-amber-500 dark:border-amber-400 ring-4 ring-amber-200 dark:ring-amber-800 bg-amber-50/50 dark:bg-amber-900/20";
  return "border-rose-500 dark:border-rose-400 ring-4 ring-rose-200 dark:ring-rose-800 bg-rose-50/50 dark:bg-rose-900/20";
}

export function getGradeText(percentage: number): string {
  if (percentage >= 90) return "Mastered (A+)";
  if (percentage >= 80) return "Solid (A)";
  if (percentage >= 70) return "Proficient (B+)";
  if (percentage >= 60) return "Developing (B)";
  return "Needs Review (C)";
}

export function getGradeLevel(percentage: number): GradeLevel {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  return "C";
}

export function sortPlansByDifficulty<T extends { difficulty: string }>(
  plans: T[],
): T[] {
  const difficultyOrder = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  };

  return [...plans].sort((a, b) => {
    const diffA = a.difficulty.toLowerCase() as keyof typeof difficultyOrder;
    const diffB = b.difficulty.toLowerCase() as keyof typeof difficultyOrder;
    return (difficultyOrder[diffA] || 0) - (difficultyOrder[diffB] || 0);
  });
}

export interface RangeInfo {
  min: number | string;
  max: number | string;
  type: "questions" | "hours" | "descriptive";
  label: string;
}

export function getQuestionsRange(
  plans: { totalQuestions?: number; duration?: { totalHours?: number } }[],
): RangeInfo {
  // 1. Check for specific question counts
  const nums = plans
    .map((p) => p.totalQuestions)
    .filter((n): n is number => typeof n === "number" && !Number.isNaN(n));

  if (nums.length >= 1) {
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return {
      min,
      max,
      type: "questions",
      label: min === max ? `${min} questions` : `${min}-${max} questions`,
    };
  }

  // 2. Fallback to estimated hours
  const hours = plans
    .map((p) => p.duration?.totalHours)
    .filter((n): n is number => typeof n === "number" && !Number.isNaN(n));

  if (hours.length >= 1) {
    const min = Math.min(...hours);
    const max = Math.max(...hours);
    return {
      min,
      max,
      type: "hours",
      label: min === max ? `${min}h estimated` : `${min}-${max}h estimated`,
    };
  }

  // 3. Final descriptive fallback
  return {
    min: "Foundational",
    max: "Expert",
    type: "descriptive",
    label: "Foundational to Expert",
  };
}

export function getMilestoneRange(plans: { milestones?: any[] }[]): string {
  const counts = plans
    .map((p) => p.milestones?.length || 0)
    .filter((n) => n > 0);

  if (counts.length >= 1) {
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    return min === max ? `${min}` : `${min}-${max}`;
  }
  return "Modular";
}
