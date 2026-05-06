import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseClient,
  validateAndSanitize,
  sanitizeObjectServer,
  sanitizeRichContent,
  getErrorMessage,
  normalizeCodeLineBreaks,
} from "../../index";
import { questionSchema } from "./validation";

// -----------------------------------------------------------------------------
// Constants and Types
// -----------------------------------------------------------------------------

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// In-memory cache for questions (simple implementation)
let _questionsCache: any = null;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Checks if a string is a valid UUID.
 */
function isUuid(str: string): boolean {
  return UUID_REGEX.test(str);
}

/**
 * Generic lookup helper to find an entity ID by name or identifier.
 */
async function _lookupEntityId(
  supabase: any,
  table: string,
  identifier: any,
  searchFields: string[] = ["name"],
  filterField?: string,
  filterValue?: any,
) {
  if (!identifier || typeof identifier !== "string") return null;
  const trimmed = identifier.trim();
  if (isUuid(trimmed)) return trimmed;

  for (const field of searchFields) {
    let query = supabase.from(table).select("id").ilike(field, trimmed);
    if (filterField && filterValue) query = query.eq(filterField, filterValue);

    const { data } = await query.maybeSingle();
    if (data) return data.id;
  }

  return _fallbackIdLookup(supabase, table, trimmed);
}

/**
 * Fallback helper for exact ID match if search fields fail.
 */
async function _fallbackIdLookup(supabase: any, table: string, id: string) {
  const { data } = await supabase
    .from(table)
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (!data) console.error(`${table} lookup failed for: ${id}`);
  return data?.id || null;
}

/**
 * Looks up a category ID by name if it's not already a UUID.
 */
async function lookupCategory(supabase: any, categoryValue: any) {
  return _lookupEntityId(supabase, "categories", categoryValue);
}

/**
 * Looks up a topic ID by name within a category if it's not already a UUID.
 */
async function lookupTopic(
  supabase: any,
  topicValue: any,
  categoryId?: string | null,
) {
  return _lookupEntityId(
    supabase,
    "topics",
    topicValue,
    ["name"],
    categoryId ? "category_id" : undefined,
    categoryId,
  );
}

/**
 * Looks up a learning card ID by identifier (slug, title, or ID).
 */
async function lookupLearningCard(supabase: any, identifier: any) {
  return _lookupEntityId(supabase, "learning_cards", identifier, [
    "title",
    "slug",
  ]);
}

/**
 * Processes question options: sanitizes text and handles invalid formats.
 */
function processQuestionOptions(options: any) {
  if (!options || !Array.isArray(options)) return undefined;
  return options
    .filter((opt) => opt && typeof opt === "object")
    .map((option) => ({
      ...option,
      text: sanitizeRichContent(String(option.text || "")),
    }));
}

/**
 * Checks for duplicate questions based on title and (content OR code).
 */
async function checkDuplicateQuestion(
  supabase: any,
  question: Record<string, any>,
) {
  let query = supabase
    .from("questions")
    .select("id")
    .ilike("title", question["title"])
    .limit(1);

  if (question["code"]) {
    query = query.eq("code", question["code"]);
  } else if (question["content"]) {
    query = query.eq("content", question["content"]);
  }

  const { data } = await query.maybeSingle();
  return data;
}

/**
 * Normalizes field names between frontend and database naming conventions.
 */
function _normalizeQuestionFields(questionData: Record<string, any>) {
  const normalized: Record<string, any> = { ...questionData };

  if (normalized["isActive"] !== undefined)
    normalized["is_active"] = normalized["isActive"];
  if (normalized["learningCardId"] !== undefined)
    normalized["learning_card_id"] = normalized["learningCardId"];
  if (normalized["timeLimit"] !== undefined)
    normalized["time_limit"] = normalized["timeLimit"];

  // Normalize code line breaks specifically
  if (normalized["code"] !== undefined && normalized["code"] !== null) {
    normalized["code"] = normalizeCodeLineBreaks(String(normalized["code"]));
  } else {
    normalized["code"] = null;
  }

  return normalized;
}

/**
 * Resolves relationship IDs (Category, Topic, LearningCard) from names or identifiers.
 */
