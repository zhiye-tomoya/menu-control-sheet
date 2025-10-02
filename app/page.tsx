"use client";

import { useState } from "react";
import { MenuList } from "@/components/menu-list";
import { MenuControlSheet } from "@/components/menu-control-sheet";

export default function Home() {
  const [currentView, setCurrentView] = useState<"list" | "edit">("list");
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  const handleEditMenu = (menuId: string | null) => {
    setEditingMenuId(menuId);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setEditingMenuId(null);
  };

  return <main className='min-h-screen bg-background py-8 px-4 pb-20 sm:pb-8'>{currentView === "list" ? <MenuList onEditMenu={handleEditMenu} /> : <MenuControlSheet menuId={editingMenuId} onBack={handleBackToList} />}</main>;
}
