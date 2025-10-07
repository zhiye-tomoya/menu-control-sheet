"use client";

import { IngredientData, CreateIngredientInput, UpdateIngredientInput, IngredientFilters } from "./ingredient-service";

export class IngredientClientService {
  static async getAll(filters?: IngredientFilters): Promise<IngredientData[]> {
    const params = new URLSearchParams();

    if (filters?.search) {
      params.append("search", filters.search);
    }

    if (filters?.category) {
      params.append("category", filters.category);
    }

    const response = await fetch(`/api/ingredients?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to fetch ingredients");
    }

    return response.json();
  }

  static async getById(id: string): Promise<IngredientData> {
    const response = await fetch(`/api/ingredients/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch ingredient");
    }

    return response.json();
  }

  static async create(input: CreateIngredientInput): Promise<IngredientData> {
    const response = await fetch("/api/ingredients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to create ingredient");
    }

    return response.json();
  }

  static async update(id: string, input: UpdateIngredientInput): Promise<IngredientData> {
    const response = await fetch(`/api/ingredients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to update ingredient");
    }

    return response.json();
  }

  static async delete(id: string): Promise<void> {
    const response = await fetch(`/api/ingredients/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete ingredient");
    }
  }
}
