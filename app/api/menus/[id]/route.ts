import { NextResponse } from "next/server";
import { db, isDatabaseEnabled } from "@/lib/db/connection";
import { menus, subcategories, menuIngredients, ingredients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UpdateMenuInput } from "@/lib/types";

// Helper function to calculate derived values
function calculateMenuValues(input: UpdateMenuInput): {
  totalCost: number;
  costRate: number;
} {
  // Handle both legacy ingredients array and new normalized structure
  const ingredients = input.ingredients || [];
  const recipeIngredients = input.recipeIngredients || [];

  // Calculate from legacy format
  const legacyTotalCost = ingredients.reduce((sum, ing) => sum + ing.totalPrice, 0);

  // Calculate from new format
  const newTotalCost = recipeIngredients.reduce((sum, ri) => sum + ri.calculatedCost, 0);

  // Use whichever has data
  const totalCost = newTotalCost > 0 ? newTotalCost : legacyTotalCost;
  const costRate = input.sellingPrice > 0 ? (totalCost / input.sellingPrice) * 100 : 0;

  return { totalCost, costRate };
}

// GET /api/menus/[id] - Get a single menu by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDatabaseEnabled && db) {
      const result = await db.select().from(menus).where(eq(menus.id, params.id));

      if (result.length === 0) {
        return NextResponse.json({ error: "Menu not found" }, { status: 404 });
      }

      const menu = result[0];

      // Fetch menu ingredients from the normalized table
      const menuIngredientsList = await db
        .select({
          id: menuIngredients.id,
          ingredientId: menuIngredients.ingredientId,
          quantity: menuIngredients.quantity,
          calculatedCost: menuIngredients.calculatedCost,
          createdAt: menuIngredients.createdAt,
          ingredient: {
            id: ingredients.id,
            name: ingredients.name,
            defaultUnit: ingredients.defaultUnit,
            pricingUnit: ingredients.pricingUnit,
            conversionFactor: ingredients.conversionFactor,
            currentPrice: ingredients.currentPrice,
            category: ingredients.category,
            description: ingredients.description,
            createdAt: ingredients.createdAt,
            updatedAt: ingredients.updatedAt,
          },
        })
        .from(menuIngredients)
        .leftJoin(ingredients, eq(menuIngredients.ingredientId, ingredients.id))
        .where(eq(menuIngredients.menuId, params.id));

      // Format the recipe ingredients
      const recipeIngredients = menuIngredientsList.map((mi) => ({
        id: mi.id,
        ingredientId: mi.ingredientId,
        quantity: Number(mi.quantity),
        calculatedCost: Number(mi.calculatedCost),
        createdAt: mi.createdAt?.toISOString() || new Date().toISOString(),
        ingredient: mi.ingredient
          ? {
              id: mi.ingredient.id,
              name: mi.ingredient.name,
              defaultUnit: mi.ingredient.defaultUnit,
              pricingUnit: mi.ingredient.pricingUnit,
              conversionFactor: Number(mi.ingredient.conversionFactor),
              currentPrice: Number(mi.ingredient.currentPrice),
              category: mi.ingredient.category,
              description: mi.ingredient.description,
              createdAt: mi.ingredient.createdAt?.toISOString() || new Date().toISOString(),
              updatedAt: mi.ingredient.updatedAt?.toISOString() || new Date().toISOString(),
            }
          : undefined,
      }));

      const formattedMenu = {
        ...menu,
        totalCost: Number(menu.totalCost),
        sellingPrice: Number(menu.sellingPrice),
        costRate: Number(menu.costRate),
        recipeIngredients: recipeIngredients, // Normalized format
      };

      return NextResponse.json(formattedMenu);
    } else {
      // Return error - client should use localStorage directly
      return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
    }
  } catch (error) {
    console.error("Error fetching menu:", error);
    // Return 503 for database issues to trigger localStorage fallback
    return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
  }
}

