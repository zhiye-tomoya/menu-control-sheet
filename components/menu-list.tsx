"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Loader2, Plus } from "lucide-react";
import { useMenusPaginated, useDeleteMenu } from "@/hooks/use-menu-queries";
import { useMenuFilters } from "@/hooks/use-menu-filters";
import { useMenuPagination } from "@/hooks/use-menu-pagination";
import { categoryClientService } from "@/lib/services/category-client-service";
import { subcategoryClientService } from "@/lib/services/subcategory-client-service";
import { Category, Subcategory, MenuItem, PaginatedResponse } from "@/lib/types";
import { toast } from "sonner";
import { MobileBottomNavigation } from "@/components/mobile-bottom-navigation";
import { MenuListHeader } from "@/components/menu-list-header";
import { CategoryFilters } from "@/components/category-filters";
import { MenuGrid } from "@/components/menu-grid";
import { CategoryDialog } from "@/components/category-dialog";

interface MenuListProps {
  onEditMenu: (menuId: string | null) => void;
  isAdmin?: boolean;
}

export function MenuList({ onEditMenu, isAdmin = false }: MenuListProps) {
  // Get URL parameters
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId");

  // Invalidate cache when shopId changes to ensure fresh data
  useEffect(() => {
    // This will be handled by the useEffect dependency in the query hook
  }, [shopId]);

  // State for categories and subcategories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // Category dialog state
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Get menus filtered by shopId if provided
  const { data, isLoading, error } = useMenusPaginated({
    page: 1,
    limit: 1000, // Get all menus, we'll paginate client-side per category
    shopId: shopId || undefined,
  });
  const deleteMenuMutation = useDeleteMenu();

  // Extract menus from response
  const menus = Array.isArray(data) ? data : (data as PaginatedResponse<MenuItem>)?.data || [];

  // Use our custom hooks
  const menuFilters = useMenuFilters({ menus, categories, subcategories });
  const menuPagination = useMenuPagination({ menusPerPage: 6 });

  // Load categories and subcategories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedCategories, fetchedSubcategories] = await Promise.all([categoryClientService.getCategories(), subcategoryClientService.getSubcategories()]);

        setCategories(fetchedCategories);
        setSubcategories(fetchedSubcategories);
      } catch (error) {
        console.error("Failed to load categories and subcategories:", error);
      }
    };

    loadData();
  }, []);

  // Menu operations
  const handleDeleteMenu = async (menuId: string) => {
    try {
      await deleteMenuMutation.mutateAsync(menuId);
    } catch (error) {
      // Error handling is done in the mutation hook with toast notifications
    }
  };

  // Category operations
  const handleCreateCategory = async (data: { name: string; description: string }) => {
    setIsCategoryLoading(true);
    try {
      const newCategory = await categoryClientService.createCategory(data);
      setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name, "ja")));
      toast.success("カテゴリを作成しました");
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("カテゴリの作成に失敗しました");
      throw error;
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const handleEditCategory = async (data: { name: string; description: string }) => {
    if (!editingCategory) return;

    setIsCategoryLoading(true);
    try {
      const updatedCategory = await categoryClientService.updateCategory({
        id: editingCategory.id,
        ...data,
      });

      setCategories((prev) => prev.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat)).sort((a, b) => a.name.localeCompare(b.name, "ja")));

      toast.success("カテゴリを更新しました");
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error("カテゴリの更新に失敗しました");
      throw error;
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setIsEditCategoryOpen(true);
  };

  const closeEditCategoryDialog = () => {
    setIsEditCategoryOpen(false);
    setEditingCategory(null);
  };

  // Prepare grouped menus with pagination info
  const groupedMenusWithPagination = menuFilters.groupedMenus.map((group) => {
    const currentPage = menuPagination.getSubcategoryPage(group.subcategory.id);
    const paginationInfo = menuPagination.getPaginationInfo(group.menus, currentPage);

    return {
      ...group,
      ...paginationInfo,
      currentPage,
      onPageChange: (page: number) => menuPagination.setSubcategoryPage(group.subcategory.id, page),
    };
  });

  // Prepare uncategorized menus with pagination info
  const uncategorizedPaginationInfo = menuPagination.getPaginationInfo(menuFilters.uncategorizedMenus, menuPagination.uncategorizedPage);

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-4'>
      <Card className='border-2 sm:border-4 border-primary bg-card'>
        {/* Header with search and actions */}
        <MenuListHeader searchTerm={menuFilters.searchTerm} onSearchChange={menuFilters.setSearchTerm} onCreateMenu={() => onEditMenu(null)} onCreateCategory={() => setIsCreateCategoryOpen(true)} isAdmin={isAdmin} />

        {/* Category and subcategory filters - desktop only */}
        <div className='p-4 sm:p-6'>
          <CategoryFilters categories={categories} subcategories={subcategories} selectedCategoryId={menuFilters.selectedCategoryId} selectedSubcategoryId={menuFilters.selectedSubcategoryId} onCategoryChange={menuFilters.setSelectedCategoryId} onSubcategoryChange={menuFilters.setSelectedSubcategoryId} onEditCategory={openEditCategoryDialog} availableSubcategories={menuFilters.availableSubcategories} />
        </div>

        {/* Main content */}
        <div className='p-4 sm:p-6'>
          {isLoading ? (
            <div className='text-center py-12'>
              <Loader2 className='mx-auto h-16 w-16 text-muted-foreground mb-4 animate-spin' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>メニューを読み込み中...</h3>
              <p className='text-muted-foreground'>しばらくお待ちください。</p>
            </div>
          ) : error ? (
            <div className='text-center py-12'>
              <Calculator className='mx-auto h-16 w-16 text-destructive mb-4' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>エラーが発生しました</h3>
              <p className='text-muted-foreground mb-6'>メニューの読み込みに失敗しました。</p>
              <Button onClick={() => window.location.reload()} size='lg' className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                再読み込み
              </Button>
            </div>
          ) : menuFilters.filteredMenus.length === 0 ? (
            <div className='text-center py-12'>
              <Calculator className='mx-auto h-16 w-16 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>{menuFilters.searchTerm ? "メニューが見つかりません" : "メニューがありません"}</h3>
              <p className='text-muted-foreground mb-6'>{menuFilters.searchTerm ? "検索条件に一致するメニューがありません。" : "新しいメニューを作成して原価計算を始めましょう。"}</p>
              {!menuFilters.searchTerm && (
                <Button onClick={() => onEditMenu(null)} size='lg' className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                  <Plus className='h-4 w-4 mr-2' />
                  最初のメニューを作成
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-8'>
              {/* Render grouped menus by subcategory */}
              {groupedMenusWithPagination.map((group) => (
                <MenuGrid key={group.subcategory.id} menus={group.paginatedMenus} title={group.subcategory.name} subtitle={group.parentCategory ? `カテゴリ: ${group.parentCategory.name}` : undefined} currentPage={group.currentPage} totalPages={group.totalPages} hasMultiplePages={group.hasMultiplePages} totalMenus={group.menus.length} startIndex={group.startIndex} endIndex={group.endIndex} onPageChange={group.onPageChange} onEditMenu={onEditMenu} onDeleteMenu={handleDeleteMenu} isDeleting={deleteMenuMutation.isPending ? deleteMenuMutation.variables : undefined} />
              ))}

              {/* Render uncategorized menus if any */}
              {menuFilters.uncategorizedMenus.length > 0 && <MenuGrid menus={uncategorizedPaginationInfo.paginatedMenus} title='未分類' currentPage={menuPagination.uncategorizedPage} totalPages={uncategorizedPaginationInfo.totalPages} hasMultiplePages={uncategorizedPaginationInfo.hasMultiplePages} totalMenus={menuFilters.uncategorizedMenus.length} startIndex={uncategorizedPaginationInfo.startIndex} endIndex={uncategorizedPaginationInfo.endIndex} onPageChange={menuPagination.setUncategorizedPage} onEditMenu={onEditMenu} onDeleteMenu={handleDeleteMenu} isDeleting={deleteMenuMutation.isPending ? deleteMenuMutation.variables : undefined} />}
            </div>
          )}
        </div>
      </Card>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        onEditMenu={onEditMenu}
        searchTerm={menuFilters.searchTerm}
        onSearchChange={menuFilters.setSearchTerm}
        categories={categories}
        onCategoryCreated={(newCategory) => {
          setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name, "ja")));
        }}
        selectedCategoryId={menuFilters.selectedCategoryId}
        onCategoryChange={menuFilters.setSelectedCategoryId}
        subcategories={subcategories}
        selectedSubcategoryId={menuFilters.selectedSubcategoryId}
        onSubcategoryChange={menuFilters.setSelectedSubcategoryId}
        isAdmin={isAdmin}
      />

      {/* Category Dialogs */}
      <CategoryDialog mode='create' isOpen={isCreateCategoryOpen} onClose={() => setIsCreateCategoryOpen(false)} onSubmit={handleCreateCategory} isLoading={isCategoryLoading} />

      <CategoryDialog mode='edit' isOpen={isEditCategoryOpen} onClose={closeEditCategoryDialog} onSubmit={handleEditCategory} initialData={editingCategory || undefined} isLoading={isCategoryLoading} />
    </div>
  );
}
