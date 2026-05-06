import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySupabaseToken } from "../../../../../server-auth";
import { getSupabaseClient } from "../../../../../get-supabase-client";

interface GuidedProgress {
  planId: string;
  completedQuestions: string[];
  completedTopics: string[];
  completedCategories: string[];
  completedCards: string[];
  currentPosition: any;
  lastUpdated: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("firebase_token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");
    const progressData: GuidedProgress = await request.json();

    if (!token) return _devModeResponse("authentication not fully configured");

    let user = await verifySupabaseToken(token);
    user ??= await _resolveUserFromData(progressData);
    if (!user) return _devModeResponse("token invalid");

    const { error } = await _syncToDatabase(user.id, progressData);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Progress synced successfully",
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    return _devModeResponse("server error");
  }
}

async function _resolveUserFromData(data: any) {
  if (!data?.userId) return null;
  const { data: user, error } = await getSupabaseClient()
    .from("users")
    .select("id, email, role, name")
    .eq("id", data.userId)
    .single();
  return !error && user
    ? { id: user.id, email: user.email, role: user.role, name: user.name }
    : null;
}

async function _syncToDatabase(userId: string, data: GuidedProgress) {
  return getSupabaseClient()
    .from("user_progress")
    .upsert(
      {
        user_id: userId,
        plan_id: data.planId,
        progress_data: {
          completedQuestions: data.completedQuestions,
          completedTopics: data.completedTopics,
          completedCategories: data.completedCategories,
          completedCards: data.completedCards,
          currentPosition: data.currentPosition,
        },
        last_updated: data.lastUpdated,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,plan_id" },
    );
}

function _devModeResponse(reason: string) {
  return NextResponse.json({
    success: true,
    message: `Progress would be saved (development mode - ${reason})`,
    warning: "Using development mode",
  });
}
