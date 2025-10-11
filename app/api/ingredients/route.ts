import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseEnabled } from "@/lib/db/connection";
import { ingredients } from "@/lib/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";

// GET /api/ingredients - Get all ingredients with optional search
export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseEnabled || !db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const shopId = searchParams.get("shopId");

    // Build conditions array - shopId filter is always required if provided
    const conditions = [];

    if (shopId) {
      conditions.push(eq(ingredients.shopId, shopId));
    }

    if (search) {
      conditions.push(or(ilike(ingredients.name, `%${search}%`), ilike(ingredients.description, `%${search}%`)));
    }

    if (category && category !== "all") {
      conditions.push(eq(ingredients.category, category));
    }

    let allIngredients;
    if (conditions.length > 0) {
      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
      allIngredients = await db.select().from(ingredients).where(whereClause).orderBy(ingredients.name);
    } else {
      // No shop filter provided - return all ingredients (for backward compatibility)
      allIngredients = await db.select().from(ingredients).orderBy(ingredients.name);
    }

    return NextResponse.json(allIngredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json({ error: "Failed to fetch ingredients" }, { status: 500 });
  }
}

// POST /api/ingredients - Create a new ingredient
export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseEnabled || !db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const body = await request.json();
    const { name, defaultUnit, pricingUnit, conversionFactor, currentPrice, category, description, shopId } = body;

    // Validate required fields
    if (!name || !defaultUnit || !pricingUnit || !conversionFactor || !currentPrice || !shopId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a unique ID
    const id = `ing_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newIngredient = {
      id,
      name: name.trim(),
      defaultUnit,
      pricingUnit,
      conversionFactor: String(conversionFactor),
      currentPrice: String(currentPrice),
      category: category?.trim() || "",
      description: description?.trim() || "",
      shopId,
    };

    const [createdIngredient] = await db.insert(ingredients).values(newIngredient).returning();

    return NextResponse.json(createdIngredient, { status: 201 });
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json({ error: "Failed to create ingredient" }, { status: 500 });
  }
}
