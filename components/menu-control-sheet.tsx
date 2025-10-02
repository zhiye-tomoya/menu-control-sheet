"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, RotateCcw, ArrowLeft, Save, Loader2, FolderPlus, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMenu, useSaveMenu } from "@/hooks/use-menu-queries";
import { Ingredient, Category, Subcategory } from "@/lib/types";
import { categoryClientService } from "@/lib/services/category-client-service";
import { subcategoryClientService } from "@/lib/services/subcategory-client-service";
import { MobileBottomNavigation } from "@/components/mobile-bottom-navigation";
import { toast } from "sonner";

interface MenuControlSheetProps {
  menuId: string | null;
  onBack: () => void;
}

export function MenuControlSheet({ menuId, onBack }: MenuControlSheetProps) {
  const [productName, setProductName] = useState("ブレンドコーヒー");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isCreateSubcategoryOpen, setIsCreateSubcategoryOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [newSubcategoryDescription, setNewSubcategoryDescription] = useState("");
  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [isEditSubcategoryOpen, setIsEditSubcategoryOpen] = useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string>("");
  const [editSubcategoryName, setEditSubcategoryName] = useState("");
  const [editSubcategoryDescription, setEditSubcategoryDescription] = useState("");
  const [isEditingSubcategory, setIsEditingSubcategory] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string>("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
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

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!categoryId) {
        setSubcategories([]);
        setSubcategoryId("");
        return;
      }

      try {
        const fetchedSubcategories = await subcategoryClientService.getSubcategoriesByCategory(categoryId);
        setSubcategories(fetchedSubcategories);

        // If no subcategories exist for this category, create a default one
        if (fetchedSubcategories.length === 0) {
          const defaultSubcategory = await subcategoryClientService.createSubcategory({
            name: "デフォルト",
            description: "デフォルトサブカテゴリ",
            categoryId: categoryId,
          });
          setSubcategories([defaultSubcategory]);
          setSubcategoryId(defaultSubcategory.id);
        } else {
          // Always set the first subcategory when category changes
          // This ensures the menu actually moves to the correct category
          setSubcategoryId(fetchedSubcategories[0].id);
        }
      } catch (error) {
        console.error("Failed to load subcategories:", error);
        toast.error("サブカテゴリの読み込みに失敗しました");
      }
    };

    loadSubcategories();
  }, [categoryId, menuId]); // Don't include subcategoryId to avoid infinite loops

  // Load existing menu data when editing
  useEffect(() => {
    const loadExistingMenuData = async () => {
      if (existingMenu) {
        setProductName(existingMenu.name);
        setImageUrl(existingMenu.imageUrl);
        setIngredients(existingMenu.ingredients);
        setSellingPrice(existingMenu.sellingPrice);

        // Load the subcategory to get the parent category
        try {
          const subcategory = await subcategoryClientService.getSubcategory(existingMenu.subcategoryId);
          if (subcategory) {
            setCategoryId(subcategory.categoryId);
            setSubcategoryId(subcategory.id);
          }
        } catch (error) {
          console.error("Failed to load subcategory for existing menu:", error);
          // Fallback: try to match with existing subcategories
          setSubcategoryId(existingMenu.subcategoryId);
        }
      }
    };

    loadExistingMenuData();
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

    if (!subcategoryId) {
      toast.error("サブカテゴリを選択してください", {
        description: "サブカテゴリは必須項目です。",
      });
      return;
    }

    try {
      const menuInput = {
        name: productName.trim(),
        imageUrl: imageUrl,
        subcategoryId: subcategoryId,
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
      // But we need to prevent navigation on error
      console.error("Failed to save menu:", error);
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

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      toast.error("サブカテゴリ名を入力してください");
      return;
    }

    if (!categoryId) {
      toast.error("先にカテゴリを選択してください");
      return;
    }

    setIsCreatingSubcategory(true);

    try {
      const newSubcategory = await subcategoryClientService.createSubcategory({
        name: newSubcategoryName.trim(),
        description: newSubcategoryDescription.trim(),
        categoryId: categoryId,
      });

      setSubcategories((prev) => [...prev, newSubcategory].sort((a, b) => a.name.localeCompare(b.name, "ja")));
      setSubcategoryId(newSubcategory.id);
      toast.success("サブカテゴリを作成しました");
      setIsCreateSubcategoryOpen(false);
      setNewSubcategoryName("");
      setNewSubcategoryDescription("");
    } catch (error) {
      console.error("Failed to create subcategory:", error);
      toast.error("サブカテゴリの作成に失敗しました");
    } finally {
      setIsCreatingSubcategory(false);
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

  const handleEditSubcategory = async () => {
    if (!editSubcategoryName.trim()) {
      toast.error("サブカテゴリ名を入力してください");
      return;
    }

    if (!editingSubcategoryId) {
      toast.error("編集するサブカテゴリが選択されていません");
      return;
    }

    setIsEditingSubcategory(true);

    try {
      const updatedSubcategory = await subcategoryClientService.updateSubcategory({
        id: editingSubcategoryId,
        name: editSubcategoryName.trim(),
        description: editSubcategoryDescription.trim(),
        categoryId: categoryId, // Keep the current category
      });

      setSubcategories((prev) => prev.map((sub) => (sub.id === editingSubcategoryId ? updatedSubcategory : sub)).sort((a, b) => a.name.localeCompare(b.name, "ja")));

      toast.success("サブカテゴリを更新しました");
      setIsEditSubcategoryOpen(false);
      setEditingSubcategoryId("");
      setEditSubcategoryName("");
      setEditSubcategoryDescription("");
    } catch (error) {
      console.error("Failed to update subcategory:", error);
      toast.error("サブカテゴリの更新に失敗しました");
    } finally {
      setIsEditingSubcategory(false);
    }
  };

  const openEditSubcategoryDialog = (subcategory: Subcategory) => {
    setEditingSubcategoryId(subcategory.id);
    setEditSubcategoryName(subcategory.name);
    setEditSubcategoryDescription(subcategory.description || "");
    setIsEditSubcategoryOpen(true);
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description || "");
    setIsEditCategoryOpen(true);
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
      setCategoryId(newCategory.id); // Select the newly created category
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
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4'>
            <Button onClick={onBack} variant='ghost' size='lg' className='hidden sm:flex text-primary hover:text-primary hover:bg-primary/10 self-start'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              メニュー一覧に戻る
            </Button>
            <h1 className='text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground text-center sm:text-left'>{menuId ? "原価計算表 - 編集" : "原価計算表 - 新規作成"}</h1>
            <div className='hidden sm:block sm:w-32'></div> {/* Spacer for center alignment on larger screens */}
          </div>
        </div>

        <div className='p-4 sm:p-6 space-y-4 sm:space-y-6 pb-24 sm:pb-6'>
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
              <div className='flex gap-2'>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className='text-base sm:text-lg font-medium border-2 border-primary bg-card flex-1'>
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
                <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button variant='outline' size='lg' className='border-2 border-primary hover:bg-muted bg-transparent'>
                      <FolderPlus className='h-4 w-4 mr-1 sm:mr-2' />
                      <span className='hidden sm:inline'>カテゴリを作成</span>
                      <span className='sm:hidden'>作成</span>
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
              </div>
            </div>
          </div>

          {/* Subcategory Section */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-4 border-2 sm:border-4 border-primary bg-muted/30'>
            <div className='bg-muted md:border-r-4 border-primary p-3 sm:p-4 flex items-center'>
              <label className='text-base sm:text-lg font-bold text-foreground'>サブカテゴリ</label>
            </div>
            <div className='col-span-3 p-3 sm:p-4'>
              <div className='flex gap-2'>
                <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                  <SelectTrigger className='text-base sm:text-lg font-medium border-2 border-primary bg-card flex-1'>
                    <SelectValue placeholder='サブカテゴリを選択してください' />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isCreateSubcategoryOpen} onOpenChange={setIsCreateSubcategoryOpen}>
                  <DialogTrigger asChild>
                    <Button variant='outline' size='lg' className='border-2 border-primary hover:bg-muted bg-transparent' disabled={!categoryId}>
                      <FolderPlus className='h-4 w-4 mr-1 sm:mr-2' />
                      <span className='hidden sm:inline'>サブカテゴリを作成</span>
                      <span className='sm:hidden'>作成</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                      <DialogTitle>新しいサブカテゴリを作成</DialogTitle>
                      <DialogDescription>選択されたカテゴリに新しいサブカテゴリを作成します。</DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                      <div className='grid gap-2'>
                        <Label htmlFor='subcategory-name'>サブカテゴリ名 *</Label>
                        <Input id='subcategory-name' placeholder='サブカテゴリ名を入力...' value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} className='border-2 border-primary' />
                      </div>
                      <div className='grid gap-2'>
                        <Label htmlFor='subcategory-description'>説明（任意）</Label>
                        <Textarea id='subcategory-description' placeholder='サブカテゴリの説明を入力...' value={newSubcategoryDescription} onChange={(e) => setNewSubcategoryDescription(e.target.value)} className='border-2 border-primary resize-none' rows={3} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => {
                          setIsCreateSubcategoryOpen(false);
                          setNewSubcategoryName("");
                          setNewSubcategoryDescription("");
                        }}
                        disabled={isCreatingSubcategory}
                      >
                        キャンセル
                      </Button>
                      <Button onClick={handleCreateSubcategory} disabled={!newSubcategoryName.trim() || isCreatingSubcategory} className='bg-primary hover:bg-primary/90'>
                        {isCreatingSubcategory ? (
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
                <Button
                  variant='outline'
                  size='lg'
                  className='border-2 border-primary hover:bg-muted bg-transparent'
                  disabled={!subcategoryId || subcategories.length === 0}
                  onClick={() => {
                    const currentSubcategory = subcategories.find((sub) => sub.id === subcategoryId);
                    if (currentSubcategory) {
                      openEditSubcategoryDialog(currentSubcategory);
                    }
                  }}
                >
                  <Edit className='h-4 w-4 mr-1 sm:mr-2' />
                  <span className='hidden sm:inline'>サブカテゴリを編集</span>
                  <span className='sm:hidden'>編集</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Edit Subcategory Dialog */}
          <Dialog open={isEditSubcategoryOpen} onOpenChange={setIsEditSubcategoryOpen}>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>サブカテゴリを編集</DialogTitle>
                <DialogDescription>選択されたサブカテゴリの情報を編集します。</DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-subcategory-name'>サブカテゴリ名 *</Label>
                  <Input id='edit-subcategory-name' placeholder='サブカテゴリ名を入力...' value={editSubcategoryName} onChange={(e) => setEditSubcategoryName(e.target.value)} className='border-2 border-primary' />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='edit-subcategory-description'>説明（任意）</Label>
                  <Textarea id='edit-subcategory-description' placeholder='サブカテゴリの説明を入力...' value={editSubcategoryDescription} onChange={(e) => setEditSubcategoryDescription(e.target.value)} className='border-2 border-primary resize-none' rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsEditSubcategoryOpen(false);
                    setEditingSubcategoryId("");
                    setEditSubcategoryName("");
                    setEditSubcategoryDescription("");
                  }}
                  disabled={isEditingSubcategory}
                >
                  キャンセル
                </Button>
                <Button onClick={handleEditSubcategory} disabled={!editSubcategoryName.trim() || isEditingSubcategory} className='bg-primary hover:bg-primary/90'>
                  {isEditingSubcategory ? (
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
            <div className='lg:col-span-8 p-4 lg:p-6'>
              <div className='space-y-3'>
                {/* Desktop Table View */}
                <div className='hidden sm:block overflow-x-auto'>
                  <div className='min-w-[600px]'>
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
                          <Input type='number' step='1' value={ingredient.quantity} onChange={(e) => updateIngredient(ingredient.id, "quantity", Number.parseFloat(e.target.value) || 0)} className='text-right border-primary' />
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
                          <Input type='number' step='1' value={ingredient.unitPrice} onChange={(e) => updateIngredient(ingredient.id, "unitPrice", Number.parseFloat(e.target.value) || 0)} className='text-right border-primary' />
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
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className='sm:hidden space-y-3'>
                  {ingredients.map((ingredient) => (
                    <Card key={ingredient.id} className='border-2 border-primary p-4 bg-card'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-2'>
                          <span className='bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold'>{ingredient.no}</span>
                          <span className='font-medium text-sm text-muted-foreground'>材料 #{ingredient.no}</span>
                        </div>
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

                      <div className='space-y-3'>
                        <div>
                          <label className='text-sm font-medium text-muted-foreground mb-1 block'>材料名</label>
                          <Input value={ingredient.name} onChange={(e) => updateIngredient(ingredient.id, "name", e.target.value)} className='border-primary text-base' placeholder='材料名を入力' />
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <label className='text-sm font-medium text-muted-foreground mb-1 block'>使用量</label>
                            <Input type='number' step='1' value={ingredient.quantity} onChange={(e) => updateIngredient(ingredient.id, "quantity", Number.parseFloat(e.target.value) || 0)} className='text-right border-primary text-base' />
                          </div>
                          <div>
                            <label className='text-sm font-medium text-muted-foreground mb-1 block'>単位</label>
                            <Select value={ingredient.unit} onValueChange={(value) => updateIngredient(ingredient.id, "unit", value)}>
                              <SelectTrigger className='border-primary text-base'>
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
                        </div>

                        <div>
                          <label className='text-sm font-medium text-muted-foreground mb-1 block'>材料単価(税別)</label>
                          <Input type='number' step='1' value={ingredient.unitPrice} onChange={(e) => updateIngredient(ingredient.id, "unitPrice", Number.parseFloat(e.target.value) || 0)} className='text-right border-primary text-base' />
                        </div>

                        <div className='bg-muted/50 rounded-lg p-3 border border-primary/20'>
                          <div className='flex justify-between items-center'>
                            <span className='text-sm font-medium text-muted-foreground'>原価(税別)</span>
                            <span className='text-lg font-bold text-primary'>¥{ingredient.totalPrice.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Add Button */}
                <Button onClick={addIngredient} variant='outline' className='w-full border-2 border-primary hover:bg-muted bg-transparent text-base py-6'>
                  <Plus className='h-5 w-5 mr-2' />
                  材料を追加
                </Button>

                {/* Total Row */}
                <div className='bg-muted border-2 border-primary p-4 rounded-lg'>
                  <div className='flex justify-between items-center'>
                    <span className='font-bold text-base sm:text-lg'>使用原価合計</span>
                    <span className='text-xl sm:text-2xl font-bold text-primary'>¥{totalCost.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className='border-2 sm:border-4 border-primary bg-card'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6'>
              <Card className='border-2 border-primary bg-muted/30 p-4'>
                <label className='text-sm font-bold text-foreground mb-3 block'>販売価格(税別)</label>
                <div className='flex items-center gap-2'>
                  <span className='text-xl sm:text-2xl font-bold'>¥</span>
                  <Input type='number' step='1' value={sellingPrice} onChange={(e) => setSellingPrice(Number.parseInt(e.target.value) || 0)} className='text-xl sm:text-2xl font-bold border-2 border-primary min-h-[48px]' />
                </div>
              </Card>

              <Card className='border-2 border-primary bg-muted/30 p-4'>
                <label className='text-sm font-bold text-foreground mb-3 block'>原価率</label>
                <div className='text-2xl sm:text-3xl font-bold text-foreground flex items-center min-h-[48px]'>{costRate.toFixed(1)}%</div>
              </Card>

              <Card className='border-2 border-primary bg-muted/30 p-4 sm:col-span-2 lg:col-span-1'>
                <label className='text-sm font-bold text-foreground mb-3 block'>安売価格</label>
                <div className='text-2xl sm:text-3xl font-bold text-foreground flex items-center min-h-[48px]'>¥{discountPrice}</div>
              </Card>
            </div>
          </div>

          {/* Action Buttons - Hidden on mobile, visible on desktop */}
          <div className='hidden sm:flex sm:flex-row gap-3 sm:gap-4'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='outline' size='lg' className='border-2 border-primary hover:bg-muted bg-transparent py-3 text-base'>
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
            <Button onClick={handleSave} size='lg' className='bg-secondary hover:bg-secondary/90 text-secondary-foreground border-2 border-primary py-3 text-base sm:ml-auto' disabled={isSaving || isLoadingMenu}>
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

      {/* Mobile Bottom Navigation for Edit Mode */}
      <MobileBottomNavigation isEditMode={true} onBack={onBack} onSave={handleSave} onReset={handleReset} isSaving={isSaving} isLoadingMenu={isLoadingMenu} onEditMenu={() => {}} searchTerm='' onSearchChange={() => {}} categories={categories} onCategoryCreated={() => {}} selectedCategoryId={null} onCategoryChange={() => {}} subcategories={subcategories} selectedSubcategoryId={null} onSubcategoryChange={() => {}} />
    </div>
  );
}
