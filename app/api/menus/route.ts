import { NextResponse } from "next/server";
import { db, isDatabaseEnabled } from "@/lib/db/connection";
import { menus } from "@/lib/db/schema";
import { CreateMenuInput, MenuData, MenuItem } from "@/lib/types";

const STORAGE_KEY = "menu-control-menus";

// Helper function to calculate derived values
function calculateMenuValues(input: CreateMenuInput): {
  totalCost: number;
  costRate: number;
} {
  const totalCost = input.ingredients.reduce((sum, ing) => sum + ing.totalPrice, 0);
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

// GET /api/menus - Get all menus
export async function GET() {
  try {
    if (isDatabaseEnabled && db) {
      // Use database
      const result = await db.select().from(menus);
      const formattedMenus = result.map((menu) => ({
        id: menu.id,
        name: menu.name,
        imageUrl: menu.imageUrl,
        categoryId: menu.categoryId,
        totalCost: Number(menu.totalCost),
        sellingPrice: Number(menu.sellingPrice),
        costRate: Number(menu.costRate),
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
      }));

      return NextResponse.json(formattedMenus);
    } else {
      // Fallback to empty array (client-side localStorage will be used instead)
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

      const newMenu = {
        id: Date.now().toString(),
        name: input.name,
        imageUrl: input.imageUrl || "",
        categoryId: input.categoryId,
        ingredients: input.ingredients,
        sellingPrice: input.sellingPrice.toString(),
        totalCost: totalCost.toString(),
        costRate: costRate.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(menus).values(newMenu);

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
