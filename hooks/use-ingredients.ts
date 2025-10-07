"use client";

import { useState, useEffect } from "react";
import { Ingredient } from "@/lib/types";

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
    unitPrice: 3.5,
    totalPrice: 42.0,
  },
  {
    id: "2",
    no: 2,
    name: "紙カップ",
    quantity: 1.0,
    unit: "個",
    unitPrice: 15.0,
    totalPrice: 15.0,
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

        // Recalculate total price when quantity or unit price changes
        if (field === "quantity" || field === "unitPrice") {
          updated.totalPrice = Number(updated.quantity) * Number(updated.unitPrice);
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
