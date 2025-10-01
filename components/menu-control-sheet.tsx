"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, RotateCcw, ArrowLeft, Save, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMenu, useSaveMenu } from "@/hooks/use-menu-queries";
import { Ingredient, Category } from "@/lib/types";
import { categoryClientService } from "@/lib/services/category-client-service";
import { toast } from "sonner";

interface MenuControlSheetProps {
  menuId: string | null;
  onBack: () => void;
}

export function MenuControlSheet({ menuId, onBack }: MenuControlSheetProps) {
  const [productName, setProductName] = useState("ブレンドコーヒー");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    {
      id: "1",
      no: 1,
      name: "コーヒー豆",
      quantity: 12.0,
      unit: "g",
      unitPrice: 3.5,
      totalPrice: 42.0,
    },
    {
      id: "2",
      no: 2,
      name: "紙カップ",
      quantity: 1.0,
      unit: "個",
      unitPrice: 15.0,
      totalPrice: 15.0,
    },
  ]);
  const [sellingPrice, setSellingPrice] = useState(450);

  // Use TanStack Query hooks
  const { data: existingMenu, isLoading: isLoadingMenu } = useMenu(menuId || "");
  const { saveMenu, isLoading: isSaving, error } = useSaveMenu();

  const totalCost = ingredients.reduce((sum, ing) => sum + ing.totalPrice, 0);
  const costRate = sellingPrice > 0 ? (totalCost / sellingPrice) * 100 : 0;
  const discountPrice = Math.round(sellingPrice * 0.873);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await categoryClientService.getCategories();
        setCategories(fetchedCategories);

        // If no categories exist, create a default one
        if (fetchedCategories.length === 0) {
          const defaultCategory = await categoryClientService.createCategory({
            name: "デフォルト",
            description: "デフォルトカテゴリ",
          });
          setCategories([defaultCategory]);
          setCategoryId(defaultCategory.id);
        } else if (!menuId) {
          // Set first category as default for new menus
          setCategoryId(fetchedCategories[0].id);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("カテゴリの読み込みに失敗しました");
      }
    };

    loadCategories();
  }, [menuId]);

  // Load existing menu data when editing
  useEffect(() => {
    if (existingMenu) {
      setProductName(existingMenu.name);
      setImageUrl(existingMenu.imageUrl);
      setCategoryId(existingMenu.categoryId);
      setIngredients(existingMenu.ingredients);
      setSellingPrice(existingMenu.sellingPrice);
    }
  }, [existingMenu]);

  const handleSave = async () => {
    // Validation
    if (!productName.trim()) {
      toast.error("商品名を入力してください", {
        description: "商品名は必須項目です。",
      });
      return;
    }

    if (sellingPrice <= 0) {
      toast.error("販売価格を正しく入力してください", {
        description: "販売価格は0円より大きい値を入力してください。",
      });
      return;
    }

    if (ingredients.length === 0) {
      toast.error("材料を追加してください", {
        description: "少なくとも1つの材料を追加する必要があります。",
      });
      return;
    }

    // Check if all ingredients have names
    const emptyIngredients = ingredients.filter((ing) => !ing.name.trim());
    if (emptyIngredients.length > 0) {
      toast.error("材料名を入力してください", {
        description: "すべての材料に名前を入力してください。",
      });
      return;
    }

    if (!categoryId) {
      toast.error("カテゴリを選択してください", {
        description: "カテゴリは必須項目です。",
      });
      return;
    }

    try {
      const menuInput = {
        name: productName.trim(),
        imageUrl: imageUrl,
        categoryId: categoryId,
        ingredients: ingredients,
        sellingPrice: sellingPrice,
      };

      if (menuId) {
        // Update existing menu
        await saveMenu({ ...menuInput, id: menuId });
      } else {
        // Create new menu
        await saveMenu(menuInput);
      }

      onBack();
    } catch (error) {
      // Error handling is done in the mutation hook with toast notifications
    }
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        const updated = { ...ing, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.totalPrice = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      })
    );
  };

  const addIngredient = () => {
    const maxNo = Math.max(...ingredients.map((i) => i.no), 0);
    setIngredients([
      ...ingredients,
      {
        id: Date.now().toString(),
        no: maxNo + 1,
        name: "",
        quantity: 0,
        unit: "g",
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setProductName("ブレンドコーヒー");
    setImageUrl("");
    setIngredients([
      {
        id: "1",
        no: 1,
        name: "コーヒー豆",
        quantity: 12.0,
        unit: "g",
        unitPrice: 3.5,
        totalPrice: 42.0,
      },
      {
        id: "2",
        no: 2,
        name: "紙カップ",
        quantity: 1.0,
        unit: "個",
        unitPrice: 15.0,
        totalPrice: 15.0,
      },
    ]);
    setSellingPrice(450);
  };

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-4'>
      <Card className='border-2 sm:border-4 border-primary bg-card'>
        <div className='border-b-2 sm:border-b-4 border-primary bg-card p-4 sm:p-6'>
          <div className='flex items-center justify-between mb-4'>
            <Button onClick={onBack} variant='ghost' size='lg' className='text-primary hover:text-primary hover:bg-primary/10'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              メニュー一覧に戻る
            </Button>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-foreground'>{menuId ? "原価計算表 - 編集" : "原価計算表 - 新規作成"}</h1>
            <div className='w-32'></div> {/* Spacer for center alignment */}
          </div>
        </div>

        <div className='p-4 sm:p-6 space-y-4 sm:space-y-6'>
          {/* Product Name Section */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4 border-2 sm:border-4 border-primary bg-muted/30'>
            <div className='bg-muted md:border-r-4 border-primary p-3 sm:p-4 flex items-center'>
              <label className='text-base sm:text-lg font-bold text-foreground'>商品名</label>
            </div>
            <div className='col-span-3 p-3 sm:p-4'>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} className='text-base sm:text-lg font-medium border-2 border-primary bg-card' />
            </div>
          </div>

          {/* Category Section */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4 border-2 sm:border-4 border-primary bg-muted/30'>
            <div className='bg-muted md:border-r-4 border-primary p-3 sm:p-4 flex items-center'>
              <label className='text-base sm:text-lg font-bold text-foreground'>カテゴリ</label>
            </div>
            <div className='col-span-3 p-3 sm:p-4'>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className='text-base sm:text-lg font-medium border-2 border-primary bg-card'>
                  <SelectValue placeholder='カテゴリを選択してください' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 border-4 border-primary'>
            {/* Image Upload Section */}
            <div className='lg:col-span-4 lg:border-r-4 border-primary p-4 lg:p-6 bg-muted/20'>
              <div className='aspect-square max-w-sm mx-auto lg:max-w-none bg-muted border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center relative overflow-hidden'>
                {imageUrl ? (
                  <img src={imageUrl || "/placeholder.svg"} alt='Product' className='w-full h-full object-cover' />
                ) : (
                  <div className='text-center'>
                    <Upload className='w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2 text-muted-foreground' />
                    <p className='text-xs lg:text-sm text-muted-foreground'>商品画像</p>
                  </div>
                )}
                <input type='file' accept='image/*' onChange={handleImageUpload} className='absolute inset-0 opacity-0 cursor-pointer' />
              </div>
            </div>

            {/* Ingredients Table */}
            <div className='lg:col-span-8 p-4 lg:p-6 overflow-x-auto'>
              <div className='min-w-[320px] lg:min-w-[600px]'>
                {/* Table Header */}
                <div className='grid grid-cols-12 gap-2 mb-2 bg-muted border-2 border-primary p-2 font-bold text-sm'>
                  <div className='col-span-1 text-center'>材料No</div>
                  <div className='col-span-3'>材料名</div>
                  <div className='col-span-2 text-right'>使用量</div>
                  <div className='col-span-2'>単位</div>
                  <div className='col-span-2 text-right'>材料単価(税別)</div>
                  <div className='col-span-2 text-right'>原価(税別)</div>
                </div>

                {/* Table Rows */}
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className='grid grid-cols-12 gap-2 mb-2 items-center border-2 border-primary p-2 bg-card'>
                    <div className='col-span-1 text-center font-medium'>{ingredient.no}</div>
                    <div className='col-span-3'>
                      <Input value={ingredient.name} onChange={(e) => updateIngredient(ingredient.id, "name", e.target.value)} className='border-primary' />
                    </div>
                    <div className='col-span-2'>
                      <Input type='number' step='0.1' value={ingredient.quantity} onChange={(e) => updateIngredient(ingredient.id, "quantity", Number.parseFloat(e.target.value) || 0)} className='text-right border-primary' />
                    </div>
                    <div className='col-span-2'>
                      <Select value={ingredient.unit} onValueChange={(value) => updateIngredient(ingredient.id, "unit", value)}>
                        <SelectTrigger className='border-primary'>
                          <SelectValue placeholder='単位を選択' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='g'>g</SelectItem>
                          <SelectItem value='ml'>ml</SelectItem>
                          <SelectItem value='個'>個</SelectItem>
                          <SelectItem value='袋'>袋</SelectItem>
                          <SelectItem value='振り'>振り</SelectItem>
                          <SelectItem value='枚'>枚</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='col-span-2'>
                      <Input type='number' step='0.01' value={ingredient.unitPrice} onChange={(e) => updateIngredient(ingredient.id, "unitPrice", Number.parseFloat(e.target.value) || 0)} className='text-right border-primary' />
                    </div>
                    <div className='col-span-1 text-right font-medium'>¥{ingredient.totalPrice.toFixed(1)}</div>
                    <div className='col-span-1 flex justify-center'>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>材料を削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>「{ingredient.name || "無名の材料"}」を削除します。この操作は取り消すことができません。</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeIngredient(ingredient.id)} className='bg-destructive text-white hover:bg-destructive/90'>
                              削除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}

                {/* Add Button */}
                <Button onClick={addIngredient} variant='outline' className='w-full mt-2 border-2 border-primary hover:bg-muted bg-transparent'>
                  <Plus className='h-4 w-4 mr-2' />
                  材料を追加
                </Button>

                {/* Total Row */}
                <div className='grid grid-cols-12 gap-2 mt-4 bg-muted border-2 border-primary p-3'>
                  <div className='col-span-8 font-bold text-right'>使用原価合計</div>
                  <div className='col-span-2 font-bold'>原価合計</div>
                  <div className='col-span-2 text-right font-bold text-lg'>¥{totalCost.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className='border-2 sm:border-4 border-primary bg-card'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6'>
              <Card className='border-2 border-primary bg-muted/30 p-3 sm:p-4'>
                <label className='text-sm font-bold text-foreground mb-2 block'>販売価格(税別)</label>
                <div className='flex items-center gap-2'>
                  <span className='text-xl sm:text-2xl font-bold'>¥</span>
                  <Input type='number' value={sellingPrice} onChange={(e) => setSellingPrice(Number.parseFloat(e.target.value) || 0)} className='text-xl sm:text-2xl font-bold border-2 border-primary' />
                </div>
              </Card>

              <Card className='border-2 border-primary bg-muted/30 p-3 sm:p-4'>
                <label className='text-sm font-bold text-foreground mb-2 block'>原価率</label>
                <div className='text-2xl sm:text-3xl font-bold text-foreground'>{costRate.toFixed(1)}%</div>
              </Card>

              <Card className='border-2 border-primary bg-muted/30 p-3 sm:p-4'>
                <label className='text-sm font-bold text-foreground mb-2 block'>安売価格</label>
                <div className='text-2xl sm:text-3xl font-bold text-foreground'>¥{discountPrice}</div>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-end'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='outline' size='lg' className='border-2 border-primary hover:bg-muted bg-transparent'>
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
                  <AlertDialogAction onClick={handleReset} className='bg-destructive text-white hover:bg-destructive/90'>
                    リセット
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleSave} size='lg' className='bg-secondary hover:bg-secondary/90 text-secondary-foreground border-2 border-primary' disabled={isSaving || isLoadingMenu}>
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
      </Card>
    </div>
  );
}
