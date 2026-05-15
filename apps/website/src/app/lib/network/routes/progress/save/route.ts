// Helper: Parse progress data from request
async function parseProgressData(
  request: NextRequest,
): Promise<ProgressData | null> {
  try {
    return await request.json();
  } catch (parseError) {
    console.error("❌ Error parsing request body:", sanitizeForLog(parseError));
    return null;
  }
}

// Helper: Development mode response
function devModeResponse(
  warning = "Using development mode - authentication not fully configured",
): NextResponse {
  return NextResponse.json({
    success: true,
    progressId: `progress_${Date.now()}_${generateId()}`,
    message: "Progress saved successfully (development mode)",
    warning,
  });
}
import { NextRequest, NextResponse } from "next/server";

import { createRepositoryFactoryFromEnv } from "@elzatona/database";
import { generateId } from "@elzatona/utilities";
import { getSupabaseClient } from "../../../../get-supabase-client";

import { cookies } from "next/headers";
import { verifySupabaseToken } from "../../../../server-auth";

function sanitizeForLog(value: unknown): string {
  const raw =
    typeof value === "string"
      ? value
      : (() => {
          try {
            return JSON.stringify(value);
          } catch {
            return "[unserializable]";
          }
        })();

  return raw.split("\r").join(" ").split("\n").join(" ").slice(0, 500);
}
interface ProgressData {
  userId: string;
  sessionId: string;
  question_id: string;
  answer: number;
  isCorrect: boolean;
  timeSpent: number;
  section: string;
  difficulty: string;
  timestamp: number;
  learningMode: "guided" | "free-style";
  planId?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log("📥 Progress save API called");

    const cookieStore = await cookies();
    const token = cookieStore.get("firebase_token")?.value;

    const progressData = await parseProgressData(request);
    if (!progressData) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    if (!token) {
      return devModeResponse();
    }

    const decodedToken = await verifySupabaseToken(token);
    if (!decodedToken) {
      return devModeResponse();
    }

    if (!validateProgress(progressData)) {
      return NextResponse.json(
        { error: "Invalid progress data" },
        { status: 400 },
      );
    }
    if (progressData.userId !== decodedToken.id) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    await saveProgressToRepo(decodedToken.id, progressData);
    await updateLearningPlan(progressData);

    const savedProgress = {
      ...progressData,
      id: `progress_${Date.now()}_${generateId()}`,
      savedAt: new Date().toISOString(),
    };

    const progressSummary = {
      userId: decodedToken.id,
      lastActivity: new Date().toISOString(),
      totalQuestions: 1,
      accuracy: progressData.isCorrect ? 100 : 0,
    };

    const response = NextResponse.json({
      success: true,
      progressId: savedProgress.id,
      message: "Progress saved successfully",
    });
    response.cookies.set("progress-summary", JSON.stringify(progressSummary), {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("❌ Error saving progress:", sanitizeForLog(error));
    return devModeResponse("Using development mode due to server error");
  }
}

function validateProgress(progressData: ProgressData) {
  return (
    !!progressData.question_id && typeof progressData.isCorrect === "boolean"
  );
}

async function saveProgressToRepo(userId: string, progressData: ProgressData) {
  try {
    const factory = createRepositoryFactoryFromEnv();
    const progressRepo = factory.getProgressRepository();
    await progressRepo.createProgress({
      userId,
      flashcardId: progressData.question_id,
      status: progressData.isCorrect ? "correct" : "incorrect",
    });
    console.log("✅ Progress saved to repository successfully");
  } catch (repoError) {
    console.error(
      "❌ Error saving progress to repository:",
      sanitizeForLog(repoError),
    );
  }
}

async function updateLearningPlan(progressData: ProgressData) {
  if (progressData.learningMode === "guided" && progressData.planId) {
    try {
      const supabase = getSupabaseClient();
      const { data: currentPlan, error: planError } = await supabase
        .from("learning_plans")
        .select("*")
        .eq("id", progressData.planId)
        .single();
      if (planError) throw planError;
      if (currentPlan) {
        const { error: updateError } = await supabase
          .from("learning_plans")
          .update({
            questions_completed: (currentPlan.questions_completed || 0) + 1,
            progress: Math.round(
              (((currentPlan.questions_completed || 0) + 1) /
                (currentPlan.total_questions || 1)) *
                100,
            ),
            updated_at: new Date().toISOString(),
          })
          .eq("id", progressData.planId);
        if (updateError) throw updateError;
        console.log("✅ Learning plan updated successfully");
      } else {
        console.warn("⚠️ Learning plan not found, skipping plan update");
      }
    } catch (planError) {
      console.error(
        "❌ Error updating learning plan:",
        sanitizeForLog(planError),
      );
    }
  }
}
