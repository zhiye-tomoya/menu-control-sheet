import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "@/lib/services/category-service";
import { UpdateCategoryInput } from "@/lib/types";
import { isDatabaseEnabled } from "@/lib/db/connection";

// GET /api/categories/[id] - Get a single category
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isDatabaseEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const category = await CategoryService.getCategoryById(params.id);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Failed to fetch category:", error);
    // Return 503 for database issues to trigger localStorage fallback
    return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
  }
}

// PUT /api/categories/[id] - Update a category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isDatabaseEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const updateData: UpdateCategoryInput = {
      id: params.id,
      name: body.name.trim(),
      description: body.description?.trim() || "",
    };

    const updatedCategory = await CategoryService.updateCategory(updateData);
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Failed to update category:", error);
    // Return 503 for database issues to trigger localStorage fallback
    return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isDatabaseEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const wasDeleted = await CategoryService.deleteCategory(params.id);

    if (!wasDeleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete category:", error);
    // Return 503 for database issues to trigger localStorage fallback
    return NextResponse.json({ error: "Database not configured - use localStorage" }, { status: 503 });
  }
}
