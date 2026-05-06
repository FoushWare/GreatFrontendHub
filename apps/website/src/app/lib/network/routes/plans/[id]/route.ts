import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "../../../../get-supabase-client";

// GET /api/plans/[id] - Get a single plan by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();
    const { data: planData, error: planError } = await supabase
      .from("learning_plans")
      .select("*")
      .eq("id", id)
      .single();

    if (planError || !planData) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: planData.id, ...planData },
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch plan" },
      { status: 500 },
    );
  }
}

// PUT /api/plans/[id] - Update a plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    const supabase = getSupabaseClient();

    const { error: updateError } = await supabase
      .from("learning_plans")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update plan" },
      { status: 500 },
    );
  }
}

// DELETE /api/plans/[id] - Delete a plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { error: deleteError } = await supabase
      .from("learning_plans")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete plan" },
      { status: 500 },
    );
  }
}
