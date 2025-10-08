"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Package } from "lucide-react";
import { IngredientClientService } from "@/lib/services/ingredient-client-service";
import { BaseIngredient } from "@/lib/types";
import { IngredientData } from "@/lib/services/ingredient-service";
import { useToast } from "@/hooks/use-toast";
import { IngredientForm } from "./ingredient-form";

interface IngredientPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIngredient: (ingredient: BaseIngredient) => void;
  selectedIngredientIds?: string[];
}

export function IngredientPicker({ isOpen, onClose, onSelectIngredient, selectedIngredientIds = [] }: IngredientPickerProps) {
  const [ingredients, setIngredients] = useState<BaseIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  // Load ingredients with debounced search
  const loadIngredients = useMemo(() => {
    let timeoutId: NodeJS.Timeout;

    return (searchTerm: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          setLoading(true);
          const data = await IngredientClientService.getAll({
            search: searchTerm || undefined,
          });
          // Convert IngredientData to BaseIngredient
          const convertedData: BaseIngredient[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            defaultUnit: item.defaultUnit,
            pricingUnit: item.pricingUnit,
            conversionFactor: Number(item.conversionFactor),
            currentPrice: Number(item.currentPrice),
            category: item.category || undefined,
            description: item.description || undefined,
            createdAt: typeof item.createdAt === "string" ? item.createdAt : item.createdAt.toISOString(),
            updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : item.updatedAt.toISOString(),
          }));
          setIngredients(convertedData);
        } catch (error) {
          toast({
            title: "エラー",
            description: "材料の取得に失敗しました。",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }, 300);
    };
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      loadIngredients(search);
    }
  }, [isOpen, search, loadIngredients]);

  const handleCreateIngredient = () => {
    setShowCreateForm(false);
    loadIngredients(search); // Refresh the list
    toast({
      title: "成功",
      description: "新しい材料を追加しました。",
    });
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ingredient) => !selectedIngredientIds.includes(ingredient.id));
  }, [ingredients, selectedIngredientIds]);

  if (showCreateForm) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>新しい材料を追加</DialogTitle>
          </DialogHeader>
          <IngredientForm onSave={handleCreateIngredient} onCancel={() => setShowCreateForm(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[80vh]'>
        <DialogHeader>
          <DialogTitle>材料を選択</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Search and Add New */}
          <div className='flex gap-3'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input placeholder='材料名で検索...' value={search} onChange={(e) => setSearch(e.target.value)} className='pl-10' />
            </div>
            <Button onClick={() => setShowCreateForm(true)} className='flex items-center gap-2 whitespace-nowrap'>
              <Plus className='h-4 w-4' />
              新しい材料
            </Button>
          </div>

          {/* Ingredients List */}
          <div className='max-h-96 overflow-y-auto'>
            {loading ? (
              <div className='flex justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              </div>
            ) : filteredIngredients.length === 0 ? (
              <div className='text-center py-8'>
                <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-lg font-medium mb-2'>{search ? "該当する材料がありません" : "利用可能な材料がありません"}</p>
                <p className='text-muted-foreground mb-4'>{search ? "検索条件を変更するか、新しい材料を追加してください。" : "新しい材料を追加してください。"}</p>
                <Button onClick={() => setShowCreateForm(true)} className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  新しい材料を追加
                </Button>
              </div>
            ) : (
              <div className='grid gap-3'>
                {filteredIngredients.map((ingredient) => (
                  <Card key={ingredient.id} className='cursor-pointer hover:bg-muted/50 transition-colors' onClick={() => onSelectIngredient(ingredient)}>
                    <CardContent className='pt-4'>
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <h3 className='font-semibold'>{ingredient.name}</h3>
                            {ingredient.category && (
                              <Badge variant='outline' className='text-xs'>
                                {ingredient.category}
                              </Badge>
                            )}
                          </div>

                          <div className='grid grid-cols-4 gap-4 text-sm text-muted-foreground'>
                            <div>
                              <span className='font-medium'>使用単位:</span> {ingredient.defaultUnit}
                            </div>
                            <div>
                              <span className='font-medium'>価格単位:</span> {ingredient.pricingUnit}
                            </div>
                            <div>
                              <span className='font-medium'>換算係数:</span> {ingredient.conversionFactor}
                            </div>
                            <div>
                              <span className='font-medium'>単価:</span> ¥{Number(ingredient.currentPrice).toFixed(2)}
                            </div>
                          </div>

                          {ingredient.description && <p className='text-sm text-muted-foreground mt-2'>{ingredient.description}</p>}
                        </div>

                        <Button size='sm' className='ml-4'>
                          選択
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