// PUT /api/menus/[id] - Update a menu
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDatabaseEnabled && db) {
      const input: UpdateMenuInput = await request.json();
      const { totalCost, costRate } = calculateMenuValues(input);

      // Get the categoryId from the subcategory
      const subcategoryResult = await db.select().from(subcategories).where(eq(subcategories.id, input.subcategoryId));

      if (subcategoryResult.length === 0) {
        return NextResponse.json({ error: "Subcategory not found" }, { status: 400 });
      }

      const categoryId = subcategoryResult[0].categoryId;

      const updatedMenu = {
        name: input.name,
        imageUrl: input.imageUrl || "",
        categoryId: categoryId,
        subcategoryId: input.subcategoryId,
        sellingPrice: input.sellingPrice.toFixed(2),
        totalCost: totalCost.toFixed(2),
        costRate: costRate.toFixed(2),
        updatedAt: new Date(),
      };

      await db.update(menus).set(updatedMenu).where(eq(menus.id, params.id));

      // Update recipe ingredients in normalized table if provided
      if (input.recipeIngredients) {
        // Delete existing menu ingredients
        await db.delete(menuIngredients).where(eq(menuIngredients.menuId, params.id));

        // Insert new menu ingredients
        if (input.recipeIngredients.length > 0) {
          const menuIngredientsToInsert = input.recipeIngredients.map((ri) => ({
            id: ri.id,
            menuId: params.id,
            ingredientId: ri.ingredientId,
            quantity: ri.quantity.toString(),
            calculatedCost: ri.calculatedCost.toFixed(2),
            createdAt: new Date(),
          }));

          await db.insert(menuIngredients).values(menuIngredientsToInsert);
        }
      }

      // Fetch and return the updated menu with ingredients
      const result = await db.select().from(menus).where(eq(menus.id, params.id));

      if (result.length === 0) {
        return NextResponse.json({ error: "Menu not found" }, { status: 404 });
      }

      const menu = result[0];

      // Fetch updated menu ingredients
      const menuIngredientsList = await db
        .select({
          id: menuIngredients.id,
          ingredientId: menuIngredients.ingredientId,
          quantity: menuIngredients.quantity,
          calculatedCost: menuIngredients.calculatedCost,
          createdAt: menuIngredients.createdAt,
          ingredient: {
            id: ingredients.id,
            name: ingredients.name,
            defaultUnit: ingredients.defaultUnit,
            pricingUnit: ingredients.pricingUnit,
            conversionFactor: ingredients.conversionFactor,
            currentPrice: ingredients.currentPrice,
            category: ingredients.category,
            description: ingredients.description,
            createdAt: ingredients.createdAt,
            updatedAt: ingredients.updatedAt,
          },
        })
        .from(menuIngredients)
        .leftJoin(ingredients, eq(menuIngredients.ingredientId, ingredients.id))
        .where(eq(menuIngredients.menuId, params.id));

      // Format the recipe ingredients
      const recipeIngredients = menuIngredientsList.map((mi) => ({
        id: mi.id,
        ingredientId: mi.ingredientId,
        quantity: Number(mi.quantity),
        calculatedCost: Number(mi.calculatedCost),
        createdAt: mi.createdAt?.toISOString() || new Date().toISOString(),
        ingredient: mi.ingredient
          ? {
              id: mi.ingredient.id,
              name: mi.ingredient.name,
              defaultUnit: mi.ingredient.defaultUnit,
              pricingUnit: mi.ingredient.pricingUnit,
              conversionFactor: Number(mi.ingredient.conversionFactor),
              currentPrice: Number(mi.ingredient.currentPrice),
              category: mi.ingredient.category,
              description: mi.ingredient.description,
              createdAt: mi.ingredient.createdAt?.toISOString() || new Date().toISOString(),
              updatedAt: mi.ingredient.updatedAt?.toISOString() || new Date().toISOString(),
            }
          : undefined,
      }));

      const formattedMenu = {
        ...menu,
        totalCost: Number(menu.totalCost),
        sellingPrice: Number(menu.sellingPrice),
        costRate: Number(menu.costRate),
        recipeIngredients: recipeIngredients,
      };

      return NextResponse.json(formattedMenu);
    } else {
      // Return error - client should use localStorage directly
      return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
    }
  } catch (error) {
    console.error("Error updating menu:", error);
    // Return 503 for database issues to trigger localStorage fallback
    return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
  }
}

// DELETE /api/menus/[id] - Delete a menu
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDatabaseEnabled && db) {
      await db.delete(menus).where(eq(menus.id, params.id));
      return NextResponse.json({ success: true });
    } else {
      // Return error - client should use localStorage directly
      return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
    }
  } catch (error) {
    console.error("Error deleting menu:", error);
    // Return 503 for database issues to trigger localStorage fallback
    return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
  }
}