async function _resolveRelationships(
  supabase: any,
  data: Record<string, any>,
  categoryIdParam?: string | null,
) {
  const categoryId = await lookupCategory(
    supabase,
    data["category_id"] || data["category"],
  );

  const activeCategoryId = categoryIdParam || categoryId;

  const topicId = await lookupTopic(
    supabase,
    data["topic_id"] || data["topic"],
    activeCategoryId,
  );

  const learningCardId = await lookupLearningCard(
    supabase,
    data["learning_card_id"] || data["learningCardId"],
  );

  return { categoryId, topicId, learningCardId };
}

/**
 * Performs final field mapping and sanitization cleanup.
 */
function _prepareFinalDbObject(
  sanitized: Record<string, any>,
  lookups: {
    categoryId: string | null;
    topicId: string | null;
    learningCardId: string | null;
  },
) {
  const {
    category: _c,
    topic: _t,
    learningCardId: _lc,
    learning_card_id: _lci,
    isActive: _ia,
    timeLimit: _tl,
    id: _id,
    categories: _cs,
    topics: _ts,
    learning_cards: _lcs,
    learning_card: _lcobj,
    ...dbQuestion
  } = sanitized;

  const finalQuestion: Record<string, any> = {
    ...dbQuestion,
    category_id: lookups.categoryId || null,
    topic_id: lookups.topicId || null,
    learning_card_id: lookups.learningCardId || null,
    content: dbQuestion["content"] || dbQuestion["title"],
    type:
      dbQuestion["type"] === "multiple-select"
        ? "multiple-choice"
        : dbQuestion["type"] || "multiple-choice",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!("code" in finalQuestion)) finalQuestion["code"] = null;
  return finalQuestion;
}

/**
 * Transforms a raw database question for frontend consumption.
 */
function transformQuestionForFrontend(question: Record<string, any>) {
  const transformed = { ...question };
  if (question["categories"]) {
    transformed["category_id"] = question["categories"]["id"];
    transformed["category"] = question["categories"]["name"];
  }
  if (question["topics"]) {
    transformed["topic_id"] = question["topics"]["id"];
    transformed["topic"] = question["topics"]["name"];
  }
  if (question["learning_cards"]) {
    transformed["learning_card_id"] = question["learning_cards"]["id"];
    transformed["learningCardId"] = question["learning_cards"]["id"];
    transformed["learning_card"] = question["learning_cards"];
  }
  return transformed;
}

/**
 * Prepares a raw question object for Supabase insertion.
 * Handles normalization, validation, sanitization, and relationship lookup.
 */
async function prepareQuestionForStorage(
  supabase: any,
  questionData: Record<string, any>,
) {
  // 1. Normalize
  const normalized = _normalizeQuestionFields(questionData);
  const processedCode = normalized["code"];

  // 2. Validate
  const validation = validateAndSanitize(questionSchema, normalized);
  if (!validation.success) throw new Error(validation.error);

  // 3. Sanitize
  const sanitized = sanitizeObjectServer(
    validation.data as Record<string, any>,
  );
  sanitized["code"] = processedCode; // Restore code newlines
  if (sanitized["explanation"]) {
    sanitized["explanation"] = sanitizeRichContent(
      sanitized["explanation"] as string,
    );
  }
  sanitized["options"] = processQuestionOptions(sanitized["options"]);

  // 4. Resolve Relationships
  const lookups = await _resolveRelationships(supabase, sanitized);

  // 5. Final Mapping
  return _prepareFinalDbObject(sanitized, lookups);
}

/**
 * Internal helper to process the creation of a single question.
 * Returns a result object with status and data/error info.
 */
async function _processSingleCreation(
  supabase: any,
  questionData: any,
  index: number,
) {
  try {
    const finalQuestion = await prepareQuestionForStorage(
      supabase,
      questionData,
    );

    // Check for duplicates
    const duplicate = await checkDuplicateQuestion(supabase, finalQuestion);
    if (duplicate) {
      return {
        success: false,
        error: "Duplicate question already exists",
        questionData,
        index: index + 1,
      };
    }

    const { data, error } = await supabase
      .from("questions")
      .insert(finalQuestion)
      .single();

    if (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        questionData,
        index: index + 1,
      };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    return {
      success: false,
      error: getErrorMessage(err),
      questionData,
      index: index + 1,
    };
  }
}

// -----------------------------------------------------------------------------
// API Handlers
// -----------------------------------------------------------------------------

