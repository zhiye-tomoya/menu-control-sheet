"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FolderPlus, Search, Loader2 } from "lucide-react";
import { categoryClientService } from "@/lib/services/category-client-service";
import { Category } from "@/lib/types";
import { toast } from "sonner";

interface MobileBottomNavigationProps {
  onEditMenu: (menuId: string | null) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: Category[];
  onCategoryCreated: (category: Category) => void;
}

export function MobileBottomNavigation({ onEditMenu, searchTerm, onSearchChange, categories, onCategoryCreated }: MobileBottomNavigationProps) {
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

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

      {/* Mobile Bottom Navigation - Only visible on mobile screens */}
      <div className='fixed bottom-0 left-0 right-0 bg-background border-t-2 border-primary shadow-lg z-40 sm:hidden'>
        <div className='flex items-center justify-around py-2'>
          {/* Search Button */}
          <Button variant='ghost' size='lg' onClick={() => setShowSearchOverlay(true)} className='flex flex-col items-center gap-1 h-auto py-3 px-4 hover:bg-primary/10 text-foreground'>
            <Search className='h-5 w-5' />
            <span className='text-xs font-medium'>検索</span>
          </Button>

          {/* Create Category Button */}
          <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant='ghost' size='lg' className='flex flex-col items-center gap-1 h-auto py-3 px-4 hover:bg-primary/10 text-foreground'>
                <FolderPlus className='h-5 w-5' />
                <span className='text-xs font-medium'>カテゴリ</span>
              </Button>
            </DialogTrigger>
            <DialogContent className='mx-4 max-w-sm'>
              <DialogHeader>
                <DialogTitle>新しいカテゴリを作成</DialogTitle>
                <DialogDescription>新しいカテゴリを作成してメニューを整理しましょう。</DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='category-name'>カテゴリ名 *</Label>
                  <Input id='category-name' placeholder='カテゴリ名を入力...' value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className='border-2 border-primary' />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='category-description'>説明（任意）</Label>
                  <Textarea id='category-description' placeholder='カテゴリの説明を入力...' value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} className='border-2 border-primary resize-none' rows={3} />
                </div>
              </div>
              <DialogFooter className='flex-col gap-2 sm:flex-row'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsCreateCategoryOpen(false);
                    setNewCategoryName("");
                    setNewCategoryDescription("");
                  }}
                  disabled={isCreatingCategory}
                  className='w-full'
                >
                  キャンセル
                </Button>
                <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim() || isCreatingCategory} className='bg-primary hover:bg-primary/90 w-full'>
                  {isCreatingCategory ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      作成中...
                    </>
                  ) : (
                    <>
                      <Plus className='h-4 w-4 mr-2' />
                      作成
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create New Menu Button - Primary Action */}
          <Button onClick={() => onEditMenu(null)} size='lg' className='flex flex-col items-center gap-1 h-auto py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary'>
            <Plus className='h-5 w-5' />
            <span className='text-xs font-medium'>新規作成</span>
          </Button>
        </div>
      </div>
    </>
  );
}
