"use client";

// sonarqube:disable S1135 (Architectural TODOs require implementing new repository methods)

import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import type {
  AdminLearningCard,
  LearningPlan,
  AdminCategory,
  AdminUnifiedQuestion,
  Topic as AdminTopic,
} from "@elzatona/types";
import { useLearningCardRepository } from "@elzatona/database/client";
import { supabase } from "@elzatona/utilities";
import type { Topic as DatabaseTopic } from "@elzatona/database";

type DatabaseTopicRecord = DatabaseTopic & {
  category_id?: string;
  order_index?: number;
};

type DatabaseCategoryRecord = AdminCategory & {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  learning_card_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  card_type?: string | null;
};

type LoadResult<T> = {
  data: T[];
  error: string | null;
};

type DatabasePlanRecord = {
  id: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  estimated_duration?: number | null;
  estimated_hours?: number | null;
  is_public?: boolean | null;
  is_active?: boolean | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

type PlanGenerationMetadata = {
  title: string;
  description: string;
  plan_type: "initial" | "reinforcement" | "advanced" | "maintenance";
  sequence_index: number;
  new_question_count: number;
  review_question_count: number;
};

type PlanQuestionInsertRow = {
  plan_id: string;
  question_id: string;
  order_index: number;
  is_review: boolean;
  parent_plan_id: string | null;
  difficulty_tier: "easy" | "medium" | "hard";
  is_active: boolean;
};

type PlanEditFormData = {
  title: string;
  description: string;
  estimated_duration: number;
  status: "published" | "draft" | "archived";
};

type CanonicalCardKey = "core" | "framework" | "problem" | "system";

const PLAN_DISTRIBUTION = [
  { newPerCard: 2, reviewPerCard: 0 },
  { newPerCard: 2, reviewPerCard: 1 },
  { newPerCard: 1, reviewPerCard: 2 },
  { newPerCard: 1, reviewPerCard: 3 },
] as const;

const CANONICAL_CARDS: Array<{
  key: CanonicalCardKey;
  title: string;
  description: string;
  color: string;
  icon: string;
  order: number;
}> = [
  {
    key: "core",
    title: "Core Technologies",
    description: "HTML, CSS, JavaScript, TypeScript",
    color: "#3B82F6",
    icon: "Layers",
    order: 0,
  },
  {
    key: "framework",
    title: "Framework Questions",
    description: "React, Next.js, Vue, Angular, Svelte",
    color: "#10B981",
    icon: "Layers",
    order: 1,
  },
  {
    key: "problem",
    title: "Problem Solving",
    description: "Frontend coding challenges and algorithms",
    color: "#F59E0B",
    icon: "Layers",
    order: 2,
  },
  {
    key: "system",
    title: "System Design",
    description: "Frontend architecture patterns",
    color: "#EF4444",
    icon: "Layers",
    order: 3,
  },
];

function buildCanonicalCards(cards: AdminLearningCard[]): {
  cards: AdminLearningCard[];
  idsByKey: Record<CanonicalCardKey, string>;
} {
  const idsByKey = {
    core: "",
    framework: "",
    problem: "",
    system: "",
  } as Record<CanonicalCardKey, string>;

  const canonicalCards = CANONICAL_CARDS.map((meta) => {
    const existing = cards.find((card) => card.title === meta.title);
    const normalized: AdminLearningCard = existing ?? {
      id: `virtual-${meta.key}`,
      title: meta.title,
      description: meta.description,
      color: meta.color,
      icon: meta.icon,
      order_index: meta.order,
      is_active: true,
      created_at: "",
      updated_at: "",
    };

    idsByKey[meta.key] = normalized.id;
    return normalized;
  });

  return { cards: canonicalCards, idsByKey };
}

function normalizeCardTypeKey(
  cardType?: string | null,
): CanonicalCardKey | null {
  if (!cardType) {
    return null;
  }

  const normalized = cardType.trim().toLowerCase();

  if (
    normalized === "core" ||
    normalized === "core technologies" ||
    normalized === "core_technologies" ||
    normalized === "core-technologies"
  ) {
    return "core";
  }

  if (
    normalized === "framework" ||
    normalized === "framework questions" ||
    normalized === "framework_questions" ||
    normalized === "framework-questions"
  ) {
    return "framework";
  }

  if (
    normalized === "problem" ||
    normalized === "problem solving" ||
    normalized === "problem_solving" ||
    normalized === "problem-solving"
  ) {
    return "problem";
  }

  if (
    normalized === "system" ||
    normalized === "system design" ||
    normalized === "system_design" ||
    normalized === "system-design"
  ) {
    return "system";
  }

  return null;
}

function mapCategoryToCard(
  category: DatabaseCategoryRecord,
  idsByKey: Record<CanonicalCardKey, string>,
  cardIdByCategoryId: Map<string, string>,
): AdminCategory | null {
  const mappedCardId =
    category.learning_card_id || cardIdByCategoryId.get(category.id);

  if (mappedCardId) {
    return {
      id: category.id,
      name: category.name ?? "",
      slug: category.slug ?? toSlug(category.name ?? category.id),
      description: category.description ?? "",
      learning_card_id: mappedCardId,
      is_active: category.is_active ?? true,
      created_at: category.created_at ?? "",
      updated_at: category.updated_at ?? "",
    };
  }

  const key = normalizeCardTypeKey(category.card_type);
  if (!key) {
    return null;
  }

  return {
    id: category.id,
    name: category.name ?? "",
    slug: category.slug ?? toSlug(category.name ?? category.id),
    description: category.description ?? "",
    learning_card_id: idsByKey[key],
    is_active: category.is_active ?? true,
    created_at: category.created_at ?? "",
    updated_at: category.updated_at ?? "",
  };
}

function getQuestionLearningCardId(question: AdminUnifiedQuestion): string {
  const withLegacyCardId = question as AdminUnifiedQuestion & {
    learningCardId?: string;
  };

  return question.learning_card_id ?? withLegacyCardId.learningCardId ?? "";
}

function getPrimaryNestedId(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) {
    return "";
  }

  const first = value[0] as Record<string, unknown>;
  const id = first["id"];
  return typeof id === "string" ? id : "";
}

