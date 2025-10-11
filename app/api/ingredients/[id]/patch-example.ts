import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/connection";
import { ingredients } from "@/lib/db/schema";
import { logChange } from "@/lib/logChange";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Example PATCH route demonstrating authentication and change logging
const updateIngredientSchema = z.object({
  name: z.string().optional(),
  currentPrice: z.string().optional(),
  description: z.string().optional(),
  defaultUnit: z.string().optional(),
  pricingUnit: z.string().optional(),
  conversionFactor: z.string().optional(),
  category: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!db) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 });
  }

  // In a real implementation, you would get the userId from the session
  // For this example, we'll use a placeholder
  const userId = "temp-user-id"; // This should come from getServerSession

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates = updateIngredientSchema.parse(body);

    // Get the current ingredient data for logging
    const currentIngredient = await db
      .select()
      .from(ingredients)
      .where(eq(ingredients.id, params.id))
      .limit(1)
      .then((rows) => rows[0] || null);

    if (!currentIngredient) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    // Update the ingredient
    const updatedIngredients = await db
      .update(ingredients)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(ingredients.id, params.id))
      .returning();

    const updatedIngredient = updatedIngredients[0];

    // Log the change
    await logChange({
      tableName: "ingredients",
      recordId: params.id,
      userId,
      action: "UPDATE",
      beforeData: currentIngredient,
      afterData: updatedIngredient,
    });

    return NextResponse.json({
      message: "Ingredient updated successfully",
      ingredient: updatedIngredient,
    });
  } catch (error) {
    console.error("Error updating ingredient:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
