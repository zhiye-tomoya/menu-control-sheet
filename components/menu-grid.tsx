"use client";

import { MenuItem } from "@/lib/types";
import { MenuCard } from "@/components/menu-card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface MenuGridProps {
  menus: MenuItem[];
  title: string;
  subtitle?: string;
  currentPage: number;
  totalPages: number;
  hasMultiplePages: boolean;
  totalMenus: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onEditMenu: (menuId: string) => void;
  onDeleteMenu: (menuId: string) => void;
  isDeleting?: string; // menuId currently being deleted
}

export function MenuGrid({ menus, title, subtitle, currentPage, totalPages, hasMultiplePages, totalMenus, startIndex, endIndex, onPageChange, onEditMenu, onDeleteMenu, isDeleting }: MenuGridProps) {
  return (
    <div>
      {/* Section Header */}
      <div className='flex justify-between items-center mb-4'>
        <div className='flex flex-col'>
          <h2 className='text-xl font-bold text-foreground pb-2 border-b-2 border-primary'>{title}</h2>
          {subtitle && <p className='text-sm text-muted-foreground mt-1'>{subtitle}</p>}
        </div>
        <span className='text-sm text-muted-foreground'>
          {totalMenus} 件中 {startIndex} - {endIndex} 件表示
        </span>
      </div>

      {/* Menu Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
        {menus.map((menu) => (
          <MenuCard key={menu.id} menu={menu} onEdit={onEditMenu} onDelete={onDeleteMenu} isDeleting={isDeleting === menu.id} />
        ))}
      </div>

      {/* Pagination */}
      {hasMultiplePages && (
        <div className='mt-6'>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      onPageChange(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      onPageChange(currentPage + 1);
                    }
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
