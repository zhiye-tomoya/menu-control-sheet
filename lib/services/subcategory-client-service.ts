import { Subcategory, CreateSubcategoryInput, UpdateSubcategoryInput } from "@/lib/types";

export const subcategoryClientService = {
  // Get all subcategories
  async getSubcategories(): Promise<Subcategory[]> {
    const response = await fetch("/api/subcategories");
    if (!response.ok) {
      throw new Error("Failed to fetch subcategories");
    }
    return response.json();
  },

  // Get subcategories by category ID
  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    const response = await fetch(`/api/subcategories?categoryId=${categoryId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch subcategories");
    }
    return response.json();
  },

  // Get a single subcategory by ID
  async getSubcategory(id: string): Promise<Subcategory | null> {
    const response = await fetch(`/api/subcategories/${id}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error("Failed to fetch subcategory");
    }
    return response.json();
  },

  // Create a new subcategory
  async createSubcategory(input: CreateSubcategoryInput): Promise<Subcategory> {
    const response = await fetch("/api/subcategories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create subcategory";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use status text
        errorMessage = `Failed to create subcategory: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Additional validation - make sure we got a valid subcategory back
    if (!result || !result.id || !result.name) {
      throw new Error("Invalid response from server when creating subcategory");
    }

    return result;
  },

  // Update an existing subcategory
  async updateSubcategory(input: UpdateSubcategoryInput): Promise<Subcategory> {
    const response = await fetch(`/api/subcategories/${input.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update subcategory";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use status text
        errorMessage = `Failed to update subcategory: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Additional validation - make sure we got a valid subcategory back
    if (!result || !result.id || !result.name) {
      throw new Error("Invalid response from server when updating subcategory");
    }

    return result;
  },

  // Delete a subcategory
  async deleteSubcategory(id: string): Promise<void> {
    const response = await fetch(`/api/subcategories/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete subcategory");
    }
  },
};
