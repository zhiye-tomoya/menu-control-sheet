"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { Ingredient } from "@/lib/types";

interface IngredientsTableProps {
  ingredients: Ingredient[];
  formattedTotalCost: string;
  onUpdateIngredient: (id: string, field: keyof Ingredient, value: string | number) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (id: string) => void;
}

export function IngredientsTable({ ingredients, formattedTotalCost, onUpdateIngredient, onAddIngredient, onRemoveIngredient }: IngredientsTableProps) {
  return (
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
                  <Input value={ingredient.name} onChange={(e) => onUpdateIngredient(ingredient.id, "name", e.target.value)} className='border-primary' />
                </div>
                <div className='col-span-2'>
                  <Input type='number' step='1' value={ingredient.quantity} onChange={(e) => onUpdateIngredient(ingredient.id, "quantity", Number.parseFloat(e.target.value) || 0)} className='text-right border-primary' />
                </div>
                <div className='col-span-2'>
                  <Select value={ingredient.unit} onValueChange={(value) => onUpdateIngredient(ingredient.id, "unit", value)}>
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
                  <Input type='number' step='1' value={ingredient.unitPrice} onChange={(e) => onUpdateIngredient(ingredient.id, "unitPrice", Number.parseFloat(e.target.value) || 0)} className='text-right border-primary' />
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
                        <AlertDialogAction onClick={() => onRemoveIngredient(ingredient.id)} className='bg-destructive text-white hover:bg-destructive/90'>
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
                      <AlertDialogAction onClick={() => onRemoveIngredient(ingredient.id)} className='bg-destructive text-white hover:bg-destructive/90'>
                        削除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className='space-y-3'>
                <div>
                  <label className='text-sm font-medium text-muted-foreground mb-1 block'>材料名</label>
                  <Input value={ingredient.name} onChange={(e) => onUpdateIngredient(ingredient.id, "name", e.target.value)} className='border-primary text-base' placeholder='材料名を入力' />
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground mb-1 block'>使用量</label>
                    <Input type='number' step='1' value={ingredient.quantity} onChange={(e) => onUpdateIngredient(ingredient.id, "quantity", Number.parseFloat(e.target.value) || 0)} className='text-right border-primary text-base' />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground mb-1 block'>単位</label>
                    <Select value={ingredient.unit} onValueChange={(value) => onUpdateIngredient(ingredient.id, "unit", value)}>
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
                  <Input type='number' step='1' value={ingredient.unitPrice} onChange={(e) => onUpdateIngredient(ingredient.id, "unitPrice", Number.parseFloat(e.target.value) || 0)} className='text-right border-primary text-base' />
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
        <Button onClick={onAddIngredient} variant='outline' className='w-full border-2 border-primary hover:bg-muted bg-transparent text-base py-6'>
          <Plus className='h-5 w-5 mr-2' />
          材料を追加
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
  );
}
