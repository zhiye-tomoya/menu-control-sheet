"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Plus, Edit, Trash2, Search, Calculator, Loader2, FolderPlus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMenusPaginated, useDeleteMenu } from "@/hooks/use-menu-queries";
import { categoryClientService } from "@/lib/services/category-client-service";
import { subcategoryClientService } from "@/lib/services/subcategory-client-service";
import { Category, Subcategory, MenuItem, PaginatedResponse } from "@/lib/types";
import { toast } from "sonner";
import { MobileBottomNavigation } from "@/components/mobile-bottom-navigation";

interface MenuListProps {
  onEditMenu: (menuId: string | null) => void;
}

export function MenuList({ onEditMenu }: MenuListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string>("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  // Per-subcategory pagination state - key is subcategoryId, value is current page
  const [subcategoryPages, setSubcategoryPages] = useState<Record<string, number>>({});
  const [uncategorizedPage, setUncategorizedPage] = useState(1);
  const menusPerSubcategory = 6; // Show 6 menus per subcategory

  // Get all menus (no global pagination, we'll handle it per category)
  const { data, isLoading, error } = useMenusPaginated({
    page: 1,
    limit: 1000, // Get all menus, we'll paginate client-side per category
  });
  const deleteMenuMutation = useDeleteMenu();

  // Extract menus from response
  const menus = Array.isArray(data) ? data : (data as PaginatedResponse<MenuItem>)?.data || [];

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

  const filteredMenus = menus.filter((menu) => menu.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Helper function to get current page for a subcategory
  const getSubcategoryPage = (subcategoryId: string) => subcategoryPages[subcategoryId] || 1;

  // Helper function to set page for a subcategory
  const setSubcategoryPage = (subcategoryId: string, page: number) => {
    setSubcategoryPages((prev: Record<string, number>) => ({ ...prev, [subcategoryId]: page }));
  };

  // Helper function to get paginated menus for a subcategory
  const getPaginatedMenus = (menus: MenuItem[], page: number) => {
    const startIndex = (page - 1) * menusPerSubcategory;
    const endIndex = startIndex + menusPerSubcategory;
    return menus.slice(startIndex, endIndex);
  };

  // Group menus by subcategories
  const groupedMenus = subcategories
    .filter((subcategory) => {
      // Filter subcategories by selected category
      if (selectedCategoryId !== null && subcategory.categoryId !== selectedCategoryId) {
        return false;
      }
      // Filter by selected subcategory
      if (selectedSubcategoryId !== null && subcategory.id !== selectedSubcategoryId) {
        return false;
      }
      return true;
    })
    .map((subcategory) => {
      // Get all menus that belong to this subcategory
      const allSubcategoryMenus = filteredMenus.filter((menu) => menu.subcategoryId === subcategory.id).sort((a, b) => a.name.localeCompare(b.name, "ja"));

      const currentPage = getSubcategoryPage(subcategory.id);
      const paginatedMenus = getPaginatedMenus(allSubcategoryMenus, currentPage);
      const totalPages = Math.ceil(allSubcategoryMenus.length / menusPerSubcategory);

      // Get the parent category for display
      const parentCategory = categories.find((cat) => cat.id === subcategory.categoryId);

      return {
        subcategory,
        parentCategory,
        allMenus: allSubcategoryMenus,
        menus: paginatedMenus,
        currentPage,
        totalPages,
        hasMultiplePages: totalPages > 1,
      };
    })
    .filter((group) => group.allMenus.length > 0);

  // Get menus without proper subcategories (fallback) with pagination
  const allUncategorizedMenus = filteredMenus.filter((menu) => !subcategories.some((sub) => sub.id === menu.subcategoryId)).sort((a, b) => a.name.localeCompare(b.name, "ja"));
  const uncategorizedMenus = getPaginatedMenus(allUncategorizedMenus, uncategorizedPage);
  const uncategorizedTotalPages = Math.ceil(allUncategorizedMenus.length / menusPerSubcategory);
  const uncategorizedHasMultiplePages = uncategorizedTotalPages > 1;

  const handleDeleteMenu = async (menuId: string) => {
    try {
      await deleteMenuMutation.mutateAsync(menuId);
    } catch (error) {
      // Error handling is done in the mutation hook with toast notifications
    }
  };

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

      setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name, "ja")));
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

  const handleEditCategory = async () => {
    if (!editCategoryName.trim()) {
      toast.error("カテゴリ名を入力してください");
      return;
    }

    if (!editingCategoryId) {
      toast.error("編集するカテゴリが選択されていません");
      return;
    }

    setIsEditingCategory(true);

    try {
      const updatedCategory = await categoryClientService.updateCategory({
        id: editingCategoryId,
        name: editCategoryName.trim(),
        description: editCategoryDescription.trim(),
      });

      setCategories((prev) => prev.map((cat) => (cat.id === editingCategoryId ? updatedCategory : cat)).sort((a, b) => a.name.localeCompare(b.name, "ja")));

      toast.success("カテゴリを更新しました");
      setIsEditCategoryOpen(false);
      setEditingCategoryId("");
      setEditCategoryName("");
      setEditCategoryDescription("");
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error("カテゴリの更新に失敗しました");
    } finally {
      setIsEditingCategory(false);
    }
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description || "");
    setIsEditCategoryOpen(true);
  };

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-4'>
      <Card className='border-2 sm:border-4 border-primary bg-card'>
        <div className='border-b-2 sm:border-b-4 border-primary bg-card p-4 sm:p-6 sm:sticky sm:top-0 sm:z-50'>
          <h1 className='text-2xl sm:text-3xl font-bold text-center text-foreground mb-4'>メニュー管理</h1>

          {/* Category Filter Buttons - Desktop Only */}
          <div className='hidden sm:block mb-4'>
            <div className='flex flex-wrap gap-2 justify-center'>
              <Button
                variant={selectedCategoryId === null ? "default" : "outline"}
                size='sm'
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSelectedSubcategoryId(null);
                }}
                className={selectedCategoryId === null ? "bg-primary text-primary-foreground" : "border-2 border-primary hover:bg-muted"}
              >
                すべて
              </Button>
              {categories.map((category) => (
                <div key={category.id} className='flex items-center gap-1'>
                  <Button
                    variant={selectedCategoryId === category.id ? "default" : "outline"}
                    size='sm'
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setSelectedSubcategoryId(null);
                    }}
                    className={selectedCategoryId === category.id ? "bg-primary text-primary-foreground" : "border-2 border-primary hover:bg-muted"}
                  >
                    {category.name}
                  </Button>
                  <Button variant='ghost' size='sm' onClick={() => openEditCategoryDialog(category)} className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted' title={`${category.name}を編集`}>
                    <Edit className='h-3 w-3' />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Subcategory Filter Buttons - Desktop Only */}
          {subcategories.filter((sub) => selectedCategoryId === null || sub.categoryId === selectedCategoryId).length > 0 && (
            <div className='hidden sm:block mb-4'>
              <div className='flex flex-wrap gap-2 justify-center'>
                <Button variant={selectedSubcategoryId === null ? "secondary" : "outline"} size='sm' onClick={() => setSelectedSubcategoryId(null)} className={selectedSubcategoryId === null ? "bg-secondary text-secondary-foreground" : "border border-secondary hover:bg-muted text-sm"}>
                  {selectedCategoryId === null ? "全サブカテゴリ" : "全て"}
                </Button>
                {subcategories
                  .filter((subcategory) => selectedCategoryId === null || subcategory.categoryId === selectedCategoryId)
                  .map((subcategory) => (
                    <Button key={subcategory.id} variant={selectedSubcategoryId === subcategory.id ? "secondary" : "outline"} size='sm' onClick={() => setSelectedSubcategoryId(subcategory.id)} className={selectedSubcategoryId === subcategory.id ? "bg-secondary text-secondary-foreground" : "border border-secondary hover:bg-muted text-sm"}>
                      {subcategory.name}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {/* Search and Add Section - Desktop Only */}
          <div className='hidden sm:flex flex-col sm:flex-row gap-4 items-center'>
            <div className='relative flex-1 w-full sm:max-w-md'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input placeholder='メニューを検索...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='pl-10 border-2 border-primary' />
            </div>
            <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
              <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                <DialogTrigger asChild>
                  <Button variant='outline' size='lg' className='border-2 border-primary hover:bg-muted bg-transparent w-full sm:w-auto'>
                    <FolderPlus className='h-4 w-4 mr-2' />
                    カテゴリを作成
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
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
                  <DialogFooter>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setIsCreateCategoryOpen(false);
                        setNewCategoryName("");
                        setNewCategoryDescription("");
                      }}
                      disabled={isCreatingCategory}
                    >
                      キャンセル
                    </Button>
                    <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim() || isCreatingCategory} className='bg-primary hover:bg-primary/90'>
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
              <Button onClick={() => onEditMenu(null)} size='lg' className='bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary w-full sm:w-auto'>
                <Plus className='h-4 w-4 mr-2' />
                新しいメニューを作成
              </Button>
            </div>
          </div>
        </div>

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
          ) : filteredMenus.length === 0 ? (
            <div className='text-center py-12'>
              <Calculator className='mx-auto h-16 w-16 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>{searchTerm ? "メニューが見つかりません" : "メニューがありません"}</h3>
              <p className='text-muted-foreground mb-6'>{searchTerm ? "検索条件に一致するメニューがありません。" : "新しいメニューを作成して原価計算を始めましょう。"}</p>
              {!searchTerm && (
                <Button onClick={() => onEditMenu(null)} size='lg' className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                  <Plus className='h-4 w-4 mr-2' />
                  最初のメニューを作成
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-8'>
              {/* Render grouped menus by subcategory */}
              {groupedMenus.map(({ subcategory, parentCategory, menus, currentPage, totalPages, hasMultiplePages, allMenus }) => (
                <div key={subcategory.id}>
                  <div className='flex justify-between items-center mb-4'>
                    <div className='flex flex-col'>
                      <h2 className='text-xl font-bold text-foreground pb-2 border-b-2 border-primary'>{subcategory.name}</h2>
                      {parentCategory && <p className='text-sm text-muted-foreground mt-1'>カテゴリ: {parentCategory.name}</p>}
                    </div>
                    <span className='text-sm text-muted-foreground'>
                      {allMenus.length} 件中 {Math.min((currentPage - 1) * menusPerSubcategory + 1, allMenus.length)} - {Math.min(currentPage * menusPerSubcategory, allMenus.length)} 件表示
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                    {menus.map((menu) => (
                      <Card key={menu.id} className='border-2 border-primary bg-muted/30 hover:bg-muted/50 transition-colors'>
                        <div className='p-4 sm:p-6'>
                          {/* Image Section */}
                          <div className='mb-4'>
                            <div className='aspect-video w-full bg-muted border-2 border-dashed border-primary rounded-lg overflow-hidden'>
                              {menu.imageUrl ? (
                                <img src={menu.imageUrl} alt={menu.name} className='w-full h-full object-cover' />
                              ) : (
                                <div className='w-full h-full flex items-center justify-center'>
                                  <div className='text-center'>
                                    <Calculator className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
                                    <p className='text-xs text-muted-foreground'>画像なし</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className='flex items-start justify-between mb-4'>
                            <h3 className='text-lg font-bold text-foreground line-clamp-2 flex-1 mr-2'>{menu.name}</h3>
                            <div className='flex gap-2 flex-shrink-0'>
                              <Button variant='ghost' size='icon' onClick={() => onEditMenu(menu.id)} className='h-8 w-8 text-primary hover:text-primary hover:bg-primary/10'>
                                <Edit className='h-4 w-4' />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant='ghost' size='icon' className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'>
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>メニューを削除しますか？</AlertDialogTitle>
                                    <AlertDialogDescription>「{menu.name}」を削除します。この操作は取り消すことができません。</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteMenu(menu.id)} className='bg-destructive text-white hover:bg-destructive/90' disabled={deleteMenuMutation.isPending}>
                                      {deleteMenuMutation.isPending ? (
                                        <>
                                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                          削除中...
                                        </>
                                      ) : (
                                        "削除"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          <div className='space-y-3'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-muted-foreground'>原価</span>
                              <span className='font-semibold text-foreground'>¥{menu.totalCost.toFixed(1)}</span>
                            </div>

                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-muted-foreground'>販売価格</span>
                              <span className='font-semibold text-foreground'>¥{menu.sellingPrice}</span>
                            </div>

                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-muted-foreground'>原価率</span>
                              <span className={`font-bold ${menu.costRate > 30 ? "text-destructive" : menu.costRate > 20 ? "text-yellow-600" : "text-green-600"}`}>{menu.costRate.toFixed(1)}%</span>
                            </div>

                            <div className='pt-2 border-t border-border'>
                              <span className='text-xs text-muted-foreground'>更新日: {new Date(menu.updatedAt).toLocaleDateString("ja-JP")}</span>
                            </div>
                          </div>

                          <Button onClick={() => onEditMenu(menu.id)} className='w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground border-2 border-primary'>
                            <Edit className='h-4 w-4 mr-2' />
                            編集
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  {/* Subcategory Pagination */}
                  {hasMultiplePages && (
                    <div className='mt-6'>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href='#'
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) {
                                  setSubcategoryPage(subcategory.id, currentPage - 1);
                                }
                              }}
                              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href='#'
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSubcategoryPage(subcategory.id, page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href='#'
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) {
                                  setSubcategoryPage(subcategory.id, currentPage + 1);
                                }
                              }}
                              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              ))}

              {/* Render uncategorized menus if any */}
              {allUncategorizedMenus.length > 0 && (
                <div>
                  <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-bold text-foreground pb-2 border-b-2 border-primary'>未分類</h2>
                    <span className='text-sm text-muted-foreground'>
                      {allUncategorizedMenus.length} 件中 {Math.min((uncategorizedPage - 1) * menusPerSubcategory + 1, allUncategorizedMenus.length)} - {Math.min(uncategorizedPage * menusPerSubcategory, allUncategorizedMenus.length)} 件表示
                    </span>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                    {uncategorizedMenus.map((menu) => (
                      <Card key={menu.id} className='border-2 border-primary bg-muted/30 hover:bg-muted/50 transition-colors'>
                        <div className='p-4 sm:p-6'>
                          {/* Image Section */}
                          <div className='mb-4'>
                            <div className='aspect-video w-full bg-muted border-2 border-dashed border-primary rounded-lg overflow-hidden'>
                              {menu.imageUrl ? (
                                <img src={menu.imageUrl} alt={menu.name} className='w-full h-full object-cover' />
                              ) : (
                                <div className='w-full h-full flex items-center justify-center'>
                                  <div className='text-center'>
                                    <Calculator className='w-8 h-8 mx-auto mb-2 text-muted-foreground' />
                                    <p className='text-xs text-muted-foreground'>画像なし</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className='flex items-start justify-between mb-4'>
                            <h3 className='text-lg font-bold text-foreground line-clamp-2 flex-1 mr-2'>{menu.name}</h3>
                            <div className='flex gap-2 flex-shrink-0'>
                              <Button variant='ghost' size='icon' onClick={() => onEditMenu(menu.id)} className='h-8 w-8 text-primary hover:text-primary hover:bg-primary/10'>
                                <Edit className='h-4 w-4' />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant='ghost' size='icon' className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'>
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>メニューを削除しますか？</AlertDialogTitle>
                                    <AlertDialogDescription>「{menu.name}」を削除します。この操作は取り消すことができません。</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteMenu(menu.id)} className='bg-destructive text-white hover:bg-destructive/90' disabled={deleteMenuMutation.isPending}>
                                      {deleteMenuMutation.isPending ? (
                                        <>
                                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                          削除中...
                                        </>
                                      ) : (
                                        "削除"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          <div className='space-y-3'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-muted-foreground'>原価</span>
                              <span className='font-semibold text-foreground'>¥{menu.totalCost.toFixed(1)}</span>
                            </div>

                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-muted-foreground'>販売価格</span>
                              <span className='font-semibold text-foreground'>¥{menu.sellingPrice}</span>
                            </div>

                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-muted-foreground'>原価率</span>
                              <span className={`font-bold ${menu.costRate > 30 ? "text-destructive" : menu.costRate > 20 ? "text-yellow-600" : "text-green-600"}`}>{menu.costRate.toFixed(1)}%</span>
                            </div>

                            <div className='pt-2 border-t border-border'>
                              <span className='text-xs text-muted-foreground'>更新日: {new Date(menu.updatedAt).toLocaleDateString("ja-JP")}</span>
                            </div>
                          </div>

                          <Button onClick={() => onEditMenu(menu.id)} className='w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground border-2 border-primary'>
                            <Edit className='h-4 w-4 mr-2' />
                            編集
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  {/* Uncategorized Pagination */}
                  {uncategorizedHasMultiplePages && (
                    <div className='mt-6'>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href='#'
                              onClick={(e) => {
                                e.preventDefault();
                                if (uncategorizedPage > 1) {
                                  setUncategorizedPage(uncategorizedPage - 1);
                                }
                              }}
                              className={uncategorizedPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          {Array.from({ length: uncategorizedTotalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href='#'
                                onClick={(e) => {
                                  e.preventDefault();
                                  setUncategorizedPage(page);
                                }}
                                isActive={uncategorizedPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href='#'
                              onClick={(e) => {
                                e.preventDefault();
                                if (uncategorizedPage < uncategorizedTotalPages) {
                                  setUncategorizedPage(uncategorizedPage + 1);
                                }
                              }}
                              className={uncategorizedPage >= uncategorizedTotalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation
        onEditMenu={onEditMenu}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        onCategoryCreated={(newCategory) => {
          setCategories((prev) => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name, "ja")));
        }}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        subcategories={subcategories}
        selectedSubcategoryId={selectedSubcategoryId}
        onSubcategoryChange={setSelectedSubcategoryId}
      />

      {/* Category Edit Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>カテゴリを編集</DialogTitle>
            <DialogDescription>選択されたカテゴリの情報を編集します。</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='edit-category-name'>カテゴリ名 *</Label>
              <Input id='edit-category-name' placeholder='カテゴリ名を入力...' value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} className='border-2 border-primary' />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-category-description'>説明（任意）</Label>
              <Textarea id='edit-category-description' placeholder='カテゴリの説明を入力...' value={editCategoryDescription} onChange={(e) => setEditCategoryDescription(e.target.value)} className='border-2 border-primary resize-none' rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsEditCategoryOpen(false);
                setEditingCategoryId("");
                setEditCategoryName("");
                setEditCategoryDescription("");
              }}
              disabled={isEditingCategory}
            >
              キャンセル
            </Button>
            <Button onClick={handleEditCategory} disabled={!editCategoryName.trim() || isEditingCategory} className='bg-primary hover:bg-primary/90'>
              {isEditingCategory ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  更新中...
                </>
              ) : (
                <>
                  <Edit className='h-4 w-4 mr-2' />
                  更新
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
