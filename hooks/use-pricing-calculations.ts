"use client";

import { useMemo } from "react";

interface UsePricingCalculationsProps {
  totalCost: number;
  sellingPrice: number;
}

interface UsePricingCalculationsReturn {
  costRate: number;
  discountPrice: number;
  formattedCostRate: string;
  formattedDiscountPrice: string;
  formattedTotalCost: string;
}

export function usePricingCalculations({ totalCost, sellingPrice }: UsePricingCalculationsProps): UsePricingCalculationsReturn {
  // Calculate cost rate percentage
  const costRate = useMemo(() => {
    return sellingPrice > 0 ? (totalCost / sellingPrice) * 100 : 0;
  }, [totalCost, sellingPrice]);

  // Calculate discount price (87.3% of selling price)
  const discountPrice = useMemo(() => {
    return Math.round(sellingPrice * 0.873);
  }, [sellingPrice]);

  // Formatted values for display
  const formattedCostRate = useMemo(() => {
    return `${costRate.toFixed(1)}%`;
  }, [costRate]);

  const formattedDiscountPrice = useMemo(() => {
    return `¥${discountPrice}`;
  }, [discountPrice]);

  const formattedTotalCost = useMemo(() => {
    return `¥${totalCost.toFixed(0)}`;
  }, [totalCost]);

  return {
    costRate,
    discountPrice,
    formattedCostRate,
    formattedDiscountPrice,
    formattedTotalCost,
  };
}
