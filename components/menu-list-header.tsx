"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FolderPlus, Package } from "lucide-react";
import Link from "next/link";

interface MenuListHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateMenu: () => void;
  onCreateCategory: () => void;
}

export function MenuListHeader({ searchTerm, onSearchChange, onCreateMenu, onCreateCategory }: MenuListHeaderProps) {
  return (
    <div className='border-b-2 sm:border-b-4 border-primary bg-card p-4 sm:p-6 sm:sticky sm:top-0 sm:z-50'>
      <h1 className='text-2xl sm:text-3xl font-bold text-center text-foreground mb-4'>メニュー管理</h1>

      {/* Search and Add Section - Desktop Only */}
      <div className='hidden sm:flex flex-col sm:flex-row gap-4 items-center'>
        <div className='relative flex-1 w-full sm:max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input placeholder='メニューを検索...' value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className='pl-10 border-2 border-primary' />
        </div>
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
          <Link href='/ingredients'>
            <Button variant='outline' size='lg' className='border-2 border-primary hover:bg-muted bg-transparent w-full sm:w-auto'>
              <Package className='h-4 w-4 mr-2' />
              材料管理
            </Button>
          </Link>
          <Button variant='outline' size='lg' onClick={onCreateCategory} className='border-2 border-primary hover:bg-muted bg-transparent w-full sm:w-auto'>
            <FolderPlus className='h-4 w-4 mr-2' />
            カテゴリを作成
          </Button>
          <Button onClick={onCreateMenu} size='lg' className='bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary w-full sm:w-auto'>
            <Plus className='h-4 w-4 mr-2' />
            新しいメニューを作成
          </Button>
        </div>
      </div>
    </div>
  );
}
