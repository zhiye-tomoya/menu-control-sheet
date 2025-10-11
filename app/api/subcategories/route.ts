import { NextResponse } from "next/server";
import { db, isDatabaseEnabled } from "@/lib/db/connection";
import { subcategories } from "@/lib/db/schema";
import { CreateSubcategoryInput } from "@/lib/types";

// GET /api/subcategories - Get all subcategories or filter by categoryId
export async function GET(request: Request) {
  try {
    if (!isDatabaseEnabled || !db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    // Use database with optional categoryId filter
    let result;
    if (categoryId) {
      // Filter by specific category
      const { eq } = await import("drizzle-orm");
      result = await db.select().from(subcategories).where(eq(subcategories.categoryId, categoryId));
    } else {
      // Get all subcategories
      result = await db.select().from(subcategories);
    }

    const formattedSubcategories = result.map((subcategory) => ({
      id: subcategory.id,
      name: subcategory.name,
      description: subcategory.description,
      categoryId: subcategory.categoryId,
      createdAt: subcategory.createdAt.toISOString(),
      updatedAt: subcategory.updatedAt.toISOString(),
    }));

    return NextResponse.json(formattedSubcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 });
  }
}

// POST /api/subcategories - Create a new subcategory
export async function POST(request: Request) {
  try {
    if (!isDatabaseEnabled || !db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const input: CreateSubcategoryInput = await request.json();

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
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
  }
}
