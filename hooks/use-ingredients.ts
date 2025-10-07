"use client";

import { useState, useEffect } from "react";
import { Ingredient } from "@/lib/types";
import { calculateIngredientCost, getDefaultConversionFactor } from "@/lib/unit-conversions";

interface UseIngredientsProps {
  existingIngredients?: Ingredient[];
}

interface UseIngredientsReturn {
  ingredients: Ingredient[];
  totalCost: number;
  addIngredient: () => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, field: keyof Ingredient, value: string | number) => void;
  setIngredients: (ingredients: Ingredient[]) => void;
  resetIngredients: () => void;
}

const defaultIngredients: Ingredient[] = [
  {
    id: "1",
    no: 1,
    name: "コーヒー豆",
    quantity: 12.0,
    unit: "g",
    unitPrice: 350.0, // ¥350 per bag
    totalPrice: 16.8, // 12g ÷ 250g/bag × ¥350/bag = ¥16.8
    pricingUnit: "袋",
    conversionFactor: 250, // 250g per bag
  },
  {
    id: "2",
    no: 2,
    name: "紙カップ",
    quantity: 1.0,
    unit: "個",
    unitPrice: 15.0,
    totalPrice: 15.0,
    pricingUnit: "個",
    conversionFactor: 1,
  },
];

export function useIngredients({ existingIngredients }: UseIngredientsProps = {}): UseIngredientsReturn {
  const [ingredients, setIngredients] = useState<Ingredient[]>(existingIngredients || defaultIngredients);

  // Update ingredients when existingIngredients changes
  useEffect(() => {
    if (existingIngredients && existingIngredients.length > 0) {
      setIngredients(existingIngredients);
    }
  }, [existingIngredients]);

  // Calculate total cost
  const totalCost = ingredients.reduce((sum, ing) => sum + ing.totalPrice, 0);

  // Add a new ingredient
  const addIngredient = () => {
    const maxNo = Math.max(...ingredients.map((i) => i.no), 0);
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      no: maxNo + 1,
      name: "",
      quantity: 0,
      unit: "g",
      unitPrice: 0,
      totalPrice: 0,
      pricingUnit: "g",
      conversionFactor: 1,
    };
    setIngredients((prev) => [...prev, newIngredient]);
  };

  // Remove an ingredient
  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  // Update an ingredient field
  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        const updated = { ...ing, [field]: value };

        // Set default pricing unit and conversion factor when recipe unit changes
        if (field === "unit") {
          const recipeUnit = String(value);
          if (!updated.pricingUnit) {
            updated.pricingUnit = recipeUnit;
            updated.conversionFactor = 1;
          } else {
            // Update conversion factor if pricing unit exists
            updated.conversionFactor = getDefaultConversionFactor(recipeUnit, updated.pricingUnit);
          }
        }

        // Set default conversion factor when pricing unit changes
        if (field === "pricingUnit") {
          const pricingUnit = String(value);
          updated.conversionFactor = getDefaultConversionFactor(updated.unit, pricingUnit);
        }

        // Recalculate total price when any pricing-related field changes
        if (field === "quantity" || field === "unitPrice" || field === "unit" || field === "pricingUnit" || field === "conversionFactor") {
          updated.totalPrice = calculateIngredientCost(Number(updated.quantity), updated.unit, Number(updated.unitPrice), updated.pricingUnit, Number(updated.conversionFactor));
        }

        return updated;
      })
    );
  };

  // Reset to default ingredients
  const resetIngredients = () => {
    setIngredients(defaultIngredients);
  };

  return {
    ingredients,
    totalCost,
    addIngredient,
    removeIngredient,
    updateIngredient,
    setIngredients,
    resetIngredients,
  };
}
