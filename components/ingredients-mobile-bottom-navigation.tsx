"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Plus, Settings } from "lucide-react";

interface IngredientsMobileBottomNavigationProps {
  onAddIngredient: () => void;
  isAdmin?: boolean;
}

export function IngredientsMobileBottomNavigation({ onAddIngredient, isAdmin = false }: IngredientsMobileBottomNavigationProps) {
  return (
    <div className='fixed bottom-0 left-0 right-0 bg-background border-t-2 border-primary shadow-lg z-40 md:hidden'>
      <div className='flex items-center justify-around py-2'>
        {/* Back to Menu List */}
        <Link href='/'>
          <Button variant='ghost' size='lg' className='flex flex-col items-center gap-1 h-auto py-3 px-4 hover:bg-primary/10 text-foreground'>
            <ArrowLeft className='h-5 w-5' />
            <span className='text-xs font-medium'>戻る</span>
          </Button>
        </Link>

        {/* Home */}
        <Link href='/'>
          <Button variant='ghost' size='lg' className='flex flex-col items-center gap-1 h-auto py-3 px-4 hover:bg-primary/10 text-foreground'>
            <Home className='h-5 w-5' />
            <span className='text-xs font-medium'>ホーム</span>
          </Button>
        </Link>

        {/* Admin Dashboard Button - Only show for admin users */}
        {isAdmin && (
          <Link href='/dashboard'>
            <Button variant='ghost' size='lg' className='flex flex-col items-center gap-1 h-auto py-3 px-4 hover:bg-primary/10 text-foreground'>
              <Settings className='h-5 w-5' />
              <span className='text-xs font-medium'>管理</span>
            </Button>
          </Link>
        )}

        {/* Add Ingredient - Primary Action */}
        <Button onClick={onAddIngredient} size='lg' className='flex flex-col items-center gap-1 h-auto py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary'>
          <Plus className='h-5 w-5' />
          <span className='text-xs font-medium'>追加</span>
        </Button>
      </div>
    </div>
  );
}
