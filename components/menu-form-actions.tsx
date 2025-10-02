"use client";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw, Save, Loader2 } from "lucide-react";

interface MenuFormActionsProps {
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
  isLoadingMenu: boolean;
}

export function MenuFormActions({ onSave, onReset, isSaving, isLoadingMenu }: MenuFormActionsProps) {
  return (
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
            <AlertDialogAction onClick={onReset} className='bg-destructive text-white hover:bg-destructive/90'>
              リセット
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button onClick={onSave} size='lg' className='bg-secondary hover:bg-secondary/90 text-secondary-foreground border-2 border-primary py-3 text-base sm:ml-auto' disabled={isSaving || isLoadingMenu}>
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
  );
}
