import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../get-supabase-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id)
      return NextResponse.json(
        { success: false, error: "Topic ID is required" },
        { status: 400 },
      );
    const { data: topic, error } = await getSupabaseClient()
      .from("topics")
      .select("*")
      .eq("id", id)
      .single();
    if (error)
      return NextResponse.json(
        {
          success: false,
          error: error.code === "PGRST116" ? "Topic not found" : error.message,
        },
        { status: error.code === "PGRST116" ? 404 : 500 },
      );
    return NextResponse.json({ success: true, data: topic });
  } catch (error) {
    console.error("Failed to fetch topic:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch topic" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: topicId } = await params;
    const body = await request.json();
    if (!topicId || !body.name)
      return NextResponse.json(
        { success: false, error: "ID and Name are required" },
        { status: 400 },
      );

    const updateData = _mapTopicUpdateData(body);
    const { data: updatedTopic, error } = await getSupabaseClient()
      .from("topics")
      .update(updateData)
      .eq("id", topicId)
      .select()
      .single();

    if (error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 },
      );
    return NextResponse.json({
      success: true,
      message: "Topic updated successfully",
      data: updatedTopic,
    });
  } catch (error) {
    console.error("Failed to update topic:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update topic" },
      { status: 500 },
    );
  }
}

function _mapTopicUpdateData(body: any) {
  const data: any = {
    name: body.name,
    description: body.description ?? null,
    difficulty: body.difficulty ?? null,
    slug: body.slug ?? null,
    updated_at: new Date().toISOString(),
  };

  const mappings: Record<string, string[]> = {
    category_id: ["categoryId", "category_id"],
    estimated_questions: ["estimatedQuestions", "estimated_questions"],
    order_index: ["order", "order_index"],
    is_active: ["isActive", "is_active"],
  };

  Object.entries(mappings).forEach(([dbKey, bodyKeys]) => {
    const foundKey = bodyKeys.find((k) => body[k] !== undefined);
    if (foundKey) data[dbKey] = body[foundKey];
  });

  return data;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id)
      return NextResponse.json(
        { success: false, error: "Topic ID is required" },
        { status: 400 },
      );
    const { error } = await getSupabaseClient()
      .from("topics")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete topic:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete topic" },
      { status: 500 },
    );
  }
}
