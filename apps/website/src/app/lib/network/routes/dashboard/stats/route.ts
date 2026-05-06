import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../get-supabase-client";
import { cookies } from "next/headers";
import {
  verifySupabaseToken,
  getUserFromRequest,
} from "../../../../server-auth";
import { calculateStreak, calculateAchievements } from "@elzatona/utilities";

/**
 * Get user dashboard statistics
 * Aggregates data from all sources: guided learning, free-style practice, question attempts
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return fallbackMockResponse();
    }

    const supabase = getSupabaseClient();

    // 1. Concurrent data fetching
    const [attemptsRes, progressRes] = await Promise.all([
      supabase
        .from("question_attempts")
        .select("question_id, is_correct, points_earned, created_at")
        .eq("user_id", userId),
      supabase
        .from("user_progress")
        .select("id, plan_id, progress_data, updated_at, created_at")
        .eq("user_id", userId),
    ]);

    if (attemptsRes.error) throw attemptsRes.error;
    if (progressRes.error) throw progressRes.error;

    const questionAttempts = attemptsRes.data || [];
    const userProgressEntries = progressRes.data || [];

    // 2. Aggregate questions and points
    const { uniqueQuestionIds, totalPoints } = aggregateProgress(
      questionAttempts,
      userProgressEntries,
    );
    const questionsCompleted = uniqueQuestionIds.size;

    // 3. Calculate streak from combined timestamps
    const activityDates = [
      ...questionAttempts.map((a) => a.created_at),
      ...userProgressEntries.map((e) => e.updated_at || e.created_at),
    ].filter(Boolean) as string[];

    const streak = calculateStreak(activityDates);

    // 4. Calculate achievements based on milestones
    const achievements = calculateAchievements(
      questionsCompleted,
      totalPoints,
      streak.current,
      streak.longest,
    );

    return NextResponse.json({
      success: true,
      stats: {
        questionsCompleted,
        totalPoints,
        dayStreak: streak.current,
        longestStreak: streak.longest,
        achievements,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}

/**
 * Resolves user ID from Authorization header or Cookies.
 */
async function resolveUserId(request: NextRequest): Promise<string | null> {
  const authUser = await getUserFromRequest(request);
  if (authUser) return authUser.id;

  const cookieStore = await cookies();
  const token = cookieStore.get("firebase_token")?.value;
  if (token) {
    const decoded = await verifySupabaseToken(token);
    return decoded?.id || null;
  }
  return null;
}

/**
 * Provides a mock response for developmental testing when unauthenticated.
 */
function fallbackMockResponse() {
  console.log("⚠️ No authenticated user found, returning mock dashboard stats");
  return NextResponse.json({
    success: true,
    stats: {
      questionsCompleted: 0,
      totalPoints: 0,
      dayStreak: 0,
      longestStreak: 0,
      achievements: [],
    },
    warning: "Using development mode - authentication not fully configured",
  });
}

/**
 * Core logic for aggregating unique questions and total points.
 */
function aggregateProgress(attempts: any[], progressEntries: any[]) {
  const uniqueQuestionIds = new Set<string>();
  let totalPoints = 0;

  // Question attempts aggregation
  attempts.forEach((a) => {
    if (a.question_id) uniqueQuestionIds.add(a.question_id);
    totalPoints += a.points_earned || 0;
  });

  // User progress aggregation (JSON parsing handle)
  progressEntries.forEach((entry) => {
    const progressData =
      typeof entry.progress_data === "string"
        ? safeJsonParse(entry.progress_data)
        : entry.progress_data;

    if (!progressData) return;

    if (Array.isArray(progressData.completedQuestions)) {
      progressData.completedQuestions.forEach((id: string) =>
        uniqueQuestionIds.add(id),
      );
    }
    if (Array.isArray(progressData.answeredQuestions)) {
      progressData.answeredQuestions.forEach((id: string) =>
        uniqueQuestionIds.add(id),
      );
    }
    if (Array.isArray(progressData.correctAnswers)) {
      totalPoints += progressData.correctAnswers.length * 10;
    }
  });

  return { uniqueQuestionIds, totalPoints };
}

function safeJsonParse(data: string) {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
