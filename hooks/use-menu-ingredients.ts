"use client";

import { useState, useEffect, useCallback } from "react";
import { BaseIngredient, RecipeIngredient, Ingredient } from "@/lib/types";
import { useToast } from "./use-toast";

interface MenuIngredientItem {
  id: string;
  ingredientId: string;
  ingredient: BaseIngredient;
  quantity: number;
  calculatedCost: number;
}

interface UseMenuIngredientsProps {
  existingRecipeIngredients?: RecipeIngredient[] | Ingredient[];
}

export function useMenuIngredients({ existingRecipeIngredients = [] }: UseMenuIngredientsProps) {
  const [menuIngredients, setMenuIngredients] = useState<MenuIngredientItem[]>([]);
  const { toast } = useToast();

  // Initialize from existing recipe ingredients
  useEffect(() => {
    if (existingRecipeIngredients && existingRecipeIngredients.length > 0) {
      // Check if it's the new RecipeIngredient format or legacy Ingredient format
      const firstItem = existingRecipeIngredients[0];

      if ("ingredientId" in firstItem && "calculatedCost" in firstItem) {
        // New RecipeIngredient format
        const convertedIngredients = (existingRecipeIngredients as RecipeIngredient[])
          .filter((ri) => ri.ingredient) // Only include ingredients with populated data
          .map((ri) => ({
            id: ri.id,
            ingredientId: ri.ingredientId,
            ingredient: ri.ingredient!,
            quantity: ri.quantity,
            calculatedCost: ri.calculatedCost,
          }));
        setMenuIngredients(convertedIngredients);
      } else if ("totalPrice" in firstItem && "unitPrice" in firstItem) {
        // Legacy Ingredient format - convert to new format
        const convertedIngredients = (existingRecipeIngredients as Ingredient[]).map((ingredient) => {
          // Create a BaseIngredient from legacy data
          const baseIngredient: BaseIngredient = {
            id: ingredient.id,
            name: ingredient.name,
            defaultUnit: ingredient.unit,
            pricingUnit: ingredient.pricingUnit || ingredient.unit,
            conversionFactor: ingredient.conversionFactor || 1,
            currentPrice: ingredient.unitPrice,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            id: ingredient.id,
            ingredientId: ingredient.id,
            ingredient: baseIngredient,
            quantity: ingredient.quantity,
            calculatedCost: ingredient.totalPrice,
          };
        });
        setMenuIngredients(convertedIngredients);
      }
    }
  }, [existingRecipeIngredients]);

  // Calculate cost for an ingredient based on quantity
  const calculateCost = useCallback((ingredient: BaseIngredient, quantity: number): number => {
    // Cost = (quantity in default unit / conversion factor) * current price
    const costPerDefaultUnit = ingredient.currentPrice / ingredient.conversionFactor;
    return quantity * costPerDefaultUnit;
  }, []);

  // Add ingredient from central database
  const addIngredientFromDatabase = useCallback(
    (ingredient: BaseIngredient, initialQuantity: number = 1) => {
      const existingIndex = menuIngredients.findIndex((mi) => mi.ingredientId === ingredient.id);

      if (existingIndex >= 0) {
        toast({
          title: "材料は既に追加されています",
          description: `${ingredient.name}は既にレシピに含まれています。`,
          variant: "destructive",
        });
        return;
      }

      const newMenuIngredient: MenuIngredientItem = {
        id: `menu_ing_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        ingredientId: ingredient.id,
        ingredient,
        quantity: initialQuantity,
        calculatedCost: calculateCost(ingredient, initialQuantity),
      };

      setMenuIngredients((prev) => [...prev, newMenuIngredient]);

      toast({
        title: "材料を追加しました",
        description: `${ingredient.name}をレシピに追加しました。`,
      });
    },
    [menuIngredients, calculateCost, toast]
  );

  // Update ingredient quantity
  const updateIngredientQuantity = useCallback(
    (menuIngredientId: string, newQuantity: number) => {
      setMenuIngredients((prev) =>
        prev.map((mi) => {
          if (mi.id === menuIngredientId) {
            return {
              ...mi,
              quantity: newQuantity,
              calculatedCost: calculateCost(mi.ingredient, newQuantity),
            };
          }
          return mi;
        })
      );
    },
    [calculateCost]
  );

  // Remove ingredient from menu
  const removeIngredient = useCallback((menuIngredientId: string) => {
    setMenuIngredients((prev) => prev.filter((mi) => mi.id !== menuIngredientId));
  }, []);

  // Calculate total cost
  const totalCost = menuIngredients.reduce((sum, mi) => sum + mi.calculatedCost, 0);

  // Reset ingredients
  const resetIngredients = useCallback(() => {
    setMenuIngredients([]);
  }, []);

  // Convert to RecipeIngredient format for saving
  const getRecipeIngredients = useCallback((): Omit<RecipeIngredient, "createdAt">[] => {
    return menuIngredients.map((mi) => ({
      id: mi.id,
      ingredientId: mi.ingredientId,
      quantity: mi.quantity,
      calculatedCost: mi.calculatedCost,
    }));
  }, [menuIngredients]);

  // Get selected ingredient IDs (for picker filtering)
  const selectedIngredientIds = menuIngredients.map((mi) => mi.ingredientId);

  return {
    menuIngredients,
    totalCost,
    selectedIngredientIds,
    addIngredientFromDatabase,
    updateIngredientQuantity,
    removeIngredient,
    resetIngredients,
    getRecipeIngredients,
  };
}
