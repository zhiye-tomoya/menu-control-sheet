"use client";

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Category, Subcategory } from "@/lib/types";

interface CategoryFiltersProps {
  categories: Category[];
  subcategories: Subcategory[];
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onSubcategoryChange: (subcategoryId: string | null) => void;
  onEditCategory: (category: Category) => void;
  availableSubcategories: Subcategory[];
}

export function CategoryFilters({ categories, subcategories, selectedCategoryId, selectedSubcategoryId, onCategoryChange, onSubcategoryChange, onEditCategory, availableSubcategories }: CategoryFiltersProps) {
  return (
    <div className='hidden sm:block'>
      {/* Category Filter Buttons */}
      <div className='mb-4'>
        <div className='flex flex-wrap gap-2 justify-center'>
          <Button variant={selectedCategoryId === null ? "default" : "outline"} size='sm' onClick={() => onCategoryChange(null)} className={selectedCategoryId === null ? "bg-primary text-primary-foreground" : "border-2 border-primary hover:bg-muted"}>
            すべて
          </Button>
          {categories.map((category) => (
            <div key={category.id} className='flex items-center gap-1'>
              <Button variant={selectedCategoryId === category.id ? "default" : "outline"} size='sm' onClick={() => onCategoryChange(category.id)} className={selectedCategoryId === category.id ? "bg-primary text-primary-foreground" : "border-2 border-primary hover:bg-muted"}>
                {category.name}
              </Button>
              <Button variant='ghost' size='sm' onClick={() => onEditCategory(category)} className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted' title={`${category.name}を編集`}>
                <Edit className='h-3 w-3' />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Subcategory Filter Buttons */}
      {availableSubcategories.length > 0 && (
        <div className='mb-4'>
          <div className='flex flex-wrap gap-2 justify-center'>
            <Button variant={selectedSubcategoryId === null ? "secondary" : "outline"} size='sm' onClick={() => onSubcategoryChange(null)} className={selectedSubcategoryId === null ? "bg-secondary text-secondary-foreground" : "border border-secondary hover:bg-muted text-sm"}>
              {selectedCategoryId === null ? "全サブカテゴリ" : "全て"}
            </Button>
            {availableSubcategories.map((subcategory) => (
              <Button key={subcategory.id} variant={selectedSubcategoryId === subcategory.id ? "secondary" : "outline"} size='sm' onClick={() => onSubcategoryChange(subcategory.id)} className={selectedSubcategoryId === subcategory.id ? "bg-secondary text-secondary-foreground" : "border border-secondary hover:bg-muted text-sm"}>
                {subcategory.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
