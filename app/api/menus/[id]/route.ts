import { NextResponse } from "next/server";
import { db, isDatabaseEnabled } from "@/lib/db/connection";
import { menus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UpdateMenuInput } from "@/lib/types";

// Helper function to calculate derived values
function calculateMenuValues(input: UpdateMenuInput): {
  totalCost: number;
  costRate: number;
} {
  const totalCost = input.ingredients.reduce((sum, ing) => sum + ing.totalPrice, 0);
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
      const formattedMenu = {
        ...menu,
        totalCost: Number(menu.totalCost),
        sellingPrice: Number(menu.sellingPrice),
        costRate: Number(menu.costRate),
        ingredients: menu.ingredients as any,
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

      const updatedMenu = {
        name: input.name,
        imageUrl: input.imageUrl || "",
        categoryId: input.categoryId,
        ingredients: input.ingredients,
        sellingPrice: input.sellingPrice.toFixed(2),
        totalCost: totalCost.toFixed(2),
        costRate: costRate.toFixed(2),
        updatedAt: new Date(),
      };

      await db.update(menus).set(updatedMenu).where(eq(menus.id, params.id));

      // Fetch and return the updated menu
      const result = await db.select().from(menus).where(eq(menus.id, params.id));

      if (result.length === 0) {
        return NextResponse.json({ error: "Menu not found" }, { status: 404 });
      }

      const menu = result[0];
      const formattedMenu = {
        ...menu,
        totalCost: Number(menu.totalCost),
        sellingPrice: Number(menu.sellingPrice),
        costRate: Number(menu.costRate),
        ingredients: menu.ingredients as any,
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
