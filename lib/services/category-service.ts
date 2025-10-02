import { db, isDatabaseEnabled } from "../db/connection";
import { categories } from "../db/schema";
import { eq } from "drizzle-orm";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "../types";

const STORAGE_KEY = "menu-control-categories";

// LocalStorage functions
const getFromStorage = (): Category[] => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveToStorage = (data: Category[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export class CategoryService {
  static async getAllCategories(): Promise<Category[]> {
    if (!isDatabaseEnabled || !db) {
      // Fallback to localStorage
      return getFromStorage().sort((a, b) => a.name.localeCompare(b.name));
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
      // Fallback to localStorage
      const categories = getFromStorage();
      return categories.find((cat) => cat.id === id) || null;
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
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const newCategory: Category = {
      id,
      name: input.name,
      description: input.description || "",
      createdAt: now,
      updatedAt: now,
    };

    if (!isDatabaseEnabled || !db) {
      // Fallback to localStorage
      const categories = getFromStorage();
      categories.push(newCategory);
      saveToStorage(categories);
      return newCategory;
    }

    try {
      const dbCategory = {
        id,
        name: input.name,
        description: input.description || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(categories).values(dbCategory);

      return newCategory;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw new Error("Failed to create category");
    }
  }

  static async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    console.log("CategoryService.updateCategory called with:", input);
    console.log("isDatabaseEnabled:", isDatabaseEnabled);
    console.log("db:", !!db);

    const now = new Date().toISOString();

    if (!isDatabaseEnabled || !db) {
      console.log("Using localStorage fallback for category update");
      // Fallback to localStorage
      const categories = getFromStorage();
      console.log("Current categories from storage:", categories.length);
      const categoryIndex = categories.findIndex((cat) => cat.id === input.id);
      console.log("Found category at index:", categoryIndex);

      if (categoryIndex === -1) {
        console.error("Category not found in localStorage:", input.id);
        throw new Error("Category not found");
      }

      const updatedCategory: Category = {
        ...categories[categoryIndex],
        name: input.name,
        description: input.description || "",
        updatedAt: now,
      };

      categories[categoryIndex] = updatedCategory;
      saveToStorage(categories);
      console.log("Updated category saved to localStorage:", updatedCategory);
      return updatedCategory;
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
      // Fallback to localStorage
      const categories = getFromStorage();
      const filteredCategories = categories.filter((cat) => cat.id !== id);
      const wasDeleted = filteredCategories.length < categories.length;
      if (wasDeleted) {
        saveToStorage(filteredCategories);
      }
      return wasDeleted;
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
