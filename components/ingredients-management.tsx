"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit2, Trash2, Package } from "lucide-react";
import { IngredientClientService } from "@/lib/services/ingredient-client-service";
import { IngredientData } from "@/lib/services/ingredient-service";
import { useToast } from "@/hooks/use-toast";
import { IngredientForm } from "./ingredient-form";

export function IngredientsManagement() {
  const [ingredients, setIngredients] = useState<IngredientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [editingIngredient, setEditingIngredient] = useState<IngredientData | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  // Load ingredients
  const loadIngredients = async () => {
    try {
      setLoading(true);
      const data = await IngredientClientService.getAll({
        search: search || undefined,
        category: categoryFilter === "all" ? undefined : categoryFilter,
      });
      setIngredients(data);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map((ing) => ing.category).filter(Boolean))) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      toast({
        title: "エラー",
        description: "材料の取得に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, [search, categoryFilter]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadIngredients();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search]);

  const handleDelete = async (id: string) => {
    try {
      await IngredientClientService.delete(id);
      toast({
        title: "成功",
        description: "材料を削除しました。",
      });
      loadIngredients();
    } catch (error) {
      toast({
        title: "エラー",
        description: "材料の削除に失敗しました。",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    setEditingIngredient(null);
    setShowAddDialog(false);
    loadIngredients();
    toast({
      title: "成功",
      description: "材料を保存しました。",
    });
  };

  return (
    <div className='container mx-auto py-6'>
      <div className='flex flex-col gap-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Package className='h-6 w-6' />
            <h1 className='text-2xl font-bold'>材料管理</h1>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className='flex items-center gap-2'>
                <Plus className='h-4 w-4' />
                材料を追加
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>材料を追加</DialogTitle>
              </DialogHeader>
              <IngredientForm onSave={handleSave} onCancel={() => setShowAddDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input placeholder='材料名で検索...' value={search} onChange={(e) => setSearch(e.target.value)} className='pl-10' />
                </div>
              </div>
              <div className='sm:w-48'>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='カテゴリー' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>すべてのカテゴリー</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients List */}
        {loading ? (
          <div className='flex justify-center py-8'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
              <p className='mt-2 text-muted-foreground'>読み込み中...</p>
            </div>
          </div>
        ) : (
          <div className='grid gap-4'>
            {ingredients.length === 0 ? (
              <Card>
                <CardContent className='pt-6 text-center py-8'>
                  <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                  <p className='text-lg font-medium mb-2'>材料が見つかりません</p>
                  <p className='text-muted-foreground mb-4'>{search || categoryFilter !== "all" ? "検索条件に一致する材料がありません。" : "まだ材料が登録されていません。"}</p>
                  {!search && categoryFilter === "all" && (
                    <Button onClick={() => setShowAddDialog(true)} className='flex items-center gap-2'>
                      <Plus className='h-4 w-4' />
                      最初の材料を追加
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              ingredients.map((ingredient) => (
                <Card key={ingredient.id}>
                  <CardContent className='pt-6'>
                    <div className='flex flex-col sm:flex-row justify-between items-start gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h3 className='text-lg font-semibold'>{ingredient.name}</h3>
                          {ingredient.category && <Badge variant='outline'>{ingredient.category}</Badge>}
                        </div>

                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm'>
                          <div>
                            <p className='text-muted-foreground'>使用単位</p>
                            <p className='font-medium'>{ingredient.defaultUnit}</p>
                          </div>
                          <div>
                            <p className='text-muted-foreground'>価格単位</p>
                            <p className='font-medium'>{ingredient.pricingUnit}</p>
                          </div>
                          <div>
                            <p className='text-muted-foreground'>換算係数</p>
                            <p className='font-medium'>{ingredient.conversionFactor}</p>
                          </div>
                          <div>
                            <p className='text-muted-foreground'>単価</p>
                            <p className='font-medium'>¥{Number(ingredient.currentPrice).toFixed(2)}</p>
                          </div>
                        </div>

                        {ingredient.description && (
                          <div className='mt-3'>
                            <p className='text-sm text-muted-foreground'>{ingredient.description}</p>
                          </div>
                        )}
                      </div>

                      <div className='flex gap-2'>
                        <Dialog open={editingIngredient?.id === ingredient.id} onOpenChange={(open) => !open && setEditingIngredient(null)}>
                          <DialogTrigger asChild>
                            <Button variant='outline' size='sm' onClick={() => setEditingIngredient(ingredient)} className='flex items-center gap-2'>
                              <Edit2 className='h-4 w-4' />
                              編集
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='max-w-2xl'>
                            <DialogHeader>
                              <DialogTitle>材料を編集</DialogTitle>
                            </DialogHeader>
                            {editingIngredient && <IngredientForm ingredient={editingIngredient} onSave={handleSave} onCancel={() => setEditingIngredient(null)} />}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant='outline' size='sm' className='text-destructive hover:text-destructive'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>材料を削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>「{ingredient.name}」を削除します。この操作は取り消すことができません。 この材料を使用しているメニューがある場合、影響を受ける可能性があります。</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(ingredient.id)} className='bg-destructive text-white hover:bg-destructive/90'>
                                削除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