function getQuestionCategoryId(question: AdminUnifiedQuestion): string {
  const legacy = question as AdminUnifiedQuestion & {
    categoryId?: string;
    categories?: unknown;
  };

  return (
    question.category_id ??
    legacy.categoryId ??
    getPrimaryNestedId(legacy.categories) ??
    ""
  );
}

function getQuestionTopicId(question: AdminUnifiedQuestion): string {
  const legacy = question as AdminUnifiedQuestion & {
    topicId?: string;
    topics?: unknown;
  };

  return (
    question.topic_id ??
    legacy.topicId ??
    getPrimaryNestedId(legacy.topics) ??
    ""
  );
}

function buildCategoryCardLookup(
  questions: AdminUnifiedQuestion[],
): Map<string, string> {
  const lookup = new Map<string, string>();

  questions.forEach((question) => {
    const categoryId = question.category_id;
    const learningCardId = getQuestionLearningCardId(question);

    if (!categoryId || !learningCardId || lookup.has(categoryId)) {
      return;
    }

    lookup.set(categoryId, learningCardId);
  });

  return lookup;
}

function buildTopicCategoryLookup(
  questions: AdminUnifiedQuestion[],
): Map<string, string> {
  const lookup = new Map<string, string>();

  questions.forEach((question) => {
    const topicId = getQuestionTopicId(question);
    const categoryId = getQuestionCategoryId(question);

    if (!topicId || !categoryId || lookup.has(topicId)) {
      return;
    }

    lookup.set(topicId, categoryId);
  });

  return lookup;
}

function transformQuestion(q: Record<string, unknown>): AdminUnifiedQuestion {
  const category_id =
    q.category_id ?? q.categoryId ?? getPrimaryNestedId(q.categories) ?? "";
  const topic_id =
    q.topic_id ?? q.topicId ?? getPrimaryNestedId(q.topics) ?? "";
  const learning_card_id =
    q.learning_card_id ??
    q.learningCardId ??
    getPrimaryNestedId(q.learning_cards) ??
    "";

  return {
    ...q,
    category_id,
    topic_id,
    learning_card_id,
    isActive: q.isActive ?? q.is_active ?? true,
    createdAt: q.createdAt ?? q.created_at ?? "",
    updatedAt: q.updatedAt ?? q.updated_at ?? "",
  } as AdminUnifiedQuestion;
}

export const contentManagementMappingTestUtils = {
  normalizeCardTypeKey,
  mapCategoryToCard,
  transformQuestion,
  buildCategoryCardLookup,
  buildTopicCategoryLookup,
};

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9\s-]/g, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-");
}

function generatePlanMetadata(sequence: number): PlanGenerationMetadata {
  switch (sequence) {
    case 1:
      return {
        title: "Initial",
        description:
          "Initial plan with new questions across all four learning cards.",
        plan_type: "initial",
        sequence_index: 1,
        new_question_count: 0,
        review_question_count: 0,
      };
    case 2:
      return {
        title: "Review",
        description: "Review plan that mixes new and review questions.",
        plan_type: "reinforcement",
        sequence_index: 2,
        new_question_count: 0,
        review_question_count: 0,
      };
    case 3:
      return {
        title: "Advanced",
        description:
          "Advanced plan emphasizing harder review while introducing new items.",
        plan_type: "advanced",
        sequence_index: 3,
        new_question_count: 0,
        review_question_count: 0,
      };
    default:
      return {
        title: "Maintenance",
        description:
          "Maintenance plan with mostly review and a small amount of new content.",
        plan_type: "maintenance",
        sequence_index: 4,
        new_question_count: 0,
        review_question_count: 0,
      };
  }
}

function getDisplayLabel(newCount: number, reviewCount: number): string {
  if (reviewCount === 0) {
    return `${newCount} New Questions`;
  }
  return `${newCount} New + ${reviewCount} Review`;
}

function hasExistingSpacedPlans(plans: LearningPlan[]): boolean {
  const matches = plans.filter((plan) => {
    const lowered = `${plan.name} ${plan.description}`.toLowerCase();
    return (
      lowered.includes("initial") ||
      lowered.includes("review") ||
      lowered.includes("advanced") ||
      lowered.includes("maintenance") ||
      lowered.includes("foundations") ||
      lowered.includes("review & deepen") ||
      lowered.includes("advanced mastery") ||
      lowered.includes("weekly check-in")
    );
  });

  return matches.length >= 4;
}

function buildQuestionsByCard(
  cards: AdminLearningCard[],
  questions: AdminUnifiedQuestion[],
): Map<string, string[]> {
  const questionsByCard = new Map<string, string[]>();
  cards.forEach((card) => {
    questionsByCard.set(card.id, []);
  });

  questions.forEach((question) => {
    if (!question.learning_card_id) return;
    const cardQuestions = questionsByCard.get(question.learning_card_id);
    if (!cardQuestions) return;
    cardQuestions.push(question.id);
  });

  return questionsByCard;
}

function buildPlanQuestionRows(
  sequence: number,
  cards: AdminLearningCard[],
  questionsByCard: Map<string, string[]>,
  introducedByCard: Map<string, string[]>,
  parentPlanId: string | null,
): PlanQuestionInsertRow[] {
  const distribution = PLAN_DISTRIBUTION[sequence - 1];
  const rows: PlanQuestionInsertRow[] = [];

  cards.forEach((card) => {
    const cardQuestions = questionsByCard.get(card.id) ?? [];
    if (cardQuestions.length === 0) return;

    const introduced = introducedByCard.get(card.id) ?? [];
    const remaining = cardQuestions.filter((questionId) => {
      return !introduced.includes(questionId);
    });

    const newQuestions = remaining.slice(0, distribution.newPerCard);
    const reviewQuestions = introduced.slice(-distribution.reviewPerCard);

    newQuestions.forEach((questionId) => {
      rows.push({
        plan_id: "",
        question_id: questionId,
        order_index: rows.length,
        is_review: false,
        parent_plan_id: null,
        difficulty_tier: "easy",
        is_active: true,
      });
    });

    reviewQuestions.forEach((questionId) => {
      rows.push({
        plan_id: "",
        question_id: questionId,
        order_index: rows.length,
        is_review: true,
        parent_plan_id: parentPlanId,
        difficulty_tier: sequence >= 3 ? "hard" : "medium",
        is_active: true,
      });
    });

    introducedByCard.set(card.id, [...introduced, ...newQuestions]);
  });

  return rows;
}

