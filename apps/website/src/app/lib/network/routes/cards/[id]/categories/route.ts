import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../../get-supabase-client";

// POST /api/cards/[id]/categories - Add a category to a card
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: cardId } = await params;
    const { category_id, order_index, is_primary } = await request.json();
    const supabase = getSupabaseClient();

    if (!category_id) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 },
      );
    }

    // Check if category is already in card
    const { data: existing } = await supabase
      .from("card_categories")
      .select("id")
      .eq("card_id", cardId)
      .eq("category_id", category_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Category is already in this card" },
        { status: 400 },
      );
    }

    // Get max order_index
    const { data: maxOrder } = await supabase
      .from("card_categories")
      .select("order_index")
      .eq("card_id", cardId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = order_index ?? (maxOrder?.order_index ?? -1) + 1;

    const { data, error } = await supabase
      .from("card_categories")
      .insert({
        card_id: cardId,
        category_id,
        order_index: nextOrder,
        is_primary: is_primary ?? false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: "Category added to card successfully",
    });
  } catch (error: any) {
    console.error("Error adding category to card:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add category to card",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/cards/[id]/categories - Remove a category from a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: cardId } = await params;
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const supabase = getSupabaseClient();

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("card_categories")
      .delete()
      .eq("card_id", cardId)
      .eq("category_id", categoryId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Category removed from card successfully",
    });
  } catch (error: any) {
    console.error("Error removing category from card:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove category from card",
      },
      { status: 500 },
    );
  }
}
