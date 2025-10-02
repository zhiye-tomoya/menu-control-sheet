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
      let errorMessage = "Failed to create category";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use status text
        errorMessage = `Failed to create category: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Additional validation - make sure we got a valid category back
    if (!result || !result.id || !result.name) {
      throw new Error("Invalid response from server when creating category");
    }

    return result;
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
      let errorMessage = "Failed to update category";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use status text
        errorMessage = `Failed to update category: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Additional validation - make sure we got a valid category back
    if (!result || !result.id || !result.name) {
      throw new Error("Invalid response from server");
    }

    return result;
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