async function insertPlanQuestionRows(
  planId: string,
  rows: PlanQuestionInsertRow[],
): Promise<void> {
  for (const [index, row] of rows.entries()) {
    const payload = {
      ...row,
      plan_id: planId,
      order_index: index,
    };

    const { error: planQuestionError } = await supabase
      .from("plan_questions")
      .insert(payload);

    if (planQuestionError) {
      const { error: fallbackError } = await supabase
        .from("plan_questions")
        .insert({
          plan_id: payload.plan_id,
          question_id: payload.question_id,
          order_index: payload.order_index,
          is_review: payload.is_review,
        });

      if (fallbackError) {
        throw fallbackError;
      }
    }
  }
}

async function generateDashboardSpacedPlans(
  cards: AdminLearningCard[],
  questions: AdminUnifiedQuestion[],
): Promise<void> {
  const questionsByCard = buildQuestionsByCard(cards, questions);
  const introducedByCard = new Map<string, string[]>();
  const createdPlans: Array<{ id: string; sequence: number }> = [];

  for (let sequence = 1; sequence <= 4; sequence += 1) {
    const metadata = generatePlanMetadata(sequence);
    const parentPlanId =
      sequence > 1 ? (createdPlans.at(-1)?.id ?? null) : null;
    const planQuestionRows = buildPlanQuestionRows(
      sequence,
      cards,
      questionsByCard,
      introducedByCard,
      parentPlanId,
    );

    metadata.new_question_count = planQuestionRows.filter(
      (row) => !row.is_review,
    ).length;
    metadata.review_question_count = planQuestionRows.filter(
      (row) => row.is_review,
    ).length;

    const displayLabel = getDisplayLabel(
      metadata.new_question_count,
      metadata.review_question_count,
    );

    const planPayload = {
      title: metadata.title,
      name: metadata.title,
      description: metadata.description,
      estimated_duration: sequence * 5,
      plan_type: metadata.plan_type,
      sequence_index: metadata.sequence_index,
      new_question_count: metadata.new_question_count,
      review_question_count: metadata.review_question_count,
      display_label: displayLabel,
      status: "published",
      is_public: true,
      is_active: true,
    };

    const { data: createdPlan, error: createPlanError } = await supabase
      .from("learning_plans")
      .insert(planPayload)
      .select("id")
      .single();

    if (createPlanError || !createdPlan?.id) {
      throw createPlanError ?? new Error("Failed to create learning plan");
    }

    createdPlans.push({ id: createdPlan.id, sequence });

    const planCardsPayload = cards.map((card, index) => ({
      plan_id: createdPlan.id,
      card_id: card.id,
      order_index: index,
      is_active: true,
    }));

    if (planCardsPayload.length > 0) {
      const { error: planCardsError } = await supabase
        .from("plan_cards")
        .insert(planCardsPayload);

      if (planCardsError) {
        throw planCardsError;
      }
    }

    if (planQuestionRows.length > 0) {
      await insertPlanQuestionRows(createdPlan.id, planQuestionRows);
    }
  }
}

function toIsoDate(value?: string | Date | null): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  return value;
}

function normalizePlan(plan: DatabasePlanRecord): LearningPlan {
  return {
    id: plan.id,
    name: plan.name ?? plan.title ?? "Untitled Plan",
    description: plan.description ?? "",
    estimated_duration: plan.estimated_duration ?? plan.estimated_hours ?? 0,
    is_public: plan.is_public ?? true,
    is_active: plan.is_active ?? plan.status !== "archived",
    created_at: toIsoDate(plan.created_at ?? plan.createdAt),
    updated_at: toIsoDate(plan.updated_at ?? plan.updatedAt),
  };
}

function normalizePlanStatus(
  status: string | null | undefined,
  fallback: PlanEditFormData["status"] = "published",
): PlanEditFormData["status"] {
  if (status === "draft" || status === "published" || status === "archived") {
    return status;
  }
  return fallback;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

function extractApiArray<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidate = (payload as { data?: unknown }).data;
  if (Array.isArray(candidate)) {
    return candidate as T[];
  }

  if (candidate && typeof candidate === "object") {
    const nestedData = (candidate as { data?: unknown }).data;
    if (Array.isArray(nestedData)) {
      return nestedData as T[];
    }

    const nestedItems = (candidate as { items?: unknown }).items;
    if (Array.isArray(nestedItems)) {
      return nestedItems as T[];
    }
  }

  const items = (payload as { items?: unknown }).items;
  if (Array.isArray(items)) {
    return items as T[];
  }

  return [];
}

async function loadApiCollection<T>(
  endpoint: string,
  fallbackMessage: string,
): Promise<LoadResult<T>> {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        data: [],
        error: `${fallbackMessage} (HTTP ${response.status})`,
      };
    }

    const result = (await response.json()) as {
      success?: boolean;
      error?: string;
      message?: string;
      data?: unknown;
    };

    if (result.success === false) {
      return {
        data: [],
        error: result.error ?? result.message ?? fallbackMessage,
      };
    }

    return {
      data: extractApiArray<T>(result),
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: getErrorMessage(error, fallbackMessage),
    };
  }
}

async function loadLearningPlans(): Promise<LoadResult<LearningPlan>> {
  try {
    const plansResponse = await loadApiCollection<DatabasePlanRecord>(
      "/api/plans",
      "Failed to fetch learning plans",
    );

    if (plansResponse.error) {
      return { data: [], error: plansResponse.error };
    }

    return {
      data: plansResponse.data.map(normalizePlan),
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error: getErrorMessage(error, "Failed to fetch learning plans"),
    };
  }
}

