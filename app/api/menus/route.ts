import { NextResponse } from "next/server";
import { db, isDatabaseEnabled } from "@/lib/db/connection";
import { menus, subcategories, menuIngredients, ingredients } from "@/lib/db/schema";
import { CreateMenuInput, MenuData, MenuItem } from "@/lib/types";
import { eq } from "drizzle-orm";

const STORAGE_KEY = "menu-control-menus";

// Helper function to calculate derived values
function calculateMenuValues(input: CreateMenuInput): {
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

// LocalStorage fallback functions (for server-side localStorage simulation)
const getFromStorage = (): MenuData[] => {
  if (typeof window === "undefined") {
    // Server-side: return empty array (in real app, you'd use a server-side storage)
    return [];
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveToStorage = (data: MenuData[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

// GET /api/menus - Get all menus with optional pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "0"); // 0 means no pagination
    const offset = limit > 0 ? (page - 1) * limit : 0;

    if (isDatabaseEnabled && db) {
      // Use database

      // Get total count for pagination info
      const totalCountResult = await db.select().from(menus);
      const total = totalCountResult.length;

      // Apply pagination if limit is specified
      let result;
      if (limit > 0) {
        result = await db.select().from(menus).limit(limit).offset(offset);
      } else {
        result = await db.select().from(menus);
      }
      const formattedMenus = result.map((menu) => ({
        id: menu.id,
        name: menu.name,
        imageUrl: menu.imageUrl,
        categoryId: menu.categoryId,
        subcategoryId: menu.subcategoryId,
        totalCost: Number(menu.totalCost),
        sellingPrice: Number(menu.sellingPrice),
        costRate: Number(menu.costRate),
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
      }));

      // Return paginated response
      if (limit > 0) {
        const totalPages = Math.ceil(total / limit);
        return NextResponse.json({
          data: formattedMenus,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        });
      } else {
        // Return all data without pagination info for backward compatibility
        return NextResponse.json(formattedMenus);
      }
    } else {
      // Fallback to empty array (client-side localStorage will be used instead)
      if (limit > 0) {
        return NextResponse.json({
          data: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        });
      }
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching menus:", error);
    // Return 503 for database issues to trigger localStorage fallback
    return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
  }
}

// POST /api/menus - Create a new menu
export async function POST(request: Request) {
  try {
    const input: CreateMenuInput = await request.json();

    if (isDatabaseEnabled && db) {
      // Use database
      const { totalCost, costRate } = calculateMenuValues(input);

      // Get the categoryId from the subcategory
      const subcategoryResult = await db.select().from(subcategories).where(eq(subcategories.id, input.subcategoryId));

      if (subcategoryResult.length === 0) {
        return NextResponse.json({ error: "Subcategory not found" }, { status: 400 });
      }

      const categoryId = subcategoryResult[0].categoryId;

      const menuId = Date.now().toString();

      const newMenu = {
        id: menuId,
        name: input.name,
        imageUrl: input.imageUrl || "",
        categoryId: categoryId,
        subcategoryId: input.subcategoryId,
        sellingPrice: input.sellingPrice.toFixed(2),
        totalCost: totalCost.toFixed(2),
        costRate: costRate.toFixed(2),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save menu first
      await db.insert(menus).values(newMenu);

      // Save recipe ingredients to normalized table if provided
      if (input.recipeIngredients && input.recipeIngredients.length > 0) {
        const menuIngredientsToInsert = input.recipeIngredients.map((ri) => ({
          id: ri.id,
          menuId: menuId,
          ingredientId: ri.ingredientId,
          quantity: ri.quantity.toString(),
          calculatedCost: ri.calculatedCost.toFixed(2),
          createdAt: new Date(),
        }));

        await db.insert(menuIngredients).values(menuIngredientsToInsert);
      }

      const responseMenu = {
        ...newMenu,
        totalCost: Number(newMenu.totalCost),
        sellingPrice: Number(newMenu.sellingPrice),
        costRate: Number(newMenu.costRate),
      };

      return NextResponse.json(responseMenu);
    } else {
      // Return error - client should use localStorage directly
      return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
    }
  } catch (error) {
    console.error("Error creating menu:", error);
    // Return 503 for database issues to trigger localStorage fallback
    return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
  }
}
