import { NextResponse } from "next/server";
import { db, isDatabaseEnabled } from "@/lib/db/connection";
import { subcategories } from "@/lib/db/schema";
import { CreateSubcategoryInput, Subcategory } from "@/lib/types";

const STORAGE_KEY = "menu-control-subcategories";

// LocalStorage fallback functions (for server-side localStorage simulation)
const getFromStorage = (): Subcategory[] => {
  if (typeof window === "undefined") {
    // Server-side: return empty array (in real app, you'd use a server-side storage)
    return [];
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveToStorage = (data: Subcategory[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

// GET /api/subcategories - Get all subcategories
export async function GET() {
  try {
    if (isDatabaseEnabled && db) {
      // Use database
      const result = await db.select().from(subcategories);
      const formattedSubcategories = result.map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description,
        categoryId: subcategory.categoryId,
        createdAt: subcategory.createdAt.toISOString(),
        updatedAt: subcategory.updatedAt.toISOString(),
      }));

      return NextResponse.json(formattedSubcategories);
    } else {
      // Fallback to empty array (client-side localStorage will be used instead)
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    // Return 503 for database issues to trigger localStorage fallback
    return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
  }
}

// POST /api/subcategories - Create a new subcategory
export async function POST(request: Request) {
  try {
    const input: CreateSubcategoryInput = await request.json();

    if (isDatabaseEnabled && db) {
      // Use database
      const newSubcategory = {
        id: Date.now().toString(),
        name: input.name,
        description: input.description || "",
        categoryId: input.categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(subcategories).values(newSubcategory);

      const responseSubcategory = {
        ...newSubcategory,
        createdAt: newSubcategory.createdAt.toISOString(),
        updatedAt: newSubcategory.updatedAt.toISOString(),
      };

      return NextResponse.json(responseSubcategory);
    } else {
      // Return error - client should use localStorage directly
      return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
    }
  } catch (error) {
    console.error("Error creating subcategory:", error);
    // Return 503 for database issues to trigger localStorage fallback
    return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
  }
}
