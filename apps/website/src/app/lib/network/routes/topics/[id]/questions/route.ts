import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../../get-supabase-client";

// POST /api/topics/[id]/questions - Add a question to a topic
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: topicId } = await params;
    const { question_id, order_index } = await request.json();
    const supabase = getSupabaseClient();

    if (!question_id) {
      return NextResponse.json(
        { success: false, error: "Question ID is required" },
        { status: 400 },
      );
    }

    // Check if question is already in topic (via questions_topics)
    const { data: existing } = await supabase
      .from("questions_topics")
      .select("id")
      .eq("topic_id", topicId)
      .eq("question_id", question_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Question is already in this topic" },
        { status: 400 },
      );
    }

    // Also update the question's topic_id if it's not set
    const { data: question } = await supabase
      .from("questions")
      .select("topic_id")
      .eq("id", question_id)
      .single();

    if (question && !question.topic_id) {
      await supabase
        .from("questions")
        .update({ topic_id: topicId })
        .eq("id", question_id);
    }

    // Get max order_index
    const { data: maxOrder } = await supabase
      .from("questions_topics")
      .select("order_index")
      .eq("topic_id", topicId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = order_index ?? (maxOrder?.order_index ?? -1) + 1;

    const { data, error } = await supabase
      .from("questions_topics")
      .insert({
        topic_id: topicId,
        question_id,
        order_index: nextOrder,
        is_primary: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: "Question added to topic successfully",
    });
  } catch (error: any) {
    console.error("Error adding question to topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add question to topic",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/topics/[id]/questions - Remove a question from a topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: topicId } = await params;
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
      .from("questions_topics")
      .delete()
      .eq("topic_id", topicId)
      .eq("question_id", questionId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Question removed from topic successfully",
    });
  } catch (error: any) {
    console.error("Error removing question from topic:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove question from topic",
      },
      { status: 500 },
    );
  }
}
