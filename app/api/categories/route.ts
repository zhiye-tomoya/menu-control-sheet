import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "@/lib/services/category-service";
import { CreateCategoryInput } from "@/lib/types";
import { isDatabaseEnabled } from "@/lib/db/connection";

// GET /api/categories - Get all categories
export async function GET() {
  if (!isDatabaseEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const categories = await CategoryService.getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  if (!isDatabaseEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body: CreateCategoryInput = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const categoryData: CreateCategoryInput = {
      name: body.name.trim(),
      description: body.description?.trim() || "",
    };

    const newCategory = await CategoryService.createCategory(categoryData);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
