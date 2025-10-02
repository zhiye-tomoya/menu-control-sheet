"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderPlus } from "lucide-react";
import { Category } from "@/lib/types";

interface CategorySectionProps {
  categories: Category[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  onCreateCategory: () => void;
}

export function CategorySection({ categories, categoryId, onCategoryChange, onCreateCategory }: CategorySectionProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4 border-2 sm:border-4 border-primary bg-muted/30'>
      <div className='bg-muted md:border-r-4 border-primary p-3 sm:p-4 flex items-center'>
        <label className='text-base sm:text-lg font-bold text-foreground'>カテゴリ</label>
      </div>
      <div className='col-span-3 p-3 sm:p-4'>
        <div className='flex flex-col gap-2'>
          <Select value={categoryId} onValueChange={onCategoryChange}>
            <SelectTrigger className='text-base sm:text-lg font-medium border-2 border-primary bg-card flex-1'>
              <SelectValue placeholder='カテゴリを選択' />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant='outline' size='lg' onClick={onCreateCategory} className='border-2 border-primary hover:bg-muted bg-transparent'>
            <FolderPlus className='h-4 w-4 mr-1 sm:mr-2' />
            <span className='hidden sm:inline'>カテゴリを作成</span>
            <span className='sm:hidden'>作成</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
