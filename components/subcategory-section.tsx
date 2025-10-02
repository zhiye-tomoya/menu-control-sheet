"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderPlus, Edit } from "lucide-react";
import { Subcategory } from "@/lib/types";

interface SubcategorySectionProps {
  subcategories: Subcategory[];
  subcategoryId: string;
  categoryId: string;
  onSubcategoryChange: (id: string) => void;
  onCreateSubcategory: () => void;
  onEditSubcategory: () => void;
}

export function SubcategorySection({ subcategories, subcategoryId, categoryId, onSubcategoryChange, onCreateSubcategory, onEditSubcategory }: SubcategorySectionProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4 border-2 sm:border-4 border-primary bg-muted/30'>
      <div className='bg-muted md:border-r-4 border-primary p-3 sm:p-4 flex items-center'>
        <label className='text-base sm:text-lg font-bold text-foreground'>サブカテゴリ</label>
      </div>
      <div className='col-span-3 p-3 sm:p-4'>
        <div className='flex flex-col gap-2'>
          <Select value={subcategoryId} onValueChange={onSubcategoryChange}>
            <SelectTrigger className='text-base sm:text-lg font-medium border-2 border-primary bg-card flex-1'>
              <SelectValue placeholder='サブカテゴリを選択' />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant='outline' size='lg' onClick={onCreateSubcategory} className='border-2 border-primary hover:bg-muted bg-transparent' disabled={!categoryId}>
            <FolderPlus className='h-4 w-4 mr-1 sm:mr-2' />
            <span className='hidden sm:inline'>サブカテゴリを作成</span>
            <span className='sm:hidden'>作成</span>
          </Button>
          <Button variant='outline' size='lg' className='border-2 border-primary hover:bg-muted bg-transparent' disabled={!subcategoryId || subcategories.length === 0} onClick={onEditSubcategory}>
            <Edit className='h-4 w-4 mr-1 sm:mr-2' />
            <span className='hidden sm:inline'>サブカテゴリを編集</span>
            <span className='sm:hidden'>編集</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
