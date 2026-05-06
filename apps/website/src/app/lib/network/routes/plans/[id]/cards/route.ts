import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../../get-supabase-client";

// POST /api/plans/[id]/cards - Add a card to a plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: planId } = await params;
    const { card_id, order_index } = await request.json();
    const supabase = getSupabaseClient();

    if (!card_id) {
      return NextResponse.json(
        { success: false, error: "Card ID is required" },
        { status: 400 },
      );
    }

    // Check if card is already in plan
    const { data: existing } = await supabase
      .from("plan_cards")
      .select("id")
      .eq("plan_id", planId)
      .eq("card_id", card_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Card is already in this plan" },
        { status: 400 },
      );
    }

    // Get max order_index
    const { data: maxOrder } = await supabase
      .from("plan_cards")
      .select("order_index")
      .eq("plan_id", planId)
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = order_index ?? (maxOrder?.order_index ?? -1) + 1;

    const { data, error } = await supabase
      .from("plan_cards")
      .insert({
        plan_id: planId,
        card_id,
        order_index: nextOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: "Card added to plan successfully",
    });
  } catch (error: any) {
    console.error("Error adding card to plan:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add card to plan" },
      { status: 500 },
    );
  }
}

// GET /api/plans/[id]/cards - Get all cards in a plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: planId } = await params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("plan_cards")
      .select("*, learning_cards(*)")
      .eq("plan_id", planId)
      .order("order_index", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Error fetching plan cards:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch plan cards" },
      { status: 500 },
    );
  }
}

// DELETE /api/plans/[id]/cards - Remove a card from a plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: planId } = await params;
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("card_id");
    const supabase = getSupabaseClient();

    if (!cardId) {
      return NextResponse.json(
        { success: false, error: "Card ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("plan_cards")
      .delete()
      .eq("plan_id", planId)
      .eq("card_id", cardId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Card removed from plan successfully",
    });
  } catch (error: any) {
    console.error("Error removing card from plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove card from plan",
      },
      { status: 500 },
    );
  }
}
