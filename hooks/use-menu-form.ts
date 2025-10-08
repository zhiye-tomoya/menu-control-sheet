"use client";

import { useState, useEffect } from "react";
import { Ingredient, RecipeIngredient } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useSaveMenu, useMenu } from "@/hooks/use-menu-queries";
import { subcategoryClientService } from "@/lib/services/subcategory-client-service";

interface UseMenuFormProps {
  menuId: string | null;
  getRecipeIngredients: () => Omit<RecipeIngredient, "createdAt">[];
  subcategoryId: string;
  onBack: () => void;
}

interface UseMenuFormReturn {
  // Form state
  productName: string;
  imageUrl: string;
  sellingPrice: number;

  // Form actions
  setProductName: (name: string) => void;
  setImageUrl: (url: string) => void;
  setSellingPrice: (price: number) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => Promise<void>;
  handleReset: () => void;

  // Loading states
  isLoadingMenu: boolean;
  isSaving: boolean;

  // Validation
  validateForm: () => boolean;
}

export function useMenuForm({ menuId, getRecipeIngredients, subcategoryId, onBack }: UseMenuFormProps): UseMenuFormReturn {
  // Form state
  const [productName, setProductName] = useState("ブレンドコーヒー");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState(450);

  // TanStack Query hooks
  const { data: existingMenu, isLoading: isLoadingMenu } = useMenu(menuId || "");
  const { saveMenu, isLoading: isSaving } = useSaveMenu();

  // Load existing menu data when editing
  useEffect(() => {
    const loadExistingMenuData = async () => {
      if (existingMenu) {
        setProductName(existingMenu.name);
        setImageUrl(existingMenu.imageUrl);
        setSellingPrice(existingMenu.sellingPrice);
      }
    };

    loadExistingMenuData();
  }, [existingMenu]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!productName.trim()) {
      toast.error({
        title: "商品名を入力してください",
        description: "商品名は必須項目です。",
      });
      return false;
    }

    if (sellingPrice <= 0) {
      toast.error({
        title: "販売価格を正しく入力してください",
        description: "販売価格は0円より大きい値を入力してください。",
      });
      return false;
    }

    const currentRecipeIngredients = getRecipeIngredients();

    if (currentRecipeIngredients.length === 0) {
      toast.error({
        title: "材料を追加してください",
        description: "少なくとも1つの材料を追加する必要があります。",
      });
      return false;
    }

    // Check if all ingredients have valid quantities
    const invalidIngredients = currentRecipeIngredients.filter((ri) => ri.quantity <= 0);
    if (invalidIngredients.length > 0) {
      toast.error({
        title: "材料の使用量を正しく入力してください",
        description: "すべての材料に0より大きい使用量を入力してください。",
      });
      return false;
    }

    if (!subcategoryId) {
      toast.error({
        title: "サブカテゴリを選択してください",
        description: "サブカテゴリは必須項目です。",
      });
      return false;
    }

    return true;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const menuInput = {
        name: productName.trim(),
        imageUrl: imageUrl,
        subcategoryId: subcategoryId,
        recipeIngredients: getRecipeIngredients(),
        sellingPrice: sellingPrice,
      };

      if (menuId) {
        // Update existing menu
        await saveMenu({ ...menuInput, id: menuId });
      } else {
        // Create new menu
        await saveMenu(menuInput);
      }

      onBack();
    } catch (error) {
      // Error handling is done in the mutation hook with toast notifications
      console.error("Failed to save menu:", error);
    }
  };

  // Handle reset
  const handleReset = () => {
    setProductName("ブレンドコーヒー");
    setImageUrl("");
    setSellingPrice(450);
  };

  return {
    // Form state
    productName,
    imageUrl,
    sellingPrice,

    // Form actions
    setProductName,
    setImageUrl,
    setSellingPrice,
    handleImageUpload,
    handleSave,
    handleReset,

    // Loading states
    isLoadingMenu,
    isSaving,

    // Validation
    validateForm,
  };
}
