import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/lib/types";

export const categoryClientService = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return response.json();
  },

  // Get a single category by ID
  async getCategory(id: string): Promise<Category | null> {
    const response = await fetch(`/api/categories/${id}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error("Failed to fetch category");
    }
    return response.json();
  },

  // Create a new category
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to create category");
    }
    return response.json();
  },

  // Update an existing category
  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const response = await fetch(`/api/categories/${input.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to update category");
    }
    return response.json();
  },

  // Delete a category
  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete category");
    }
  },
};
