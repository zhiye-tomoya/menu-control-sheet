import { db } from "@/lib/db/connection";
import { ingredients } from "@/lib/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";

export interface IngredientData {
  id: string;
  name: string;
  defaultUnit: string;
  pricingUnit: string;
  conversionFactor: string;
  currentPrice: string;
  category: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIngredientInput {
  name: string;
  defaultUnit: string;
  pricingUnit: string;
  conversionFactor: number;
  currentPrice: number;
  category?: string;
  description?: string;
}

export interface UpdateIngredientInput {
  name?: string;
  defaultUnit?: string;
  pricingUnit?: string;
  conversionFactor?: number;
  currentPrice?: number;
  category?: string;
  description?: string;
}

export interface IngredientFilters {
  search?: string;
  category?: string;
}

export class IngredientService {
  static async getAll(filters?: IngredientFilters): Promise<IngredientData[]> {
    if (!db) {
      throw new Error("Database not configured");
    }

    let allIngredients;

    if (filters?.search || (filters?.category && filters.category !== "all")) {
      // Apply filters
      const conditions = [];

      if (filters.search) {
        conditions.push(or(ilike(ingredients.name, `%${filters.search}%`), ilike(ingredients.description, `%${filters.search}%`)));
      }

      if (filters.category && filters.category !== "all") {
        conditions.push(eq(ingredients.category, filters.category));
      }

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
      allIngredients = await db.select().from(ingredients).where(whereClause).orderBy(ingredients.name);
    } else {
      // No filters
      allIngredients = await db.select().from(ingredients).orderBy(ingredients.name);
    }

    return allIngredients;
  }

  static async getById(id: string): Promise<IngredientData | null> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const result = await db.select().from(ingredients).where(eq(ingredients.id, id));
    return result.length > 0 ? result[0] : null;
  }

  static async create(input: CreateIngredientInput): Promise<IngredientData> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const id = `ing_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newIngredient = {
      id,
      name: input.name.trim(),
      defaultUnit: input.defaultUnit,
      pricingUnit: input.pricingUnit,
      conversionFactor: String(input.conversionFactor),
      currentPrice: String(input.currentPrice),
      category: input.category?.trim() || "",
      description: input.description?.trim() || "",
    };

    const [created] = await db.insert(ingredients).values(newIngredient).returning();
    return created;
  }

  static async update(id: string, input: UpdateIngredientInput): Promise<IngredientData | null> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.defaultUnit !== undefined) updateData.defaultUnit = input.defaultUnit;
    if (input.pricingUnit !== undefined) updateData.pricingUnit = input.pricingUnit;
    if (input.conversionFactor !== undefined) updateData.conversionFactor = String(input.conversionFactor);
    if (input.currentPrice !== undefined) updateData.currentPrice = String(input.currentPrice);
    if (input.category !== undefined) updateData.category = input.category.trim();
    if (input.description !== undefined) updateData.description = input.description.trim();

    const result = await db.update(ingredients).set(updateData).where(eq(ingredients.id, id)).returning();
    return result.length > 0 ? result[0] : null;
  }

  static async delete(id: string): Promise<boolean> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const result = await db.delete(ingredients).where(eq(ingredients.id, id)).returning();
    return result.length > 0;
  }

  static async getCategories(): Promise<string[]> {
    if (!db) {
      throw new Error("Database not configured");
    }

    const result = await db.selectDistinct({ category: ingredients.category }).from(ingredients).where(eq(ingredients.category, ingredients.category));

    return result
      .map((r) => r.category)
      .filter((cat): cat is string => cat !== null && cat.trim() !== "")
      .sort();
  }
}
