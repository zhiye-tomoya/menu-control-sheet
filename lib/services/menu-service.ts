import { MenuData, MenuItem, CreateMenuInput, UpdateMenuInput } from "@/lib/types";

export const menuService = {
  // Get all menus
  async getMenus(): Promise<MenuItem[]> {
    const response = await fetch("/api/menus");
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
      throw new Error("Failed to create menu");
    }
    return response.json();
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
      throw new Error("Failed to update menu");
    }
    return response.json();
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
