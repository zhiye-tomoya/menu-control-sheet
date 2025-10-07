// Unit conversion utilities for ingredient pricing calculations

export interface UnitConversion {
  from: string;
  to: string;
  factor: number;
}

// Common unit conversions
export const UNIT_CONVERSIONS: UnitConversion[] = [
  // Weight conversions
  { from: "g", to: "kg", factor: 1000 },
  { from: "kg", to: "g", factor: 0.001 },

  // Volume conversions
  { from: "ml", to: "l", factor: 1000 },
  { from: "l", to: "ml", factor: 0.001 },

  // Same unit conversions (no conversion needed)
  { from: "個", to: "個", factor: 1 },
  { from: "袋", to: "袋", factor: 1 },
  { from: "振り", to: "振り", factor: 1 },
  { from: "枚", to: "枚", factor: 1 },
];

/**
 * Get the conversion factor between two units
 * @param fromUnit - The unit to convert from
 * @param toUnit - The unit to convert to
 * @returns The conversion factor, or null if conversion is not possible
 */
export function getConversionFactor(fromUnit: string, toUnit: string): number | null {
  // If units are the same, no conversion needed
  if (fromUnit === toUnit) {
    return 1;
  }

  // Find direct conversion
  const directConversion = UNIT_CONVERSIONS.find((conversion) => conversion.from === fromUnit && conversion.to === toUnit);

  if (directConversion) {
    return directConversion.factor;
  }

  // Find inverse conversion
  const inverseConversion = UNIT_CONVERSIONS.find((conversion) => conversion.from === toUnit && conversion.to === fromUnit);

  if (inverseConversion) {
    return 1 / inverseConversion.factor;
  }

  // No conversion found
  return null;
}

/**
 * Calculate the actual cost per unit based on the pricing structure
 * @param quantity - Recipe quantity (e.g., 12)
 * @param recipeUnit - Recipe unit (e.g., "g")
 * @param unitPrice - Price per pricing unit (e.g., 350 for ¥350/bag)
 * @param pricingUnit - Pricing unit (e.g., "袋")
 * @param conversionFactor - How many recipe units per pricing unit (e.g., 250 for 250g/bag)
 * @returns The calculated cost for the recipe quantity
 */
export function calculateIngredientCost(quantity: number, recipeUnit: string, unitPrice: number, pricingUnit?: string, conversionFactor?: number): number {
  // If no pricing unit or conversion factor is specified, use the old calculation
  if (!pricingUnit || !conversionFactor) {
    return quantity * unitPrice;
  }

  // Calculate cost based on conversion
  // Example: 12g ÷ 250g/bag × ¥350/bag = ¥16.8
  const costPerPricingUnit = unitPrice;
  const recipeUnitsPerPricingUnit = conversionFactor;

  return (quantity / recipeUnitsPerPricingUnit) * costPerPricingUnit;
}

/**
 * Get suggested pricing units for a given recipe unit
 * @param recipeUnit - The recipe unit (e.g., "g", "ml")
 * @returns Array of suggested pricing units
 */
export function getSuggestedPricingUnits(recipeUnit: string): string[] {
  switch (recipeUnit) {
    case "g":
      return ["g", "kg", "袋"];
    case "ml":
      return ["ml", "l", "袋"];
    case "個":
      return ["個", "袋"];
    case "振り":
      return ["振り", "袋"];
    case "枚":
      return ["枚", "袋"];
    default:
      return [recipeUnit, "袋"];
  }
}

/**
 * Get default conversion factors for common pricing units
 * @param recipeUnit - The recipe unit
 * @param pricingUnit - The pricing unit
 * @returns A reasonable default conversion factor
 */
export function getDefaultConversionFactor(recipeUnit: string, pricingUnit: string): number {
  // Same unit, no conversion
  if (recipeUnit === pricingUnit) {
    return 1;
  }

  // Standard conversions
  if (recipeUnit === "g" && pricingUnit === "kg") {
    return 1000;
  }
  if (recipeUnit === "ml" && pricingUnit === "l") {
    return 1000;
  }

  // Common bag sizes
  if (pricingUnit === "袋") {
    switch (recipeUnit) {
      case "g":
        return 250; // 250g per bag (common for coffee, flour, etc.)
      case "ml":
        return 500; // 500ml per bag/bottle
      case "個":
        return 10; // 10 pieces per bag
      case "振り":
        return 50; // 50 shakes per container
      case "枚":
        return 20; // 20 sheets per pack
      default:
        return 1;
    }
  }

  return 1;
}
