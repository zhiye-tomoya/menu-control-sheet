"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search, Calculator, Loader2, FolderPlus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMenus, useDeleteMenu } from "@/hooks/use-menu-queries";
import { categoryClientService } from "@/lib/services/category-client-service";
import { Category, MenuItem } from "@/lib/types";
import { toast } from "sonner";

interface MenuListProps {
  onEditMenu: (menuId: string | null) => void;
}

export function MenuList({ onEditMenu }: MenuListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const { data: menus = [], isLoading, error } = useMenus();
  const deleteMenuMutation = useDeleteMenu();

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await categoryClientService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  const filteredMenus = menus.filter((menu) => menu.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Group menus by category and sort alphabetically within each category
  const groupedMenus = categories
    .map((category) => {
      const categoryMenus = filteredMenus.filter((menu) => menu.categoryId === category.id).sort((a, b) => a.name.localeCompare(b.name, "ja"));

      return {
        category,
        menus: categoryMenus,
      };
    })
    .filter((group) => group.menus.length > 0);

  // Get menus without categories (fallback)
  const uncategorizedMenus = filteredMenus.filter((menu) => !categories.some((cat) => cat.id === menu.categoryId)).sort((a, b) => a.name.localeCompare(b.name, "ja"));

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

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-4'>
      <Card className='border-2 sm:border-4 border-primary bg-card'>
        <div className='border-b-2 sm:border-b-4 border-primary bg-card p-4 sm:p-6'>
          <h1 className='text-2xl sm:text-3xl font-bold text-center text-foreground mb-4'>メニュー管理</h1>

          {/* Search and Add Section */}
          <div className='flex flex-col sm:flex-row gap-4 items-center'>
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
              {/* Render grouped menus by category */}
              {groupedMenus.map(({ category, menus }) => (
                <div key={category.id}>
                  <h2 className='text-xl font-bold text-foreground mb-4 pb-2 border-b-2 border-primary'>{category.name}</h2>
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
                </div>
              ))}

              {/* Render uncategorized menus if any */}
              {uncategorizedMenus.length > 0 && (
                <div>
                  <h2 className='text-xl font-bold text-foreground mb-4 pb-2 border-b-2 border-primary'>未分類</h2>
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
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
