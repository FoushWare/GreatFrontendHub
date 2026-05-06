import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../../get-supabase-client";

// POST /api/categories/[id]/topics - Add a topic to a category
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: categoryId } = await params;
    const { topic_id, order_index, is_primary } = await request.json();
    const supabase = getSupabaseClient();

    if (!topic_id) {
      return NextResponse.json(
        { success: false, error: "Topic ID is required" },
        { status: 400 },
      );
    }

    // Check if topic is already in category (via category_topics)
    const { data: existing } = await supabase
      .from("category_topics")
      .select("id")
      .eq("category_id", categoryId)
      .eq("topic_id", topic_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Topic is already in this category" },
        { status: 400 },
      );
    }

    // Also update the topic's category_id if it's not set
    const { data: topic } = await supabase
      .from("topics")
      .select("category_id")
      .eq("id", topic_id)
      .single();

    if (topic && !topic.category_id) {
      await supabase
        .from("topics")
        .update({ category_id: categoryId })
        .eq("id", topic_id);
    }

    // Get max order_index
    const { data: maxOrder } = await supabase
      .from("category_topics")
      .select("order_index")
      .eq("category_id", categoryId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = order_index ?? (maxOrder?.order_index ?? -1) + 1;

    const { data, error } = await supabase
      .from("category_topics")
      .insert({
        category_id: categoryId,
        topic_id,
        order_index: nextOrder,
        is_primary: is_primary ?? false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: "Topic added to category successfully",
    });
  } catch (error: any) {
    console.error("Error adding topic to category:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add topic to category",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/categories/[id]/topics - Remove a topic from a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: categoryId } = await params;
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topic_id");
    const supabase = getSupabaseClient();

    if (!topicId) {
      return NextResponse.json(
        { success: false, error: "Topic ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("category_topics")
      .delete()
      .eq("category_id", categoryId)
      .eq("topic_id", topicId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Topic removed from category successfully",
    });
  } catch (error: any) {
    console.error("Error removing topic from category:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove topic from category",
      },
      { status: 500 },
    );
  }
}
