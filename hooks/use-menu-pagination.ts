"use client";

import { useState, useMemo } from "react";
import { MenuItem } from "@/lib/types";

interface UseMenuPaginationProps {
  menusPerPage?: number;
}

interface UseMenuPaginationReturn {
  // State management
  subcategoryPages: Record<string, number>;
  uncategorizedPage: number;

  // Actions
  setSubcategoryPage: (subcategoryId: string, page: number) => void;
  setUncategorizedPage: (page: number) => void;
  getSubcategoryPage: (subcategoryId: string) => number;

  // Pagination utilities
  getPaginatedMenus: (menus: MenuItem[], page: number) => MenuItem[];
  getPaginationInfo: (
    menus: MenuItem[],
    currentPage: number
  ) => {
    paginatedMenus: MenuItem[];
    totalPages: number;
    hasMultiplePages: boolean;
    startIndex: number;
    endIndex: number;
  };
}

export function useMenuPagination({ menusPerPage = 6 }: UseMenuPaginationProps = {}): UseMenuPaginationReturn {
  const [subcategoryPages, setSubcategoryPages] = useState<Record<string, number>>({});
  const [uncategorizedPage, setUncategorizedPage] = useState(1);

  // Get current page for a subcategory (defaults to 1)
  const getSubcategoryPage = (subcategoryId: string): number => {
    return subcategoryPages[subcategoryId] || 1;
  };

  // Set page for a specific subcategory
  const setSubcategoryPage = (subcategoryId: string, page: number) => {
    setSubcategoryPages((prev) => ({ ...prev, [subcategoryId]: page }));
  };

  // Get paginated menus for any array of menus
  const getPaginatedMenus = (menus: MenuItem[], page: number): MenuItem[] => {
    const startIndex = (page - 1) * menusPerPage;
    const endIndex = startIndex + menusPerPage;
    return menus.slice(startIndex, endIndex);
  };

  // Get comprehensive pagination information
  const getPaginationInfo = useMemo(() => {
    return (menus: MenuItem[], currentPage: number) => {
      const startIndex = (currentPage - 1) * menusPerPage;
      const endIndex = startIndex + menusPerPage;
      const paginatedMenus = menus.slice(startIndex, endIndex);
      const totalPages = Math.ceil(menus.length / menusPerPage);
      const hasMultiplePages = totalPages > 1;

      return {
        paginatedMenus,
        totalPages,
        hasMultiplePages,
        startIndex: Math.min(startIndex + 1, menus.length),
        endIndex: Math.min(endIndex, menus.length),
      };
    };
  }, [menusPerPage]);

  return {
    // State management
    subcategoryPages,
    uncategorizedPage,

    // Actions
    setSubcategoryPage,
    setUncategorizedPage,
    getSubcategoryPage,

    // Pagination utilities
    getPaginatedMenus,
    getPaginationInfo,
  };
}
