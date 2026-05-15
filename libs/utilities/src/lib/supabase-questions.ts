import { createClient } from "@supabase/supabase-js";
import { shuffleArray } from "./utils";
import type { QuestionStats as UnifiedQuestionStats } from "./unified-question-schema";

const supabaseUrl =
  process.env["NEXT_PUBLIC_SUPABASE_URL"] ||
  "https://placeholder-url.supabase.co";
const supabaseServiceRoleKey =
  process.env["SUPABASE_SERVICE_ROLE_KEY"] || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

if (
  !process.env["NEXT_PUBLIC_SUPABASE_URL"] ||
  !process.env["SUPABASE_SERVICE_ROLE_KEY"]
) {
  if (globalThis.window !== undefined) {
    console.warn(
      "⚠️ Supabase credentials missing in supabase-questions.ts. Using placeholders to prevent crash.",
    );
  }
}

export interface Question {
  id: string;
  title: string;
  content: string;
  question_type: "multiple-choice" | "open-ended" | "code";
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  topic_id: string;
  tags: string[];
  // For multiple choice questions
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  correct_answer: string;
  explanation: string;
  learning_card_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  card_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionAttempt {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  is_correct: boolean;
  time_spent: number;
  created_at: string;
}

export interface QuestionStats {
  totalQuestions: number;
  questionsByDifficulty: Record<string, number>;
  questionsByCategory: Record<string, number>;
  questionsByType: Record<string, number>;
}

// Questions Service
export const getQuestions = async (filters?: {
  category?: string;
  difficulty?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}): Promise<Question[]> => {
  let query = supabase.from("questions").select("*").eq("is_active", true);

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }
  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains("tags", filters.tags);
  }

  query = query.order("created_at", { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 10) - 1,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getQuestion = async (id: string): Promise<Question | null> => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return data;
};

export const getRandomQuestions = async (
  count: number,
  filters?: {
    category?: string;
    difficulty?: string;
    tags?: string[];
  },
): Promise<Question[]> => {
  let query = supabase.from("questions").select("*").eq("is_active", true);

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }
  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains("tags", filters.tags);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Shuffle and take random questions
  return shuffleArray(data || []).slice(0, count);
};

export const getCategories = async (): Promise<QuestionCategory[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getQuestionStats = async (): Promise<UnifiedQuestionStats> => {
  const { data: questions, error } = await supabase
    .from("questions")
    .select(
      "difficulty, category, question_type, learning_path, section_id, is_active, created_at",
    )
    .eq("is_active", true);

  if (error) throw error;

  const stats: UnifiedQuestionStats = {
    totalQuestions: questions?.length || 0,
    questionsByDifficulty: {},
    questionsByCategory: {},
    questionsByLearningPath: {},
    questionsBySection: {},
    activeQuestions: questions?.filter((q) => q.is_active).length || 0,
    inactiveQuestions: questions?.filter((q) => !q.is_active).length || 0,
    averageDifficulty: 0,
    lastUpdated: new Date().toISOString(),
    topCategories: [],
    recentActivity: [],
  };

  let totalDifficulty = 0;
  const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };

  questions?.forEach((question) => {
    // Count by difficulty
    stats.questionsByDifficulty[question.difficulty] =
      (stats.questionsByDifficulty[question.difficulty] || 0) + 1;

    // Count by category
    stats.questionsByCategory[question.category] =
      (stats.questionsByCategory[question.category] || 0) + 1;

    // Count by learning path
    if (question.learning_path) {
      stats.questionsByLearningPath[question.learning_path] =
        (stats.questionsByLearningPath[question.learning_path] || 0) + 1;
    }

    // Count by section
    if (question.section_id) {
      stats.questionsBySection[question.section_id] =
        (stats.questionsBySection[question.section_id] || 0) + 1;
    }

    // Calculate average difficulty
    totalDifficulty +=
      difficultyMap[question.difficulty as keyof typeof difficultyMap] || 0;
  });

  // Calculate average difficulty
  if (questions?.length) {
    stats.averageDifficulty = totalDifficulty / questions.length;
  }

  // Calculate top categories
  stats.topCategories = Object.entries(stats.questionsByCategory)
    .map(([category, count]) => ({
      category,
      count,
      percentage:
        stats.totalQuestions > 0 ? (count / stats.totalQuestions) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return stats;
};

export const saveQuestionAttempt = async (
  attempt: Omit<QuestionAttempt, "id" | "created_at">,
): Promise<QuestionAttempt> => {
  const { data, error } = await supabase
    .from("question_attempts")
    .insert({
      ...attempt,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserQuestionAttempts = async (
  userId: string,
  questionId?: string,
): Promise<QuestionAttempt[]> => {
  let query = supabase
    .from("question_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (questionId) {
    query = query.eq("question_id", questionId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const searchQuestions = async (
  query: string,
  filters?: {
    category?: string;
    difficulty?: string;
    tags?: string[];
    limit?: number;
  },
): Promise<Question[]> => {
  let supabaseQuery = supabase
    .from("questions")
    .select("*")
    .eq("is_active", true)
    .or(
      `title.ilike.%${query}%,content.ilike.%${query}%,explanation.ilike.%${query}%`,
    );

  if (filters?.category) {
    supabaseQuery = supabaseQuery.eq("category", filters.category);
  }
  if (filters?.difficulty) {
    supabaseQuery = supabaseQuery.eq("difficulty", filters.difficulty);
  }
  if (filters?.tags && filters.tags.length > 0) {
    supabaseQuery = supabaseQuery.contains("tags", filters.tags);
  }

  supabaseQuery = supabaseQuery.order("created_at", { ascending: false });

  if (filters?.limit) {
    supabaseQuery = supabaseQuery.limit(filters.limit);
  }

  const { data, error } = await supabaseQuery;
  if (error) throw error;
  return data || [];
};

export const getQuizQuestions = async (
  count: number,
  filters?: {
    category?: string;
    difficulty?: string;
    tags?: string[];
  },
): Promise<Question[]> => {
  return getRandomQuestions(count, filters);
};
