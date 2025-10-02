"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MenuFormHeaderProps {
  menuId: string | null;
  onBack: () => void;
}

export function MenuFormHeader({ menuId, onBack }: MenuFormHeaderProps) {
  const isEditing = Boolean(menuId);
  const title = isEditing ? "原価計算表 - 編集" : "原価計算表 - 新規作成";

  return (
    <div className='border-b-2 sm:border-b-4 border-primary bg-card p-4 sm:p-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4'>
        <Button onClick={onBack} variant='ghost' size='lg' className='hidden sm:flex text-primary hover:text-primary hover:bg-primary/10 self-start'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          メニュー一覧に戻る
        </Button>
        <h1 className='text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground text-center sm:text-left'>{title}</h1>
        <div className='hidden sm:block sm:w-32'></div> {/* Spacer for center alignment on larger screens */}
      </div>
    </div>
  );
}