/**
 * GET Handler: Fetches and filters questions with pagination.
 */
export async function questionsGetHandler(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10);
    const categoryId = searchParams.get("categoryId");
    const topicId = searchParams.get("topicId");
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("questions")
      .select("*, categories(id, name), topics(id, name), learning_cards(*)", {
        count: "exact",
      });

    if (categoryId) query = query.eq("category_id", categoryId);
    if (topicId) query = query.eq("topic_id", topicId);
    if (type) query = query.eq("type", type);
    if (search) query = query.ilike("title", `%${search}%`);

    const { count, data, error } = await query
      .range(offset, offset + pageSize - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const questions = (data || []).map(transformQuestionForFrontend);
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      success: true,
      data: questions,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

/**
 * GET Handler: Fetches a single question by ID.
 */
export async function questionsGetByIdHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("questions")
      .select("*, categories(id, name), topics(id, name), learning_cards(*)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: transformQuestionForFrontend(data),
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

/**
 * POST Handler: Creates questions (bulk import or single).
 */
export async function questionsPostHandler(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { questions, isBulkImport = false } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: "Questions array is required" },
        { status: 400 },
      );
    }

    const { results, errors } = await _processQuestionBatch(
      supabase,
      questions,
    );

    _questionsCache = null;

    return NextResponse.json({
      success: true,
      data: {
        success: results.length,
        failed: errors.length,
        errors: errors.map((e) => `Question ${e.index}: ${e.error}`),
        errorDetails: errors.map((e) => ({
          index: e.index,
          title: (e.question as any)?.title || "Unknown",
          error: e.error,
        })),
        results,
      },
      message: `Successfully ${isBulkImport ? "imported" : "created"} ${results.length} questions`,
    });
  } catch (error) {
    console.error("Error creating questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create questions" },
      { status: 500 },
    );
  }
}

/**
 * Internal helper to process a batch of questions.
 */
async function _processQuestionBatch(supabase: any, questions: any[]) {
  const results: Array<{ success: boolean; id?: string }> = [];
  const errors: Array<{
    question: Record<string, unknown>;
    error: string;
    index: number;
  }> = [];

  for (let index = 0; index < questions.length; index++) {
    try {
      const result = await _processSingleCreation(
        supabase,
        questions[index],
        index,
      );
      if (result.success) {
        results.push({ success: true, id: result.id });
      } else {
        errors.push({
          question: result.questionData!,
          error: result.error!,
          index: result.index!,
        });
      }
    } catch (error) {
      const msg = getErrorMessage(error);
      errors.push({
        question: questions[index],
        error: msg,
        index: index + 1,
      });
    }
  }

  return { results, errors };
}

/**
 * Internal helper to update a single question.
 */
async function _processSingleUpdate(
  supabase: any,
  id: string,
  updateData: Record<string, any>,
) {
  // 1. Resolve Relationships
  const lookups = await _resolveRelationships(supabase, updateData);

  // 2. Sanitize and Normalize
  const sanitized = sanitizeObjectServer(updateData);
  if (sanitized["explanation"])
    sanitized["explanation"] = sanitizeRichContent(sanitized["explanation"]);
  if (sanitized["code"])
    sanitized["code"] = normalizeCodeLineBreaks(String(sanitized["code"]));
  sanitized["options"] = processQuestionOptions(sanitized["options"]);

  const {
    category: _c,
    topic: _t,
    learningCardId: _lc,
    learning_card_id: _lci,
    isActive: _ia,
    timeLimit: _tl,
    ...dbUpdate
  } = sanitized;

  const finalUpdate = {
    ...dbUpdate,
    category_id: lookups.categoryId || undefined,
    topic_id: lookups.topicId || undefined,
    learning_card_id: lookups.learningCardId || undefined,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("questions")
    .update(finalUpdate)
    .eq("id", id);

  if (error) throw error;
  return true;
}

/**
 * PUT Handler: Updates an existing question.
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Question ID is required" },
        { status: 400 },
      );
    }

    await _processSingleUpdate(supabase, id, updateData);

    _questionsCache = null;
    return NextResponse.json({
      success: true,
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

/**
 * DELETE Handler: Deletes a question.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Question ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) throw error;

    _questionsCache = null;
    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
