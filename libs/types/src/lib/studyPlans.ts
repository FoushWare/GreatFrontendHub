export interface StudyPlan {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: {
    weeks: number;
    hoursPerWeek: number;
    totalHours: number;
  };
  difficulty: "beginner" | "intermediate" | "advanced";
  color: string;
  features: string[];
  topics: StudyTopic[];
  milestones: StudyMilestone[];
  prerequisites: string[];
  outcomes: string[];
  estimatedTotalTime: number;
  isActive?: boolean;
  progress?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface StudyTopic {
  id: string;
  title: string;
  description: string;
  category:
    | "javascript"
    | "react"
    | "css"
    | "html"
    | "system-design"
    | "algorithms"
    | "testing"
    | "performance";
  difficulty: "easy" | "medium" | "hard";
  estimatedHours: number;
  resources: StudyResource[];
  practiceQuestions: string[];
  isCompleted?: boolean;
  progress?: number;
}

export interface StudyResource {
  id: string;
  title: string;
  type: "article" | "video" | "practice" | "quiz" | "project";
  url: string;
  description: string;
  estimatedTime: number;
  isCompleted?: boolean;
}

export interface StudyMilestone {
  id: string;
  title: string;
  description: string;
  order: number;
  topics: string[];
  tasks: StudyTask[];
  isCompleted?: boolean;
  progress?: number;
}

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  type: "reading" | "practice" | "quiz" | "project" | "review";
  estimatedTime: number;
  resourceUrl?: string;
  isCompleted?: boolean;
  completedAt?: Date;
}

export interface UserStudyPlan {
  plan_id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  completedTopics: string[];
  completedTasks: string[];
  currentMilestoneId: string;
  is_active: boolean;
  customizations: PlanCustomization;
}

export interface PlanCustomization {
  topicsToSkip: string[];
  topicsToAdd: string[];
  dailyHours: number;
  preferredLearningTime: "morning" | "afternoon" | "evening";
  focusAreas: string[];
  difficultyAdjustment: "easier" | "same" | "harder";
}
