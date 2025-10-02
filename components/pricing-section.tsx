"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PricingSectionProps {
  sellingPrice: number;
  onSellingPriceChange: (price: number) => void;
  formattedTotalCost: string;
  formattedCostRate: string;
  formattedDiscountPrice: string;
}

export function PricingSection({ sellingPrice, onSellingPriceChange, formattedTotalCost, formattedCostRate, formattedDiscountPrice }: PricingSectionProps) {
  return (
    <div className='border-2 sm:border-4 border-primary bg-card'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6'>
        <Card className='border-2 border-primary bg-muted/30 p-4'>
          <label className='text-sm font-bold text-foreground mb-3 block'>販売価格(税別)</label>
          <div className='flex items-center gap-2'>
            <span className='text-xl sm:text-2xl font-bold'>¥</span>
            <Input type='number' step='1' value={sellingPrice} onChange={(e) => onSellingPriceChange(Number.parseInt(e.target.value) || 0)} className='text-xl sm:text-2xl font-bold border-2 border-primary min-h-[48px]' />
          </div>
        </Card>

        <Card className='border-2 border-primary bg-muted/30 p-4'>
          <label className='text-sm font-bold text-foreground mb-3 block'>原価率</label>
          <div className='text-2xl sm:text-3xl font-bold text-foreground flex items-center min-h-[48px]'>{formattedCostRate}</div>
        </Card>

        <Card className='border-2 border-primary bg-muted/30 p-4 sm:col-span-2 lg:col-span-1'>
          <label className='text-sm font-bold text-foreground mb-3 block'>安売価格</label>
          <div className='text-2xl sm:text-3xl font-bold text-foreground flex items-center min-h-[48px]'>{formattedDiscountPrice}</div>
        </Card>
      </div>
    </div>
  );
}
