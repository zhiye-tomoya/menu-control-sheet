"use client";

import { useState, useMemo } from "react";
import { MenuItem, Category, Subcategory } from "@/lib/types";

interface UseMenuFiltersProps {
  menus: MenuItem[];
  categories: Category[];
  subcategories: Subcategory[];
}

interface UseMenuFiltersReturn {
  // State
  searchTerm: string;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;

  // Actions
  setSearchTerm: (term: string) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedSubcategoryId: (id: string | null) => void;

  // Computed values
  filteredMenus: MenuItem[];
  groupedMenus: Array<{
    subcategory: Subcategory;
    parentCategory: Category | undefined;
    menus: MenuItem[];
  }>;
  uncategorizedMenus: MenuItem[];
  availableSubcategories: Subcategory[];
}

export function useMenuFilters({ menus, categories, subcategories }: UseMenuFiltersProps): UseMenuFiltersReturn {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  // Filter menus by search term
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => menu.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [menus, searchTerm]);

  // Get available subcategories based on selected category
  const availableSubcategories = useMemo(() => {
    return subcategories.filter((subcategory) => {
      if (selectedCategoryId !== null && subcategory.categoryId !== selectedCategoryId) {
        return false;
      }
      return true;
    });
  }, [subcategories, selectedCategoryId]);

  // Group menus by subcategories
  const groupedMenus = useMemo(() => {
    return subcategories
      .filter((subcategory) => {
        // Filter subcategories by selected category
        if (selectedCategoryId !== null && subcategory.categoryId !== selectedCategoryId) {
          return false;
        }
        // Filter by selected subcategory
        if (selectedSubcategoryId !== null && subcategory.id !== selectedSubcategoryId) {
          return false;
        }
        return true;
      })
      .map((subcategory) => {
        // Get all menus that belong to this subcategory
        const subcategoryMenus = filteredMenus.filter((menu) => menu.subcategoryId === subcategory.id).sort((a, b) => a.name.localeCompare(b.name, "ja"));

        // Get the parent category for display
        const parentCategory = categories.find((cat) => cat.id === subcategory.categoryId);

        return {
          subcategory,
          parentCategory,
          menus: subcategoryMenus,
        };
      })
      .filter((group) => group.menus.length > 0);
  }, [filteredMenus, subcategories, categories, selectedCategoryId, selectedSubcategoryId]);

  // Get uncategorized menus
  const uncategorizedMenus = useMemo(() => {
    return filteredMenus.filter((menu) => !subcategories.some((sub) => sub.id === menu.subcategoryId)).sort((a, b) => a.name.localeCompare(b.name, "ja"));
  }, [filteredMenus, subcategories]);

  return {
    // State
    searchTerm,
    selectedCategoryId,
    selectedSubcategoryId,

    // Actions
    setSearchTerm,
    setSelectedCategoryId: (id: string | null) => {
      setSelectedCategoryId(id);
      setSelectedSubcategoryId(null); // Reset subcategory when category changes
    },
    setSelectedSubcategoryId,

    // Computed values
    filteredMenus,
    groupedMenus,
    uncategorizedMenus,
    availableSubcategories,
  };
}
