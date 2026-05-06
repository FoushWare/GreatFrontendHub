import { StudyPlan } from "@elzatona/types";

export interface LearningPlan extends StudyPlan {
  isRecommended: boolean;
}

export interface DailyGoal {
  day: number;
  date: string;
  questions: number;
  sections: string[];
  completed: boolean;
  progress: number;
}

export interface PlanGrade {
  planId: string;
  percentage: number;
  completedAt: string;
}

export type GradeLevel = "A+" | "A" | "B+" | "B" | "C";

export interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email?: string } | null;
  isLoading: boolean;
}
