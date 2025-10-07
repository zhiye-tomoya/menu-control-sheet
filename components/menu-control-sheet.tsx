"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useIngredients } from "@/hooks/use-ingredients";
import { usePricingCalculations } from "@/hooks/use-pricing-calculations";
import { useCategorySubcategory } from "@/hooks/use-category-subcategory";
import { useMenuForm } from "@/hooks/use-menu-form";
import { useMenu } from "@/hooks/use-menu-queries";
import { MenuFormHeader } from "@/components/menu-form-header";
import { ProductNameSection } from "@/components/product-name-section";
import { CategorySection } from "@/components/category-section";
import { SubcategorySection } from "@/components/subcategory-section";
import { ImageUploadSection } from "@/components/image-upload-section";
import { IngredientsTable } from "@/components/ingredients-table";
import { PricingSection } from "@/components/pricing-section";
import { MenuFormActions } from "@/components/menu-form-actions";
import { CategoryDialog } from "@/components/category-dialog";
import { MobileBottomNavigation } from "@/components/mobile-bottom-navigation";
import { subcategoryClientService } from "@/lib/services/subcategory-client-service";
import { Category, Subcategory } from "@/lib/types";

interface MenuControlSheetProps {
  menuId: string | null;
  onBack: () => void;
}

export function MenuControlSheet({ menuId, onBack }: MenuControlSheetProps) {
  // Dialog states
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreateSubcategoryOpen, setIsCreateSubcategoryOpen] = useState(false);
  const [isEditSubcategoryOpen, setIsEditSubcategoryOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Load existing menu data first
  const { data: existingMenu, isLoading: isLoadingMenu } = useMenu(menuId || "");

  // Custom hooks with existing menu data
  const ingredients = useIngredients({
    existingIngredients: existingMenu?.ingredients,
  });

  const categorySubcategory = useCategorySubcategory({
    menuId,
    existingSubcategory:
      existingMenu?.subcategoryId && existingMenu?.categoryId
        ? {
            id: existingMenu.subcategoryId,
            categoryId: existingMenu.categoryId,
          }
        : undefined,
  });

  const menuForm = useMenuForm({
    menuId,
    ingredients: ingredients.ingredients,
    subcategoryId: categorySubcategory.subcategoryId,
    onBack,
  });

  const pricingCalculations = usePricingCalculations({
    totalCost: ingredients.totalCost,
    sellingPrice: menuForm.sellingPrice,
  });

  // Handle create category
  const handleCreateCategory = async (data: { name: string; description: string }) => {
    setIsCategoryLoading(true);
    try {
      await categorySubcategory.createCategory(data);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // Handle edit category
  const handleEditCategory = async (data: { name: string; description: string }) => {
    if (!editingCategory?.id) return;

    setIsCategoryLoading(true);
    try {
      await categorySubcategory.updateCategory(editingCategory.id, data);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // Handle create subcategory
  const handleCreateSubcategory = async (data: { name: string; description: string }) => {
    if (!categorySubcategory.categoryId) return;

    setIsCategoryLoading(true);
    try {
      await categorySubcategory.createSubcategory({
        ...data,
        categoryId: categorySubcategory.categoryId,
      });
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // Handle edit subcategory
  const handleEditSubcategory = async (data: { name: string; description: string }) => {
    if (!editingSubcategory?.id || !categorySubcategory.categoryId) return;

    setIsCategoryLoading(true);
    try {
      await categorySubcategory.updateSubcategory(editingSubcategory.id, {
        ...data,
        categoryId: categorySubcategory.categoryId,
      });
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // Open edit subcategory dialog
  const openEditSubcategoryDialog = () => {
    const currentSubcategory = categorySubcategory.subcategories.find((sub) => sub.id === categorySubcategory.subcategoryId);
    if (currentSubcategory) {
      setEditingSubcategory(currentSubcategory);
      setIsEditSubcategoryOpen(true);
    }
  };

  // Handle reset with ingredients
  const handleReset = () => {
    menuForm.handleReset();
    ingredients.resetIngredients();
  };

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-4'>
      <Card className='border-2 sm:border-4 border-primary bg-card'>
        {/* Header */}
        <MenuFormHeader menuId={menuId} onBack={onBack} />

        <div className='p-4 sm:p-6 space-y-4 sm:space-y-6 pb-24 sm:pb-6'>
          {/* Product Name Section */}
          <ProductNameSection productName={menuForm.productName} onChange={menuForm.setProductName} />

          {/* Category Section */}
          <CategorySection categories={categorySubcategory.categories} categoryId={categorySubcategory.categoryId} onCategoryChange={categorySubcategory.setCategoryId} onCreateCategory={() => setIsCreateCategoryOpen(true)} />

          {/* Subcategory Section */}
          <SubcategorySection subcategories={categorySubcategory.subcategories} subcategoryId={categorySubcategory.subcategoryId} categoryId={categorySubcategory.categoryId} onSubcategoryChange={categorySubcategory.setSubcategoryId} onCreateSubcategory={() => setIsCreateSubcategoryOpen(true)} onEditSubcategory={openEditSubcategoryDialog} />

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 border-4 border-primary'>
            {/* Image Upload Section */}
            <ImageUploadSection imageUrl={menuForm.imageUrl} onImageUpload={menuForm.handleImageUpload} />

            {/* Ingredients Table */}
            <IngredientsTable ingredients={ingredients.ingredients} formattedTotalCost={pricingCalculations.formattedTotalCost} onUpdateIngredient={ingredients.updateIngredient} onAddIngredient={ingredients.addIngredient} onRemoveIngredient={ingredients.removeIngredient} />
          </div>

          {/* Pricing Section */}
          <PricingSection sellingPrice={menuForm.sellingPrice} onSellingPriceChange={menuForm.setSellingPrice} formattedTotalCost={pricingCalculations.formattedTotalCost} formattedCostRate={pricingCalculations.formattedCostRate} formattedDiscountPrice={pricingCalculations.formattedDiscountPrice} />

          {/* Action Buttons - Hidden on mobile, visible on desktop */}
          <MenuFormActions onSave={menuForm.handleSave} onReset={handleReset} isSaving={menuForm.isSaving} isLoadingMenu={menuForm.isLoadingMenu} />
        </div>
      </Card>

      {/* Mobile Bottom Navigation for Edit Mode */}
      <MobileBottomNavigation isEditMode={true} onBack={onBack} onSave={menuForm.handleSave} onReset={handleReset} isSaving={menuForm.isSaving} isLoadingMenu={menuForm.isLoadingMenu} onEditMenu={() => {}} searchTerm='' onSearchChange={() => {}} categories={categorySubcategory.categories} onCategoryCreated={() => {}} selectedCategoryId={null} onCategoryChange={() => {}} subcategories={categorySubcategory.subcategories} selectedSubcategoryId={null} onSubcategoryChange={() => {}} />

      {/* Category Dialogs */}
      <CategoryDialog mode='create' isOpen={isCreateCategoryOpen} onClose={() => setIsCreateCategoryOpen(false)} onSubmit={handleCreateCategory} isLoading={isCategoryLoading} />

      <CategoryDialog
        mode='edit'
        isOpen={isEditCategoryOpen}
        onClose={() => {
          setIsEditCategoryOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleEditCategory}
        initialData={editingCategory || undefined}
        isLoading={isCategoryLoading}
      />

      {/* Subcategory Dialogs */}
      <CategoryDialog mode='create' isOpen={isCreateSubcategoryOpen} onClose={() => setIsCreateSubcategoryOpen(false)} onSubmit={handleCreateSubcategory} isLoading={isCategoryLoading} />

      <CategoryDialog
        mode='edit'
        isOpen={isEditSubcategoryOpen}
        onClose={() => {
          setIsEditSubcategoryOpen(false);
          setEditingSubcategory(null);
        }}
        onSubmit={handleEditSubcategory}
        initialData={editingSubcategory || undefined}
        isLoading={isCategoryLoading}
      />
    </div>
  );
}
