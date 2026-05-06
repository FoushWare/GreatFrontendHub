import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../../get-supabase-client";

// POST /api/plans/[id]/questions - Add a question to a plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: planId } = await params;
    const { question_id, topic_id, order_index } = await request.json();
    const supabase = getSupabaseClient();

    if (!question_id) {
      return NextResponse.json(
        { success: false, error: "Question ID is required" },
        { status: 400 },
      );
    }

    // Check if question is already in plan
    const { data: existing } = await supabase
      .from("plan_questions")
      .select("id")
      .eq("plan_id", planId)
      .eq("question_id", question_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Question is already in this plan" },
        { status: 400 },
      );
    }

    // Get max order_index
    const { data: maxOrder } = await supabase
      .from("plan_questions")
      .select("order_index")
      .eq("plan_id", planId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = order_index ?? (maxOrder?.order_index ?? -1) + 1;

    const { data, error } = await supabase
      .from("plan_questions")
      .insert({
        plan_id: planId,
        question_id,
        topic_id: topic_id || null,
        order_index: nextOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: "Question added to plan successfully",
    });
  } catch (error: any) {
    console.error("Error adding question to plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add question to plan",
      },
      { status: 500 },
    );
  }
}

// GET /api/plans/[id]/questions - Get all questions in a plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: planId } = await params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("plan_questions")
      .select("*, questions(*)")
      .eq("plan_id", planId)
      .order("order_index", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching plan questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch plan questions",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/plans/[id]/questions - Remove a question from a plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: planId } = await params;
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("question_id");
    const supabase = getSupabaseClient();

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: "Question ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("plan_questions")
      .delete()
      .eq("plan_id", planId)
      .eq("question_id", questionId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Question removed from plan successfully",
    });
  } catch (error: any) {
    console.error("Error removing question from plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove question from plan",
      },
      { status: 500 },
    );
  }
}
