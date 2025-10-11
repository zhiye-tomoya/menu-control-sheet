import { db, isDatabaseEnabled } from "../db/connection";
import { categories } from "../db/schema";
import { eq } from "drizzle-orm";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "../types";

export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    if (!isDatabaseEnabled || !db) {
      throw new Error("Database not configured");
    }

    try {
      const result = await db
        .select({
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        })
        .from(categories)
        .orderBy(categories.name);

      return result.map((category) => ({
        ...category,
        description: category.description || "",
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    if (!isDatabaseEnabled || !db) {
      throw new Error("Database not configured");
    }

    try {
      const result = await db
        .select({
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        })
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const category = result[0];
      return {
        ...category,
        description: category.description || "",
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error("Failed to fetch category:", error);
      throw new Error("Failed to fetch category");
    }
  }

  static async createCategory(input: CreateCategoryInput): Promise<Category> {
    if (!isDatabaseEnabled || !db) {
      throw new Error("Database not configured");
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    try {
      const dbCategory = {
        id,
        name: input.name,
        description: input.description || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(categories).values(dbCategory);

      return {
        id,
        name: input.name,
        description: input.description || "",
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error("Failed to create category:", error);
      throw new Error("Failed to create category");
    }
  }

  static async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    if (!isDatabaseEnabled || !db) {
      throw new Error("Database not configured");
    }

    try {
      // First check if the category exists
      const existingCategory = await db
        .select({
          id: categories.id,
        })
        .from(categories)
        .where(eq(categories.id, input.id))
        .limit(1);

      if (existingCategory.length === 0) {
        throw new Error("Category not found");
      }

      const updatedData = {
        name: input.name,
        description: input.description || "",
        updatedAt: new Date(),
      };

      const updateResult = await db.update(categories).set(updatedData).where(eq(categories.id, input.id));

      // Check if the update actually affected any rows
      if (!updateResult || updateResult.rowCount === 0) {
        throw new Error("Failed to update category - no rows affected");
      }

      const result = await db
        .select({
          id: categories.id,
          name: categories.name,
          description: categories.description,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        })
        .from(categories)
        .where(eq(categories.id, input.id))
        .limit(1);

      if (result.length === 0) {
        throw new Error("Category not found after update");
      }

      const category = result[0];
      const updatedCategory = {
        ...category,
        description: category.description || "",
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      };

      // Verify the update actually took effect
      if (updatedCategory.name !== input.name) {
        throw new Error("Update verification failed - name not updated");
      }

      return updatedCategory;
    } catch (error) {
      console.error("Failed to update category:", error);
      throw new Error("Failed to update category");
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    if (!isDatabaseEnabled || !db) {
      throw new Error("Database not configured");
    }

    try {
      const result = await db.delete(categories).where(eq(categories.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw new Error("Failed to delete category");
    }
  }
}