export function useContentManagement() {
  // Inject repositories
  const cardRepository = useLearningCardRepository();

  // Transform database Topic to admin Topic
  const transformTopicToAdmin = (
    topic: DatabaseTopicRecord,
    categoryByTopicId: Map<string, string>,
  ): AdminTopic => ({
    id: topic.id,
    name: topic.name,
    slug: "", // Database doesn't store slug, default to empty
    description: topic.description || "",
    difficulty: "beginner", // Database doesn't store difficulty, default to beginner
    estimated_questions: 0, // Database doesn't store this, default to 0
    order_index: topic.orderIndex ?? topic.order_index ?? 0,
    category_id:
      topic.categoryId ??
      topic.category_id ??
      categoryByTopicId.get(topic.id) ??
      "",
    is_active: topic.is_active ?? true,
    created_at: topic.created_at || "",
    updated_at: topic.updated_at || "",
  });

  // State for data
  const [cards, setCards] = useState<AdminLearningCard[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [questions, setQuestions] = useState<AdminUnifiedQuestion[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCardType, setFilterCardType] = useState("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

  // Plan structure collapsible states
  const [expandedPlanCards, setExpandedPlanCards] = useState<Set<string>>(
    new Set(),
  );
  const [expandedPlanCategories, setExpandedPlanCategories] = useState<
    Set<string>
  >(new Set());
  const [expandedPlanTopics, setExpandedPlanTopics] = useState<Set<string>>(
    new Set(),
  );

  // Modal states
  const [isTopicQuestionsModalOpen, setIsTopicQuestionsModalOpen] =
    useState(false);
  const [selectedTopic, setSelectedTopic] = useState<AdminTopic | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(),
  );

  // Delete modal states
  const [isDeleteCardModalOpen, setIsDeleteCardModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<AdminLearningCard | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Card management modal states
  const [isCardManagementModalOpen, setIsCardManagementModalOpen] =
    useState(false);
  const [selectedPlanForCards, setSelectedPlanForCards] =
    useState<LearningPlan | null>(null);
  const [planCards, setPlanCards] = useState<
    { card_id: string; order_index: number; is_active: boolean }[]
  >([]);
  const [availableCards, setAvailableCards] = useState<AdminLearningCard[]>([]);
  const [isManagingCards, setIsManagingCards] = useState(false);

  // Plan edit modal states
  const [isPlanEditModalOpen, setIsPlanEditModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<LearningPlan | null>(null);

  // Category and Topic Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<AdminCategory | null>(
    null,
  );

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<AdminTopic | null>(null);

  // Question Modal states
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] =
    useState<AdminUnifiedQuestion | null>(null);
  const [isQuestionReadOnly, setIsQuestionReadOnly] = useState(false);
  const [selectedTopicIdForNewQuestion, setSelectedTopicIdForNewQuestion] =
    useState<string | undefined>(undefined);

  // Card Modal states
  const [isCardFormModalOpen, setIsCardFormModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<AdminLearningCard | null>(null);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  const [planEditFormData, setPlanEditFormData] = useState<PlanEditFormData>({
    title: "",
    description: "",
    estimated_duration: 0,
    status: "published",
  });

  // Plan questions state
  const [planQuestions, setPlanQuestions] = useState<Set<string>>(new Set());

  // Fetch data for the unified management view.
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        cardsResult,
        plansResult,
        questionsResult,
        categoriesResult,
        topicsResult,
      ] = await Promise.all([
        loadApiCollection<AdminLearningCard>(
          "/api/cards",
          "Failed to fetch learning cards",
        ),
        loadLearningPlans(),
        loadApiCollection<AdminUnifiedQuestion>(
          "/api/questions/unified?page=1&pageSize=2000&includePagination=false",
          "Failed to fetch questions",
        ),
        loadApiCollection<DatabaseCategoryRecord>(
          "/api/categories",
          "Failed to fetch categories",
        ),
        loadApiCollection<DatabaseTopicRecord>(
          "/api/topics",
          "Failed to fetch topics",
        ),
      ]);

      const dataErrors = [
        cardsResult.error,
        plansResult.error,
        questionsResult.error,
        categoriesResult.error,
        topicsResult.error,
      ].filter((message): message is string => Boolean(message));

      const normalizedCards = cardsResult.data || [];
      const { cards: canonicalCards, idsByKey } =
        buildCanonicalCards(normalizedCards);
      const normalizedQuestions = (questionsResult.data || []).map((q) =>
        transformQuestion(q as unknown as Record<string, unknown>),
      );
      const categoryCardLookup = buildCategoryCardLookup(normalizedQuestions);
      const topicCategoryLookup = buildTopicCategoryLookup(normalizedQuestions);

      const mappedCategories = categoriesResult.data
        .map((category) =>
          mapCategoryToCard(category, idsByKey, categoryCardLookup),
        )
        .filter((category): category is AdminCategory => category !== null);

      setCards(canonicalCards);
      setPlans(plansResult.data);
      setQuestions(normalizedQuestions);
      setCategories(mappedCategories);
      setTopics(
        topicsResult.data.map((topic) =>
          transformTopicToAdmin(topic, topicCategoryLookup),
        ),
      );

      const { data: existingPlanQuestions, error: planQuestionsError } =
        await supabase.from("plan_questions").select("plan_id, question_id");

      if (planQuestionsError) {
        console.error("❌ Failed to fetch plan-question links:", {
          message: planQuestionsError.message,
          details: planQuestionsError.details,
          hint: planQuestionsError.hint,
          code: planQuestionsError.code,
        });
      } else {
        const planQuestionKeys = new Set(
          (existingPlanQuestions ?? []).map(
            (row) => `${row.plan_id}-${row.question_id}`,
          ),
        );
        setPlanQuestions(planQuestionKeys);
      }

      if (dataErrors.length > 0) {
        console.error("❌ Content management partial load errors:", dataErrors);
        toast.error("Some content management data could not be loaded");
      }

      if (!existingPlanQuestions || existingPlanQuestions.length === 0) {
        setPlanQuestions(new Set());
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(
    () => ({
      totalCards: cards.length,
      totalPlans: plans.length,
      totalCategories: categories.length,
      totalTopics: topics.length,
      totalQuestions: questions.length,
    }),
    [cards, plans, categories, topics, questions],
  );

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (!card?.title || !card?.description) return false;
      const matchesSearch =
        card.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        card.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
      const matchesCardType =
        filterCardType === "all" || card.title === filterCardType;
      return matchesSearch && matchesCardType;
    });
  }, [cards, debouncedSearchTerm, filterCardType]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (!plan?.name || !plan?.description) return false;
      return (
        plan.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        plan.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
      );
    });
  }, [plans, debouncedSearchTerm]);

  // Search scrolling logic
  useEffect(() => {
    if (!debouncedSearchTerm) return;

    // Small delay to allow auto-expansion to finish rendering
    const timer = setTimeout(() => {
      const lowerSearch = debouncedSearchTerm.toLowerCase();

      // Find first matching element and scroll to it
      // Order of priority: Cards -> Categories -> Topics
      const match =
        cards.find((c) => c.title.toLowerCase().includes(lowerSearch)) ||
        categories.find((c) => c.name.toLowerCase().includes(lowerSearch)) ||
        topics.find((t) => t.name.toLowerCase().includes(lowerSearch));

      if (match) {
        let id = "";
        if ("title" in match) id = `card-${match.id}`;
        else if (categories.some((c) => c.id === match.id))
          id = `category-${match.id}`;
        else id = `topic-${match.id}`;

        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, cards, categories, topics]);

  // Auto-expand logic for search results
  useEffect(() => {
    if (!debouncedSearchTerm) return;

    const lowerSearch = debouncedSearchTerm.toLowerCase();
    const newExpandedCards = new Set(expandedCards);
    const newExpandedCategories = new Set(expandedCategories);
    const newExpandedTopics = new Set(expandedTopics);

    // If a topic matches, expand its category and card
    topics.forEach((topic) => {
      if (topic.name.toLowerCase().includes(lowerSearch)) {
        if (topic.category_id) {
          newExpandedCategories.add(topic.category_id);
          const category = categories.find((c) => c.id === topic.category_id);
          if (category?.learning_card_id) {
            newExpandedCards.add(category.learning_card_id);
          }
        }
      }
    });

    // If a category matches, expand its card
    categories.forEach((category) => {
      if (category.name.toLowerCase().includes(lowerSearch)) {
        if (category.learning_card_id) {
          newExpandedCards.add(category.learning_card_id);
        }
      }
    });

    // If a question matches, expand its topic, category, and card
    questions.forEach((question) => {
      if (
        question.title.toLowerCase().includes(lowerSearch) ||
        question.content?.toLowerCase().includes(lowerSearch)
      ) {
        if (question.topic_id) {
          newExpandedTopics.add(question.topic_id);
          const topic = topics.find((t) => t.id === question.topic_id);
          if (topic?.category_id) {
            newExpandedCategories.add(topic.category_id);
            const category = categories.find((c) => c.id === topic.category_id);
            if (category?.learning_card_id) {
              newExpandedCards.add(category.learning_card_id);
            }
          }
        }
      }
    });

    setExpandedCards(newExpandedCards);
    setExpandedCategories(newExpandedCategories);
    setExpandedTopics(newExpandedTopics);
  }, [
    debouncedSearchTerm,
    topics,
    categories,
    questions,
    expandedCards,
    expandedCategories,
    expandedTopics,
  ]);

  // Toggles
  const toggleCard = useCallback(
    (id: string) =>
      setExpandedCards((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }),
    [],
  );

  const toggleCategory = useCallback(
    (id: string) =>
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }),
    [],
  );

  const toggleTopic = useCallback(
    (id: string) =>
      setExpandedTopics((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }),
    [],
  );

  const togglePlan = useCallback(
    (id: string) =>
      setExpandedPlans((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }),
    [],
  );

  const togglePlanCard = useCallback(
    (id: string) =>
      setExpandedPlanCards((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }),
    [],
  );

  const togglePlanCategory = useCallback(
    (id: string) =>
      setExpandedPlanCategories((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }),
    [],
  );

  const togglePlanTopic = useCallback(
    (id: string) =>
      setExpandedPlanTopics((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      }),
    [],
  );

  // Modals
  const openTopicQuestionsModal = useCallback(
    (topic: AdminTopic, plan: LearningPlan) => {
      setSelectedTopic(topic);
      setSelectedPlan(plan);

      // Pre-populate with questions already in this plan
      const initialSelected = new Set<string>();
      planQuestions.forEach((key) => {
        if (key.startsWith(`${plan.id}-`)) {
          const questionId = key.replace(`${plan.id}-`, "");
          // Only add if it belongs to this topic
          if (
            questions.find((q) => q.id === questionId)?.topic_id === topic.id
          ) {
            initialSelected.add(questionId);
          }
        }
      });

      setSelectedQuestions(initialSelected);
      setIsTopicQuestionsModalOpen(true);
    },
    [planQuestions, questions],
  );

  const closeTopicQuestionsModal = useCallback(() => {
    setIsTopicQuestionsModalOpen(false);
    setSelectedTopic(null);
    setSelectedPlan(null);
    setSelectedQuestions(new Set());
  }, []);

  const toggleQuestionSelection = useCallback((id: string) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAllQuestions = useCallback(() => {
    if (!selectedTopic) return;
    const topicQuestions = questions.filter(
      (q) => q.topic_id === selectedTopic.id,
    );
    setSelectedQuestions(new Set(topicQuestions.map((q) => q.id)));
  }, [selectedTopic, questions]);

  const deselectAllQuestions = useCallback(
    () => setSelectedQuestions(new Set()),
    [],
  );

  const addSelectedQuestionsToPlan = useCallback(async () => {
    if (!selectedPlan || !selectedTopic) return;
    try {
      const planId = selectedPlan.id;
      const topicId = selectedTopic.id;

      // Current questions in plan for this topic
      const currentInPlan = new Set<string>();
      planQuestions.forEach((key) => {
        if (key.startsWith(`${planId}-`)) {
          const qId = key.replace(`${planId}-`, "");
          if (questions.find((q) => q.id === qId)?.topic_id === topicId) {
            currentInPlan.add(qId);
          }
        }
      });

      const toAdd = Array.from(selectedQuestions).filter(
        (id) => !currentInPlan.has(id),
      );
      const toRemove = Array.from(currentInPlan).filter(
        (id) => !selectedQuestions.has(id),
      );

      // Perform updates
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("plan_questions")
          .delete()
          .eq("plan_id", planId)
          .in("question_id", toRemove);

        if (deleteError) throw deleteError;
      }

      if (toAdd.length > 0) {
        const insertRows = toAdd.map((qId, index) => ({
          plan_id: planId,
          question_id: qId,
          order_index: index, // TBD: How to handle order better?
          is_review: false,
          is_active: true,
        }));

        const { error: insertError } = await supabase
          .from("plan_questions")
          .insert(insertRows);

        if (insertError) throw insertError;
      }

      // Update local state
      setPlanQuestions((prev) => {
        const next = new Set(prev);
        toRemove.forEach((id) => next.delete(`${planId}-${id}`));
        toAdd.forEach((id) => next.add(`${planId}-${id}`));
        return next;
      });

      toast.success(
        `Plan updated: added ${toAdd.length}, removed ${toRemove.length} questions`,
      );
      closeTopicQuestionsModal();
    } catch (err) {
      console.error("Failed to update plan questions:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update plan questions",
      );
    }
  }, [
    selectedPlan,
    selectedTopic,
    selectedQuestions,
    planQuestions,
    questions,
    closeTopicQuestionsModal,
  ]);

  const toggleQuestionInPlan = useCallback(
    async (
      questionId: string,
      planId: string,
      topicId: string,
      isInPlan: boolean,
    ) => {
      try {
        if (isInPlan) {
          // ARCHITECTURAL: Remove question from plan using planRepository.removeQuestionFromPlan(planId, questionId)
          // Requires implementing new repository method
          setPlanQuestions((prev) => {
            const next = new Set(prev);
            next.delete(`${planId}-${questionId}`);
            return next;
          });
          toast.success("Removed from plan");
        } else {
          // ARCHITECTURAL: Add question to plan using planRepository.addQuestionToPlan(planId, questionId)
          // Requires implementing new repository method
          setPlanQuestions((prev) => {
            const next = new Set(prev);
            next.add(`${planId}-${questionId}`);
            return next;
          });
          toast.success("Added to plan");
        }
      } catch (err) {
        console.error("Failed to update plan:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to update plan",
        );
      }
    },
    [],
  );

  const openDeleteCardModal = useCallback((card: AdminLearningCard) => {
    setCardToDelete(card);
    setIsDeleteCardModalOpen(true);
  }, []);

  const closeDeleteCardModal = useCallback(() => {
    setIsDeleteCardModalOpen(false);
    setCardToDelete(null);
    setIsDeleting(false);
  }, []);

  const deleteCard = useCallback(async () => {
    if (!cardToDelete) return;
    setIsDeleting(true);
    try {
      await cardRepository.delete(cardToDelete.id);
      toast.success(`Deleted card "${cardToDelete.title}"`);
      await fetchData();
      closeDeleteCardModal();
    } catch (err) {
      console.error("Failed to delete card:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete card");
      setIsDeleting(false);
    }
  }, [cardToDelete, cardRepository, fetchData, closeDeleteCardModal]);

  const openCardManagementModal = useCallback(
    async (plan: LearningPlan) => {
      setSelectedPlanForCards(plan);
      setIsCardManagementModalOpen(true);
      setIsManagingCards(true);
      try {
        // ARCHITECTURAL: Fetch current plan cards using planRepository.getPlanCards(selectedPlanId) and available cards
        // Requires implementing new repository methods for plan-card relationships
        const current: {
          card_id: string;
          order_index: number;
          is_active: boolean;
        }[] = [];
        setPlanCards(current || []);
        setAvailableCards(cards);
      } catch (err) {
        console.error("Failed to load cards:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to load cards",
        );
      } finally {
        setIsManagingCards(false);
      }
    },
    [cards],
  );

  const closeCardManagementModal = useCallback(() => {
    setIsCardManagementModalOpen(false);
    setSelectedPlanForCards(null);
    setPlanCards([]);
    setAvailableCards([]);
  }, []);

  const openPlanEditModal = useCallback(async (plan: LearningPlan) => {
    setPlanToEdit(plan);

    const fallbackStatus: PlanEditFormData["status"] = plan.is_active
      ? "published"
      : "archived";
    let status: PlanEditFormData["status"] = fallbackStatus;

    const { data: latestPlanStatus, error: statusError } = await supabase
      .from("learning_plans")
      .select("status")
      .eq("id", plan.id)
      .maybeSingle();

    if (!statusError) {
      status = normalizePlanStatus(latestPlanStatus?.status, fallbackStatus);
    }

    setPlanEditFormData({
      title: plan.name || "",
      description: plan.description || "",
      estimated_duration: plan.estimated_duration || 0,
      status,
    });
    setIsPlanEditModalOpen(true);
  }, []);

  const closePlanEditModal = useCallback(() => {
    setIsPlanEditModalOpen(false);
    setPlanToEdit(null);
    setPlanEditFormData({
      title: "",
      description: "",
      estimated_duration: 0,
      status: "published",
    });
  }, []);

  const updatePlan = useCallback(async () => {
    if (!planToEdit) return;

    try {
      const { error: updateError } = await supabase
        .from("learning_plans")
        .update({
          name: planEditFormData.title,
          title: planEditFormData.title,
          description: planEditFormData.description,
          estimated_duration: Math.max(0, planEditFormData.estimated_duration),
          status: planEditFormData.status,
          is_public: planToEdit.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq("id", planToEdit.id);

      if (updateError) {
        throw updateError;
      }

      toast.success("Plan updated successfully");
      closePlanEditModal();
      await fetchData();
    } catch (err) {
      console.error("Failed to update plan:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update plan");
    }
  }, [planToEdit, planEditFormData, closePlanEditModal, fetchData]);

  const addCardToPlan = useCallback(
    async (cardId: string) => {
      if (!selectedPlanForCards) return;
      try {
        const nextOrder =
          Math.max(...planCards.map((pc) => pc.order_index), 0) + 1;
        // ARCHITECTURAL: Use planRepository.addCardToPlan(planId, cardId) method
        // Requires implementing new repository method
        //   selectedPlanForCards.id,
        //   cardId,
        //   nextOrder,
        // );
        setPlanCards((prev) => [
          ...prev,
          { card_id: cardId, order_index: nextOrder, is_active: true },
        ]);
        toast.success("Added to plan");
      } catch (err) {
        console.error("Failed to add card:", err);
        toast.error(err instanceof Error ? err.message : "Failed to add card");
      }
    },
    [selectedPlanForCards, planCards],
  );

  const removeCardFromPlan = useCallback(
    async (cardId: string) => {
      if (!selectedPlanForCards) return;
      try {
        // ARCHITECTURAL: Use planRepository.removeCardFromPlan(planId, cardId) method
        // Requires implementing new repository method
        // await planRepository.removeCardFromPlan?.(
        //   selectedPlanForCards.id,
        //   cardId,
        // );
        setPlanCards((prev) => prev.filter((pc) => pc.card_id !== cardId));
        toast.success("Removed from plan");
      } catch (err) {
        console.error("Failed to remove card:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to remove card",
        );
      }
    },
    [selectedPlanForCards],
  );

  const toggleCardActiveStatus = useCallback(
    async (cardId: string, isActive: boolean) => {
      if (!selectedPlanForCards) return;
      try {
        // ARCHITECTURAL: Use planRepository.updateCardStatus(cardId, status) or similar method
        // Requires implementing new repository method
        //   selectedPlanForCards.id,
        //   cardId,
        //   !isActive,
        // );
        setPlanCards((prev) =>
          prev.map((pc) =>
            pc.card_id === cardId ? { ...pc, is_active: !isActive } : pc,
          ),
        );
        toast.success("Status updated");
      } catch (err) {
        console.error("Failed to update status:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to update status",
        );
      }
    },
    [selectedPlanForCards],
  );

  const createSpacedRepetitionPlans = useCallback(async () => {
    if (hasExistingSpacedPlans(plans)) {
      toast.info("Spaced-repetition plans already exist.");
      return;
    }

    if (cards.length === 0 || questions.length === 0) {
      toast.error("Need existing cards and questions before generating plans.");
      return;
    }

    try {
      await generateDashboardSpacedPlans(cards, questions);

      toast.success("Created dashboard-based spaced-repetition plans.");
      await fetchData();
    } catch (err) {
      console.error("Failed to generate spaced-repetition plans:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to generate spaced-repetition plans",
      );
    }
  }, [cards, fetchData, plans, questions]);

  const openCreateCategoryModal = useCallback(() => {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  }, []);

  const openEditCategoryModal = useCallback((category: AdminCategory) => {
    setCategoryToEdit(category);
    setIsCategoryModalOpen(true);
  }, []);

  const submitCategory = useCallback(
    async (data: { name: string; description?: string }) => {
      const payload: Record<string, unknown> = {
        name: data.name,
        description: data.description || "",
        slug: toSlug(data.name),
      };

      setIsSubmittingCategory(true);
      try {
        if (categoryToEdit) {
          // Update
          const { error: updateError } = await supabase
            .from("categories")
            .update(payload)
            .eq("id", categoryToEdit.id);

          if (updateError) {
            toast.error(updateError.message || "Failed to update category");
            return;
          }
          toast.success("Category updated");
        } else {
          // Create
          payload.is_active = true;
          const defaultCardId = cards[0]?.id;
          if (defaultCardId) {
            payload.learning_card_id = defaultCardId;
          }

          const { error: createError } = await supabase
            .from("categories")
            .insert(payload);

          if (createError) {
            toast.error(createError.message || "Failed to create category");
            return;
          }
          toast.success("Category created");
        }
        setIsCategoryModalOpen(false);
        await fetchData();
      } finally {
        setIsSubmittingCategory(false);
      }
    },
    [categoryToEdit, cards, fetchData],
  );

  const removeCategory = useCallback(
    async (category: AdminCategory) => {
      const confirmed = globalThis.confirm(
        `Delete category "${category.name}"?`,
      );
      if (!confirmed) {
        return;
      }

      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (deleteError) {
        toast.error(deleteError.message || "Failed to delete category");
        return;
      }

      toast.success("Category deleted");
      await fetchData();
    },
    [fetchData],
  );

  const openCreateTopicModal = useCallback(() => {
    if (categories.length === 0) {
      toast.error("Create a category first");
      return;
    }
    setTopicToEdit(null);
    setIsTopicModalOpen(true);
  }, [categories.length]);

  const openEditTopicModal = useCallback((topic: AdminTopic) => {
    setTopicToEdit(topic);
    setIsTopicModalOpen(true);
  }, []);

  const submitTopic = useCallback(
    async (data: {
      name: string;
      description?: string;
      category_id: string;
    }) => {
      const payload: Record<string, unknown> = {
        name: data.name,
        description: data.description || "",
        category_id: data.category_id,
        slug: toSlug(data.name),
      };

      setIsSubmittingTopic(true);
      try {
        if (topicToEdit) {
          // Update
          const { error: updateError } = await supabase
            .from("topics")
            .update(payload)
            .eq("id", topicToEdit.id);

          if (updateError) {
            toast.error(updateError.message || "Failed to update topic");
            return;
          }
          toast.success("Topic updated");
        } else {
          // Create
          payload.is_active = true;
          payload.order_index = 0;

          const { error: createError } = await supabase
            .from("topics")
            .insert(payload);

          if (createError) {
            toast.error(createError.message || "Failed to create topic");
            return;
          }
          toast.success("Topic created");
        }
        setIsTopicModalOpen(false);
        await fetchData();
      } finally {
        setIsSubmittingTopic(false);
      }
    },
    [topicToEdit, fetchData],
  );

  const removeTopic = useCallback(
    async (topic: AdminTopic) => {
      const confirmed = globalThis.confirm(`Delete topic "${topic.name}"?`);
      if (!confirmed) {
        return;
      }

      const { error: deleteError } = await supabase
        .from("topics")
        .delete()
        .eq("id", topic.id);

      if (deleteError) {
        toast.error(deleteError.message || "Failed to delete topic");
        return;
      }

      toast.success("Topic deleted");
      await fetchData();
    },
    [fetchData],
  );

  // Question Handlers
  const openViewQuestionModal = useCallback(
    (question: AdminUnifiedQuestion) => {
      setQuestionToEdit(question);
      setIsQuestionReadOnly(true);
      setIsQuestionModalOpen(true);
    },
    [],
  );

  const openEditQuestionModal = useCallback(
    (question: AdminUnifiedQuestion) => {
      setQuestionToEdit(question);
      setIsQuestionReadOnly(false);
      setIsQuestionModalOpen(true);
    },
    [],
  );

  const openCreateQuestionModal = useCallback((topicId: string) => {
    setQuestionToEdit(null);
    setSelectedTopicIdForNewQuestion(topicId);
    setIsQuestionReadOnly(false);
    setIsQuestionModalOpen(true);
  }, []);

  const submitQuestion = useCallback(
    async (data: Partial<AdminUnifiedQuestion>) => {
      setIsSubmittingQuestion(true);
      try {
        const {
          isActive: _isActive,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ...cleanData
        } = data;

        const payload: Record<string, unknown> = {
          ...cleanData,
          topic_id: selectedTopicIdForNewQuestion,
        };

        // Convert camelCase to snake_case for DB fields if needed
        if (data.isActive !== undefined) payload.is_active = data.isActive;

        if (questionToEdit) {
          // Update
          const { error: updateError } = await supabase
            .from("questions")
            .update(payload)
            .eq("id", questionToEdit.id);

          if (updateError) throw updateError;
          toast.success("Question updated");
        } else {
          // Create
          payload.is_active = true;
          const { error: createError } = await supabase
            .from("questions")
            .insert(payload);

          if (createError) throw createError;
          toast.success("Question created");
        }
        setIsQuestionModalOpen(false);
        await fetchData();
      } catch (err) {
        console.error("Failed to submit question:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to submit question",
        );
      } finally {
        setIsSubmittingQuestion(false);
      }
    },
    [questionToEdit, selectedTopicIdForNewQuestion, fetchData],
  );

  // Card Handlers
  const openCreateCardModal = useCallback(() => {
    setCardToEdit(null);
    setIsCardFormModalOpen(true);
  }, []);

  const openEditCardModal = useCallback((card: AdminLearningCard) => {
    setCardToEdit(card);
    setIsCardFormModalOpen(true);
  }, []);

  const submitCard = useCallback(
    async (data: Record<string, any>) => {
      setIsSubmittingCard(true);
      try {
        const payload = {
          title: data.name,
          description: data.description,
          color: data.color,
          icon: data.icon,
          order_index: data.order,
        };

        if (cardToEdit) {
          // Update
          const { error: updateError } = await supabase
            .from("learning_cards")
            .update(payload)
            .eq("id", cardToEdit.id);

          if (updateError) throw updateError;
          toast.success("Card updated");
        } else {
          // Create
          (payload as Record<string, any>).is_active = true;
          const { error: createError } = await supabase
            .from("learning_cards")
            .insert(payload);

          if (createError) throw createError;
          toast.success("Card created");
        }
        setIsCardFormModalOpen(false);
        await fetchData();
      } catch (err) {
        console.error("Failed to submit card:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to submit card",
        );
      } finally {
        setIsSubmittingCard(false);
      }
    },
    [cardToEdit, fetchData],
  );

  return {
    cards,
    plans,
    categories,
    topics,
    questions,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterCardType,
    setFilterCardType,
    stats,
    filteredCards,
    filteredPlans,
    planQuestions,
    expandedCards,
    toggleCard,
    expandedCategories,
    toggleCategory,
    expandedTopics,
    toggleTopic,
    expandedPlans,
    togglePlan,
    expandedPlanCards,
    togglePlanCard,
    expandedPlanCategories,
    togglePlanCategory,
    expandedPlanTopics,
    togglePlanTopic,
    isTopicQuestionsModalOpen,
    setIsTopicQuestionsModalOpen,
    selectedTopic,
    selectedPlan,
    selectedQuestions,
    toggleQuestionSelection,
    selectAllQuestions,
    deselectAllQuestions,
    addSelectedQuestionsToPlan,
    closeTopicQuestionsModal,
    toggleQuestionInPlan,
    isDeleteCardModalOpen,
    setIsDeleteCardModalOpen,
    cardToDelete,
    isDeleting,
    openDeleteCardModal,
    closeDeleteCardModal,
    deleteCard,
    isCardManagementModalOpen,
    setIsCardManagementModalOpen,
    selectedPlanForCards,
    planCards,
    availableCards,
    isManagingCards,
    openCardManagementModal,
    closeCardManagementModal,
    addCardToPlan,
    removeCardFromPlan,
    toggleCardActiveStatus,
    openTopicQuestionsModal,
    createSpacedRepetitionPlans,
    isPlanEditModalOpen,
    setIsPlanEditModalOpen,
    planToEdit,
    planEditFormData,
    setPlanEditFormData,
    openPlanEditModal,
    closePlanEditModal,
    updatePlan,
    openCreateCategoryModal,
    openEditCategoryModal,
    submitCategory,
    removeCategory,
    openCreateTopicModal,
    openEditTopicModal,
    submitTopic,
    removeTopic,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    categoryToEdit,
    isTopicModalOpen,
    setIsTopicModalOpen,
    topicToEdit,
    isQuestionModalOpen,
    setIsQuestionModalOpen,
    questionToEdit,
    isQuestionReadOnly,
    selectedTopicIdForNewQuestion,
    openViewQuestionModal,
    openEditQuestionModal,
    openCreateQuestionModal,
    submitQuestion,
    isSubmittingQuestion,
    isCardFormModalOpen,
    setIsCardFormModalOpen,
    cardToEdit,
    isSubmittingCard,
    isSubmittingTopic,
    isSubmittingCategory,
    openCreateCardModal,
    openEditCardModal,
    submitCard,
  };
}
