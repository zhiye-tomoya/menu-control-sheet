import { NextResponse } from "next/server";
import { db, isDatabaseEnabled } from "@/lib/db/connection";
import { subcategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UpdateSubcategoryInput } from "@/lib/types";

// GET /api/subcategories/[id] - Get a single subcategory by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDatabaseEnabled && db) {
      const result = await db.select().from(subcategories).where(eq(subcategories.id, params.id));

      if (result.length === 0) {
        return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
      }

      const subcategory = result[0];
      const formattedSubcategory = {
        ...subcategory,
        createdAt: subcategory.createdAt.toISOString(),
        updatedAt: subcategory.updatedAt.toISOString(),
      };

      return NextResponse.json(formattedSubcategory);
    } else {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
}

// PUT /api/subcategories/[id] - Update a subcategory
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDatabaseEnabled && db) {
      const input: UpdateSubcategoryInput = await request.json();

      const updatedSubcategory = {
        name: input.name,
        description: input.description || "",
        categoryId: input.categoryId,
        updatedAt: new Date(),
      };

      await db.update(subcategories).set(updatedSubcategory).where(eq(subcategories.id, params.id));

      // Fetch and return the updated subcategory
      const result = await db.select().from(subcategories).where(eq(subcategories.id, params.id));

      if (result.length === 0) {
        return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
      }

      const subcategory = result[0];
      const formattedSubcategory = {
        ...subcategory,
        createdAt: subcategory.createdAt.toISOString(),
        updatedAt: subcategory.updatedAt.toISOString(),
      };

      return NextResponse.json(formattedSubcategory);
    } else {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
}

// DELETE /api/subcategories/[id] - Delete a subcategory
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (isDatabaseEnabled && db) {
      await db.delete(subcategories).where(eq(subcategories.id, params.id));
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
}
