"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Search } from "lucide-react";
import { BaseIngredient } from "@/lib/types";
import { IngredientPicker } from "./ingredient-picker";
import { useState } from "react";

interface MenuIngredientItem {
  id: string;
  ingredientId: string;
  ingredient: BaseIngredient;
  quantity: number;
  calculatedCost: number;
}

interface MenuIngredientsTableProps {
  menuIngredients: MenuIngredientItem[];
  totalCost: number;
  selectedIngredientIds: string[];
  onAddIngredientFromDatabase: (ingredient: BaseIngredient, initialQuantity?: number) => void;
  onUpdateQuantity: (menuIngredientId: string, newQuantity: number) => void;
  onRemoveIngredient: (menuIngredientId: string) => void;
}

export function MenuIngredientsTable({ menuIngredients, totalCost, selectedIngredientIds, onAddIngredientFromDatabase, onUpdateQuantity, onRemoveIngredient }: MenuIngredientsTableProps) {
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);

  const handleSelectIngredient = (ingredient: BaseIngredient) => {
    onAddIngredientFromDatabase(ingredient, 1);
    setShowIngredientPicker(false);
  };

  const formattedTotalCost = `¥${totalCost.toFixed(1)}`;

  return (
    <>
      <div className='lg:col-span-8 p-4 lg:p-6'>
        <div className='space-y-3'>
          {/* Desktop Table View */}
          <div className='hidden sm:block overflow-x-auto'>
            <div className='min-w-[600px]'>
              {/* Table Header */}
              <div className='grid grid-cols-16 gap-2 mb-2 bg-muted border-2 border-primary p-2 font-bold text-sm'>
                <div className='col-span-1 text-center'>材料No</div>
                <div className='col-span-3'>材料名</div>
                <div className='col-span-1 text-right'>使用量</div>
                <div className='col-span-1'>単位</div>
                <div className='col-span-2 text-right'>材料単価(税別)</div>
                <div className='col-span-1'>価格単位</div>
                <div className='col-span-2'>換算係数</div>
                <div className='col-span-2 text-right'>原価(税別)</div>
                <div className='col-span-2'>操作</div>
              </div>

              {/* Table Rows */}
              {menuIngredients.map((menuIngredient, index) => (
                <div key={menuIngredient.id} className='grid grid-cols-16 gap-2 mb-2 items-center border-2 border-primary p-2 bg-card'>
                  <div className='col-span-1 text-center font-medium'>{index + 1}</div>
                  <div className='col-span-3'>
                    <div className='flex flex-col'>
                      <span className='font-medium'>{menuIngredient.ingredient.name}</span>
                      {menuIngredient.ingredient.category && (
                        <Badge variant='outline' className='text-xs w-fit mt-1'>
                          {menuIngredient.ingredient.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className='col-span-1'>
                    <Input type='number' step='0.1' value={menuIngredient.quantity !== null && menuIngredient.quantity !== undefined ? menuIngredient.quantity.toString() : "1"} onChange={(e) => onUpdateQuantity(menuIngredient.id, Number.parseFloat(e.target.value) || 0)} className='text-right border-primary' />
                  </div>
                  <div className='col-span-1 text-center'>
                    <span className='text-sm font-medium'>{menuIngredient.ingredient.defaultUnit}</span>
                  </div>
                  <div className='col-span-2 text-right'>
                    <span className='text-sm font-medium'>¥{menuIngredient.ingredient.currentPrice.toFixed(2)}</span>
                  </div>
                  <div className='col-span-1 text-center'>
                    <span className='text-sm'>{menuIngredient.ingredient.pricingUnit}</span>
                  </div>
                  <div className='col-span-2 text-center'>
                    <span className='text-sm'>{menuIngredient.ingredient.conversionFactor}</span>
                  </div>
                  <div className='col-span-2 text-right font-medium'>¥{menuIngredient.calculatedCost.toFixed(1)}</div>
                  <div className='col-span-2 flex justify-center'>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>材料を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>「{menuIngredient.ingredient.name}」をこのレシピから削除します。この操作は取り消すことができません。</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRemoveIngredient(menuIngredient.id)} className='bg-destructive text-white hover:bg-destructive/90'>
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
            {menuIngredients.map((menuIngredient, index) => (
              <Card key={menuIngredient.id} className='border-2 border-primary p-4 bg-card'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <span className='bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold'>{index + 1}</span>
                    <span className='font-medium text-sm text-muted-foreground'>材料 #{index + 1}</span>
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
                        <AlertDialogDescription>「{menuIngredient.ingredient.name}」をこのレシピから削除します。この操作は取り消すことができません。</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRemoveIngredient(menuIngredient.id)} className='bg-destructive text-white hover:bg-destructive/90'>
                          削除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className='space-y-3'>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <label className='text-sm font-medium text-muted-foreground'>材料名</label>
                      {menuIngredient.ingredient.category && (
                        <Badge variant='outline' className='text-xs'>
                          {menuIngredient.ingredient.category}
                        </Badge>
                      )}
                    </div>
                    <p className='font-semibold text-base'>{menuIngredient.ingredient.name}</p>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground mb-1 block'>使用量</label>
                      <Input type='number' step='0.1' value={menuIngredient.quantity !== null && menuIngredient.quantity !== undefined ? menuIngredient.quantity.toString() : "1"} onChange={(e) => onUpdateQuantity(menuIngredient.id, Number.parseFloat(e.target.value) || 0)} className='text-right border-primary text-base' />
                    </div>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground mb-1 block'>単位</label>
                      <div className='h-10 flex items-center justify-center border border-input rounded-md bg-muted'>
                        <span className='text-base font-medium'>{menuIngredient.ingredient.defaultUnit}</span>
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground mb-1 block'>材料単価</label>
                      <div className='h-10 flex items-center justify-end border border-input rounded-md bg-muted px-3'>
                        <span className='text-base font-medium'>¥{menuIngredient.ingredient.currentPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-muted-foreground mb-1 block'>価格単位</label>
                      <div className='h-10 flex items-center justify-center border border-input rounded-md bg-muted'>
                        <span className='text-base font-medium'>{menuIngredient.ingredient.pricingUnit}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-muted-foreground mb-1 block'>換算係数</label>
                    <div className='h-10 flex items-center justify-center border border-input rounded-md bg-muted'>
                      <span className='text-base font-medium'>
                        {menuIngredient.ingredient.conversionFactor} {menuIngredient.ingredient.defaultUnit}/{menuIngredient.ingredient.pricingUnit}
                      </span>
                    </div>
                  </div>

                  <div className='bg-muted/50 rounded-lg p-3 border border-primary/20'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm font-medium text-muted-foreground'>原価(税別)</span>
                      <span className='text-lg font-bold text-primary'>¥{menuIngredient.calculatedCost.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Add Ingredient Button */}
          <Button onClick={() => setShowIngredientPicker(true)} variant='outline' className='w-full border-2 border-primary hover:bg-muted bg-transparent text-base py-6'>
            <Search className='h-5 w-5 mr-2' />
            材料データベースから選択
          </Button>

          {/* Total Row */}
          <div className='bg-muted border-2 border-primary p-4 rounded-lg'>
            <div className='flex justify-between items-center'>
              <span className='font-bold text-base sm:text-lg'>使用原価合計</span>
              <span className='text-xl sm:text-2xl font-bold text-primary'>{formattedTotalCost}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredient Picker Dialog */}
      <IngredientPicker isOpen={showIngredientPicker} onClose={() => setShowIngredientPicker(false)} onSelectIngredient={handleSelectIngredient} selectedIngredientIds={selectedIngredientIds} />
    </>
  );
}
