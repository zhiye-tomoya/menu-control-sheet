import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseEnabled } from "@/lib/db/connection";
import { ingredients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/ingredients/[id] - Get a specific ingredient
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseEnabled || !db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { id } = params;
    const ingredient = await db.select().from(ingredients).where(eq(ingredients.id, id));

    if (ingredient.length === 0) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    return NextResponse.json(ingredient[0]);
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    return NextResponse.json({ error: "Failed to fetch ingredient" }, { status: 500 });
  }
}

// PUT /api/ingredients/[id] - Update a specific ingredient
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseEnabled || !db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, defaultUnit, pricingUnit, conversionFactor, currentPrice, category, description } = body;

    // Validate required fields
    if (!name || !defaultUnit || !pricingUnit || !conversionFactor || !currentPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updateData = {
      name: name.trim(),
      defaultUnit,
      pricingUnit,
      conversionFactor: String(conversionFactor),
      currentPrice: String(currentPrice),
      category: category?.trim() || "",
      description: description?.trim() || "",
      updatedAt: new Date(),
    };

    const updatedIngredient = await db.update(ingredients).set(updateData).where(eq(ingredients.id, id)).returning();

    if (updatedIngredient.length === 0) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    return NextResponse.json(updatedIngredient[0]);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    return NextResponse.json({ error: "Failed to update ingredient" }, { status: 500 });
  }
}

// DELETE /api/ingredients/[id] - Delete a specific ingredient
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isDatabaseEnabled || !db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { id } = params;

    const deletedIngredient = await db.delete(ingredients).where(eq(ingredients.id, id)).returning();

    if (deletedIngredient.length === 0) {
      return NextResponse.json({ error: "Ingredient not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return NextResponse.json({ error: "Failed to delete ingredient" }, { status: 500 });
  }
}
