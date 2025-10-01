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
    const now = new Date().toISOString();

    if (!isDatabaseEnabled || !db) {
      // Fallback to localStorage
      const categories = getFromStorage();
      const categoryIndex = categories.findIndex((cat) => cat.id === input.id);

      if (categoryIndex === -1) {
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
      return updatedCategory;
    }

    try {
      const updatedData = {
        name: input.name,
        description: input.description || "",
        updatedAt: new Date(),
      };

      await db.update(categories).set(updatedData).where(eq(categories.id, input.id));

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
      return {
        ...category,
        description: category.description || "",
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      };
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
