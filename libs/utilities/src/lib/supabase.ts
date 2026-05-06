// Frontend Supabase client configuration
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

const isBuildPhase =
  process.env["NEXT_PHASE"]?.includes("build") ||
  process.env["NODE_ENV"] === "production";

if (!supabaseUrl || !supabaseAnonKey) {
  if (globalThis.window !== undefined) {
    console.warn(
      "⚠️ Supabase configuration is missing or invalid in supabase.ts! Using placeholders to prevent crash.",
    );
  }
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-key",
);

// Export common Supabase operations for frontend use
export const supabaseClient = {
  // Learning Cards
  async getLearningCards(filters?: {
    type?: string;
    isActive?: boolean;
    limit?: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
  }) {
    let query = supabase.from("learning_cards").select("*");

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }
    if (filters?.orderBy) {
      query = query.order(filters.orderBy, {
        ascending: filters.orderDirection === "asc",
      });
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return await query;
  },

  async createLearningCard(cardData: {
    title: string;
    type: string;
    description: string;
    color?: string;
    icon?: string;
    order_index?: number;
    is_active?: boolean;
  }) {
    const data = {
      ...cardData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: cardData.is_active !== false,
    };

    return await supabase.from("learning_cards").insert(data).select().single();
  },

  async updateLearningCard(
    id: string,
    updates: Partial<{
      title: string;
      type: string;
      description: string;
      color: string;
      icon: string;
      order_index: number;
      is_active: boolean;
    }>,
  ) {
    const data = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return await supabase
      .from("learning_cards")
      .update(data)
      .eq("id", id)
      .select()
      .single();
  },

  async deleteLearningCard(id: string) {
    return await supabase.from("learning_cards").delete().eq("id", id);
  },

  // Categories
  async getCategories(filters?: {
    isActive?: boolean;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
  }) {
    let query = supabase.from("categories").select("*");

    if (filters?.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }
    if (filters?.orderBy) {
      query = query.order(filters.orderBy, {
        ascending: filters.orderDirection === "asc",
      });
    }

    return await query;
  },

  async createCategory(categoryData: {
    name: string;
    description: string;
    icon?: string;
    color?: string;
    order_index?: number;
    is_active?: boolean;
  }) {
    const data = {
      ...categoryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: categoryData.is_active !== false,
    };

    return await supabase.from("categories").insert(data).select().single();
  },

  // Topics
  async getTopics(filters?: {
    categoryId?: string;
    isActive?: boolean;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
  }) {
    let query = supabase.from("topics").select("*");

    if (filters?.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }
    if (filters?.orderBy) {
      query = query.order(filters.orderBy, {
        ascending: filters.orderDirection === "asc",
      });
    }

    return await query;
  },

  async createTopic(topicData: {
    name: string;
    description: string;
    category_id?: string;
    order_index?: number;
    is_active?: boolean;
  }) {
    const data = {
      ...topicData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: topicData.is_active !== false,
    };

    return await supabase.from("topics").insert(data).select().single();
  },

  // Questions
  async getQuestions(filters?: {
    topicId?: string;
    difficulty?: string;
    questionType?: string;
    isActive?: boolean;
    limit?: number;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
  }) {
    let query = supabase.from("questions").select("*");

    if (filters?.topicId) {
      query = query.eq("topic_id", filters.topicId);
    }
    if (filters?.difficulty) {
      query = query.eq("difficulty", filters.difficulty);
    }
    if (filters?.questionType) {
      query = query.eq("question_type", filters.questionType);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }
    if (filters?.orderBy) {
      query = query.order(filters.orderBy, {
        ascending: filters.orderDirection === "asc",
      });
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return await query;
  },

  async createQuestion(questionData: {
    question_text: string;
    explanation: string;
    topic_id?: string;
    difficulty?: string;
    question_type?: string;
    options?: string;
    correct_answer?: string;
    tags?: string;
    is_active?: boolean;
  }) {
    const data = {
      ...questionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: questionData.is_active !== false,
    };

    return await supabase.from("questions").insert(data).select().single();
  },

  // Learning Plans
  async getLearningPlans(filters?: {
    difficulty?: string;
    isActive?: boolean;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
  }) {
    let query = supabase.from("learning_plans").select("*");

    if (filters?.difficulty) {
      query = query.eq("difficulty", filters.difficulty);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }
    if (filters?.orderBy) {
      query = query.order(filters.orderBy, {
        ascending: filters.orderDirection === "asc",
      });
    }

    return await query;
  },

  async createLearningPlan(planData: {
    title: string;
    description: string;
    difficulty?: string;
    estimated_time?: number;
    is_active?: boolean;
  }) {
    const data = {
      ...planData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: planData.is_active !== false,
    };

    return await supabase.from("learning_plans").insert(data).select().single();
  },
};

/**
 * Get a Supabase client with service role key (lazy initialization)
 * This function creates the client only when called, not at module load time
 * This prevents build-time errors when environment variables are not available
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // If not in build phase and missing keys, throw
    if (process.env["NEXT_PHASE"] !== "phase-production-build") {
      throw new Error(
        "Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
      );
    }
    // Return dummy client for build phase if needed, or throw
  }

  return createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseServiceRoleKey || "placeholder",
  );
}
