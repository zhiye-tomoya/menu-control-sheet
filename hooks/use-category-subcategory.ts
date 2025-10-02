"use client";

import { useState, useEffect } from "react";
import { Category, Subcategory } from "@/lib/types";
import { categoryClientService } from "@/lib/services/category-client-service";
import { subcategoryClientService } from "@/lib/services/subcategory-client-service";
import { toast } from "sonner";

interface UseCategorySubcategoryReturn {
  // State
  categories: Category[];
  subcategories: Subcategory[];
  categoryId: string;
  subcategoryId: string;

  // Actions
  setCategoryId: (id: string) => void;
  setSubcategoryId: (id: string) => void;
  setCategories: (categories: Category[]) => void;
  setSubcategories: (subcategories: Subcategory[]) => void;

  // Category operations
  createCategory: (data: { name: string; description: string }) => Promise<void>;
  updateCategory: (id: string, data: { name: string; description: string }) => Promise<void>;

  // Subcategory operations
  createSubcategory: (data: { name: string; description: string; categoryId: string }) => Promise<void>;
  updateSubcategory: (id: string, data: { name: string; description: string; categoryId: string }) => Promise<void>;

  // Loading states
  isLoadingCategories: boolean;
  isLoadingSubcategories: boolean;
}

export function useCategorySubcategory(menuId?: string | null): UseCategorySubcategoryReturn {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const fetchedCategories = await categoryClientService.getCategories();
        setCategories(fetchedCategories);

        // If no categories exist, create a default one
        if (fetchedCategories.length === 0) {
          const defaultCategory = await categoryClientService.createCategory({
            name: "デフォルト",
            description: "デフォルトカテゴリ",
          });
          setCategories([defaultCategory]);
          setCategoryId(defaultCategory.id);
        } else if (!menuId) {
          // Set first category as default for new menus
          setCategoryId(fetchedCategories[0].id);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("カテゴリの読み込みに失敗しました");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [menuId]);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!categoryId) {
        setSubcategories([]);
        setSubcategoryId("");
        return;
      }

      setIsLoadingSubcategories(true);
      try {
        const fetchedSubcategories = await subcategoryClientService.getSubcategoriesByCategory(categoryId);
        setSubcategories(fetchedSubcategories);

        // If no subcategories exist for this category, create a default one
        if (fetchedSubcategories.length === 0) {
          const defaultSubcategory = await subcategoryClientService.createSubcategory({
            name: "デフォルト",
            description: "デフォルトサブカテゴリ",
            categoryId: categoryId,
          });
          setSubcategories([defaultSubcategory]);
          setSubcategoryId(defaultSubcategory.id);
        } else {
          // Always set the first subcategory when category changes
          setSubcategoryId(fetchedSubcategories[0].id);
        }
      } catch (error) {
        console.error("Failed to load subcategories:", error);
        toast.error("サブカテゴリの読み込みに失敗しました");
      } finally {
        setIsLoadingSubcategories(false);
      }
    };

    loadSubcategories();
  }, [categoryId, menuId]);

  // Category operations
  const createCategory = async (data: { name: string; description: string }) => {
    try {
      const newCategory = await categoryClientService.createCategory(data);
      setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name, "ja")));
      setCategoryId(newCategory.id); // Select the newly created category
      toast.success("カテゴリを作成しました");
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("カテゴリの作成に失敗しました");
      throw error;
    }
  };

  const updateCategory = async (id: string, data: { name: string; description: string }) => {
    try {
      const updatedCategory = await categoryClientService.updateCategory({ id, ...data });
      setCategories((prev) => prev.map((cat) => (cat.id === id ? updatedCategory : cat)).sort((a, b) => a.name.localeCompare(b.name, "ja")));
      toast.success("カテゴリを更新しました");
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error("カテゴリの更新に失敗しました");
      throw error;
    }
  };

  // Subcategory operations
  const createSubcategory = async (data: { name: string; description: string; categoryId: string }) => {
    try {
      const newSubcategory = await subcategoryClientService.createSubcategory(data);
      setSubcategories((prev) => [...prev, newSubcategory].sort((a, b) => a.name.localeCompare(b.name, "ja")));
      setSubcategoryId(newSubcategory.id);
      toast.success("サブカテゴリを作成しました");
    } catch (error) {
      console.error("Failed to create subcategory:", error);
      toast.error("サブカテゴリの作成に失敗しました");
      throw error;
    }
  };

  const updateSubcategory = async (id: string, data: { name: string; description: string; categoryId: string }) => {
    try {
      const updatedSubcategory = await subcategoryClientService.updateSubcategory({ id, ...data });
      setSubcategories((prev) => prev.map((sub) => (sub.id === id ? updatedSubcategory : sub)).sort((a, b) => a.name.localeCompare(b.name, "ja")));
      toast.success("サブカテゴリを更新しました");
    } catch (error) {
      console.error("Failed to update subcategory:", error);
      toast.error("サブカテゴリの更新に失敗しました");
      throw error;
    }
  };

  return {
    // State
    categories,
    subcategories,
    categoryId,
    subcategoryId,

    // Actions
    setCategoryId,
    setSubcategoryId,
    setCategories,
    setSubcategories,

    // Category operations
    createCategory,
    updateCategory,

    // Subcategory operations
    createSubcategory,
    updateSubcategory,

    // Loading states
    isLoadingCategories,
    isLoadingSubcategories,
  };
}
