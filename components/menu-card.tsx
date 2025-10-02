"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Calculator, Loader2 } from "lucide-react";
import { MenuItem } from "@/lib/types";

interface MenuCardProps {
  menu: MenuItem;
  onEdit: (menuId: string) => void;
  onDelete: (menuId: string) => void;
  isDeleting?: boolean;
}

export function MenuCard({ menu, onEdit, onDelete, isDeleting = false }: MenuCardProps) {
  return (
    <Card className='border-2 border-primary bg-muted/30 hover:bg-muted/50 transition-colors'>
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
            <Button variant='ghost' size='icon' onClick={() => onEdit(menu.id)} className='h-8 w-8 text-primary hover:text-primary hover:bg-primary/10'>
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
                  <AlertDialogAction onClick={() => onDelete(menu.id)} className='bg-destructive text-white hover:bg-destructive/90' disabled={isDeleting}>
                    {isDeleting ? (
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

        <Button onClick={() => onEdit(menu.id)} className='w-full mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground border-2 border-primary'>
          <Edit className='h-4 w-4 mr-2' />
          編集
        </Button>
      </div>
    </Card>
  );
}
