"use client";

import { Input } from "@/components/ui/input";

interface ProductNameSectionProps {
  productName: string;
  onChange: (name: string) => void;
}

export function ProductNameSection({ productName, onChange }: ProductNameSectionProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4 border-2 sm:border-4 border-primary bg-muted/30'>
      <div className='bg-muted md:border-r-4 border-primary p-3 sm:p-4 flex items-center'>
        <label className='text-base sm:text-lg font-bold text-foreground'>商品名</label>
      </div>
      <div className='col-span-3 p-3 sm:p-4'>
        <Input value={productName} onChange={(e) => onChange(e.target.value)} className='text-base sm:text-lg font-medium border-2 border-primary bg-card' />
      </div>
    </div>
  );
}
