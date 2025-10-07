"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FolderPlus, Search, Loader2, Filter, ArrowLeft, Save, RotateCcw, Package } from "lucide-react";
import Link from "next/link";
import { categoryClientService } from "@/lib/services/category-client-service";
import { Category, Subcategory } from "@/lib/types";
import { toast } from "sonner";

interface MobileBottomNavigationProps {
  onEditMenu: (menuId: string | null) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  onCategoryCreated: (category: Category) => void;
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  subcategories: Subcategory[];
  selectedSubcategoryId: string | null;
  onSubcategoryChange: (subcategoryId: string | null) => void;
  // New props for edit mode
  isEditMode?: boolean;
  onBack?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  isSaving?: boolean;
  isLoadingMenu?: boolean;
}

export function MobileBottomNavigation({ onEditMenu, searchTerm, onSearchChange, categories, onCategoryCreated, selectedCategoryId, onCategoryChange, subcategories, selectedSubcategoryId, onSubcategoryChange, isEditMode = false, onBack, onSave, onReset, isSaving, isLoadingMenu }: MobileBottomNavigationProps) {
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showCategoryOverlay, setShowCategoryOverlay] = useState(false);
  const [showSubcategoryOverlay, setShowSubcategoryOverlay] = useState(false);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("カテゴリ名を入力してください");
      return;
    }

    setIsCreatingCategory(true);

    try {
      const newCategory = await categoryClientService.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
      });

      onCategoryCreated(newCategory);
      toast.success("カテゴリを作成しました");
      setIsCreateCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("カテゴリの作成に失敗しました");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  return (
    <>
      {/* Search Overlay - Mobile Only */}
      {showSearchOverlay && (
        <div className='fixed inset-0 bg-black/50 z-50 sm:hidden'>
          <div className='absolute bottom-0 left-0 right-0 bg-background border-t-2 border-primary p-4 rounded-t-lg animate-in slide-in-from-bottom duration-200'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>メニューを検索</h3>
              <Button variant='ghost' size='sm' onClick={() => setShowSearchOverlay(false)} className='text-muted-foreground hover:text-foreground'>
                ✕
              </Button>
            </div>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input placeholder='メニューを検索...' value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className='pl-10 border-2 border-primary' autoFocus />
            </div>
            <Button variant='outline' onClick={() => setShowSearchOverlay(false)} className='w-full mt-4'>
              完了
            </Button>
          </div>
        </div>
      )}

      {/* Category Filter Overlay - Mobile Only */}
      {showCategoryOverlay && (
        <div className='fixed inset-0 bg-black/50 z-50 sm:hidden'>
          <div className='absolute bottom-0 left-0 right-0 bg-background border-t-2 border-primary p-4 rounded-t-lg animate-in slide-in-from-bottom duration-200 max-h-[70vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>カテゴリで絞り込み</h3>
              <Button variant='ghost' size='sm' onClick={() => setShowCategoryOverlay(false)} className='text-muted-foreground hover:text-foreground'>
                ✕
              </Button>
            </div>
            <div className='space-y-2 mb-4'>
              <Button
                variant={selectedCategoryId === null ? "default" : "outline"}
                onClick={() => {
                  onCategoryChange(null);
                  onSubcategoryChange(null);
                  setShowCategoryOverlay(false);
                }}
                className='w-full justify-start'
              >
                すべてのカテゴリ
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategoryId === category.id ? "default" : "outline"}
                  onClick={() => {
                    onCategoryChange(category.id);
                    onSubcategoryChange(null);
                    setShowCategoryOverlay(false);
                  }}
                  className='w-full justify-start'
                >
                  {category.name}
                </Button>
              ))}
            </div>
            <Button variant='outline' onClick={() => setShowCategoryOverlay(false)} className='w-full'>
              完了
            </Button>
          </div>
        </div>
      )}

      {/* Subcategory Filter Overlay - Mobile Only */}
      {showSubcategoryOverlay && (
        <div className='fixed inset-0 bg-black/50 z-50 sm:hidden'>
          <div className='absolute bottom-0 left-0 right-0 bg-background border-t-2 border-primary p-4 rounded-t-lg animate-in slide-in-from-bottom duration-200 max-h-[70vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>サブカテゴリで絞り込み</h3>
              <Button variant='ghost' size='sm' onClick={() => setShowSubcategoryOverlay(false)} className='text-muted-foreground hover:text-foreground'>
                ✕
              </Button>
            </div>
            <div className='space-y-2 mb-4'>
              <Button
                variant={selectedSubcategoryId === null ? "secondary" : "outline"}
                onClick={() => {
                  onSubcategoryChange(null);
                  setShowSubcategoryOverlay(false);
                }}
                className='w-full justify-start'
              >
                {selectedCategoryId === null ? "全サブカテゴリ" : "全て"}
              </Button>
              {subcategories
                .filter((subcategory) => selectedCategoryId === null || subcategory.categoryId === selectedCategoryId)
                .map((subcategory) => {
                  const parentCategory = categories.find((cat) => cat.id === subcategory.categoryId);
                  return (
                    <Button
                      key={subcategory.id}
                      variant={selectedSubcategoryId === subcategory.id ? "secondary" : "outline"}
                      onClick={() => {
                        onSubcategoryChange(subcategory.id);
                        setShowSubcategoryOverlay(false);
                      }}
                      className='w-full justify-start'
                    >
                      <div className='flex flex-col items-start'>
                        <span>{subcategory.name}</span>
                        {parentCategory && <span className='text-xs text-muted-foreground'>カテゴリ: {parentCategory.name}</span>}
                      </div>
                    </Button>
                  );
                })}
            </div>
            <Button variant='outline' onClick={() => setShowSubcategoryOverlay(false)} className='w-full'>
              完了
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Only visible on mobile screens */}
      <div className='fixed bottom-0 left-0 right-0 bg-background border-t-2 border-primary shadow-lg z-40 sm:hidden'>
        {isEditMode ? (
          /* Edit Mode Navigation */
          <div className='p-3'>
            <div className='max-w-7xl mx-auto space-y-3'>
              <div className='flex justify-center'>
                <Button onClick={onBack} variant='ghost' size='lg' className='text-primary hover:text-primary hover:bg-primary/10 flex items-center gap-2 py-3 px-6'>
                  <ArrowLeft className='h-5 w-5' />
                  <span className='font-medium'>メニュー一覧に戻る</span>
                </Button>
              </div>
              <div className='flex gap-3'>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='outline' size='lg' className='flex-1 border-2 border-primary hover:bg-muted bg-transparent py-3 text-base'>
                      <RotateCcw className='h-4 w-4 mr-2' />
                      リセット
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>すべてをリセットしますか？</AlertDialogTitle>
                      <AlertDialogDescription>すべての入力データが初期状態に戻ります。この操作は取り消すことができません。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction onClick={onReset} className='bg-destructive text-white hover:bg-destructive/90'>
                        リセット
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={onSave} size='lg' className='flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground border-2 border-primary py-3 text-base' disabled={isSaving || isLoadingMenu}>
                  {isSaving ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4 mr-2' />
                      保存
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* List Mode Navigation */
          <div className='flex items-center justify-around py-2'>
            {/* Search Button */}
            <Button variant='ghost' size='lg' onClick={() => setShowSearchOverlay(true)} className='flex flex-col items-center gap-1 h-auto py-3 px-2 hover:bg-primary/10 text-foreground'>
              <Search className='h-5 w-5' />
              <span className='text-xs font-medium'>検索</span>
            </Button>

            {/* Ingredients Management Button */}
            <Link href='/ingredients'>
              <Button variant='ghost' size='lg' className='flex flex-col items-center gap-1 h-auto py-3 px-2 hover:bg-primary/10 text-foreground'>
                <Package className='h-5 w-5' />
                <span className='text-xs font-medium'>材料</span>
              </Button>
            </Link>

            {/* Category Filter Button */}
            <Button variant='ghost' size='lg' onClick={() => setShowCategoryOverlay(true)} className='flex flex-col items-center gap-1 h-auto py-3 px-2 hover:bg-primary/10 text-foreground'>
              <Filter className='h-5 w-5' />
              <span className='text-xs font-medium'>カテゴリ</span>
            </Button>

            {/* Create New Menu Button - Primary Action */}
            <Button onClick={() => onEditMenu(null)} size='lg' className='flex flex-col items-center gap-1 h-auto py-3 px-2 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary'>
              <Plus className='h-5 w-5' />
              <span className='text-xs font-medium'>新規作成</span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
