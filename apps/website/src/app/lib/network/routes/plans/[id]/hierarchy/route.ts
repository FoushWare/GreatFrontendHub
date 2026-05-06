// v1.1 - Refactored Plan Hierarchy Route
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../../get-supabase-client";

/**
 * Fetches categories associated with a list of card IDs, handling junction table or direct relationships.
 */
async function fetchCardCategories(supabase: any, cardIds: string[]) {
  try {
    const { data, error } = await supabase
      .from("card_categories")
      .select("*, categories(*)")
      .in("card_id", cardIds)
      .order("order_index", { ascending: true });

    if (!error && data?.length) return data;
  } catch (err) {
    console.warn(
      "card_categories table not found or query failed, falling back to direct categories:",
      err instanceof Error ? err.message : String(err),
    );
  }

  const { data: directCategories, error: dcError } = await supabase
    .from("categories")
    .select("*")
    .in("learning_card_id", cardIds)
    .order("order_index", { ascending: true });

  if (dcError || !directCategories) return [];
  return directCategories.map((cat: any) => ({
    card_id: cat.learning_card_id,
    category_id: cat.id,
    categories: cat,
  }));
}

/**
 * Fetches questions for a list of topic IDs, merging from junction tables and direct relationships.
 */
async function fetchQuestionsForTopics(supabase: any, topicIds: string[]) {
  if (!topicIds.length) return [];
  const questionsMap = new Map<string, any>();

  try {
    const { data: questionTopics } = await supabase
      .from("questions_topics")
      .select("*, questions(*)")
      .in("topic_id", topicIds)
      .order("order_index", { ascending: true });

    questionTopics?.forEach((qt: any) => {
      if (qt.questions)
        questionsMap.set(qt.questions.id, {
          ...qt.questions,
          topic_id: qt.topic_id,
        });
    });
  } catch {
    console.log("questions_topics not found");
  }

  const { data: directQuestions } = await supabase
    .from("questions")
    .select("*")
    .in("topic_id", topicIds)
    .order("created_at", { ascending: true });

  directQuestions?.forEach((q: any) => {
    if (!questionsMap.has(q.id)) questionsMap.set(q.id, q);
  });

  return Array.from(questionsMap.values());
}

/**
 * Resolves total question counts per topic for global context.
 */
async function resolveTopicQuestionCounts(supabase: any, topicIds: string[]) {
  const countsMap = new Map<string, number>();
  if (!topicIds.length) return countsMap;

  const { data } = await supabase
    .from("questions")
    .select("topic_id")
    .in("topic_id", topicIds);
  data?.forEach((q: any) => {
    if (q.topic_id)
      countsMap.set(q.topic_id, (countsMap.get(q.topic_id) || 0) + 1);
  });
  return countsMap;
}

// -----------------------------------------------------------------------------
// Hierarchy Builders
// -----------------------------------------------------------------------------

function _buildCategoryTopics(
  cat: any,
  topicsMap: Map<string, any>,
  questions: any[],
  counts: Map<string, number>,
) {
  const catTopics = Array.from(topicsMap.values()).filter(
    (t) => t.category_id === cat?.id,
  );
  return catTopics.map((topic) => ({
    ...topic,
    questions: questions.filter((q) => q.topic_id === topic.id),
    totalQuestionCount: counts.get(topic.id) || 0,
  }));
}

function _buildCardCategories(
  cardId: string,
  cardCategories: any[],
  topicsMap: Map<string, any>,
  questions: any[],
  counts: Map<string, number>,
) {
  return cardCategories
    .filter((cc: any) => cc.card_id === cardId)
    .map((cc: any) => {
      const cat = cc.categories;
      return {
        ...cat,
        topics: _buildCategoryTopics(cat, topicsMap, questions, counts),
      };
    })
    .filter((c) => c.id);
}

function buildHierarchy(
  planCards: any[],
  cardCategories: any[],
  topicsMap: Map<string, any>,
  questions: any[],
  counts: Map<string, number>,
) {
  return planCards
    .map((pc: any) => {
      const card = pc.learning_cards;
      if (!card) return null;

      const categories = _buildCardCategories(
        pc.card_id,
        cardCategories,
        topicsMap,
        questions,
        counts,
      );

      return { ...card, planCardId: pc.id, categories };
    })
    .filter(Boolean);
}

// -----------------------------------------------------------------------------
// GET Handler
// -----------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: planId } = await params;
    const supabase = getSupabaseClient();

    const { data: planCards, error: pcError } = await supabase
      .from("plan_cards")
      .select("*, learning_cards(*)")
      .eq("plan_id", planId)
      .order("order_index", { ascending: true });

    if (pcError) throw pcError;
    if (!planCards?.length)
      return NextResponse.json({ success: true, data: [] });

    const cardIds = planCards.map((pc) => pc.card_id);
    const cardCategories = await fetchCardCategories(supabase, cardIds);
    const categoryIds = cardCategories.map((cc: any) => cc.category_id);

    const { data: topics } = await supabase
      .from("topics")
      .select("*")
      .in("category_id", categoryIds);
    const topicsMap = new Map(topics?.map((t) => [t.id, t]) || []);
    const topicIds = topics?.map((t) => t.id) || [];

    const [allQuestions, globalCounts] = await Promise.all([
      fetchQuestionsForTopics(supabase, topicIds),
      resolveTopicQuestionCounts(supabase, topicIds),
    ]);

    // Filter by plan_questions
    const { data: planQs } = await supabase
      .from("plan_questions")
      .select("question_id")
      .eq("plan_id", planId);
    const planQIds = new Set(planQs?.map((pq) => pq.question_id) || []);
    const filteredQuestions = allQuestions.filter((q) => planQIds.has(q.id));

    return NextResponse.json({
      success: true,
      data: buildHierarchy(
        planCards,
        cardCategories,
        topicsMap,
        filteredQuestions,
        globalCounts,
      ),
    });
  } catch (error: any) {
    console.error("Error fetching plan hierarchy:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
