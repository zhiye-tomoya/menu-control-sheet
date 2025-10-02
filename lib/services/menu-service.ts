import { MenuData, MenuItem, CreateMenuInput, UpdateMenuInput, PaginatedResponse, PaginationParams } from "@/lib/types";

export const menuService = {
  // Get all menus with optional pagination
  async getMenus(params?: PaginationParams): Promise<MenuItem[] | PaginatedResponse<MenuItem>> {
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      searchParams.append("limit", params.limit.toString());
    }

    const url = params?.limit ? `/api/menus?${searchParams}` : "/api/menus";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch menus");
    }
    return response.json();
  },

  // Get a single menu by ID
  async getMenu(id: string): Promise<MenuData | null> {
    const response = await fetch(`/api/menus/${id}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error("Failed to fetch menu");
    }
    return response.json();
  },

  // Create a new menu
  async createMenu(input: CreateMenuInput): Promise<MenuData> {
    const response = await fetch("/api/menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create menu";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use status text
        errorMessage = `Failed to create menu: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Additional validation - make sure we got a valid menu back
    if (!result || !result.id || !result.name) {
      throw new Error("Invalid response from server when creating menu");
    }

    return result;
  },

  // Update an existing menu
  async updateMenu(input: UpdateMenuInput): Promise<MenuData> {
    const response = await fetch(`/api/menus/${input.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update menu";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use status text
        errorMessage = `Failed to update menu: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Additional validation - make sure we got a valid menu back
    if (!result || !result.id || !result.name) {
      throw new Error("Invalid response from server when updating menu");
    }

    return result;
  },

  // Delete a menu
  async deleteMenu(id: string): Promise<void> {
    const response = await fetch(`/api/menus/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete menu");
    }
  },
};
