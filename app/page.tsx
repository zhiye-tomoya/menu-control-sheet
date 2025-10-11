"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MenuList } from "@/components/menu-list";
import { MenuControlSheet } from "@/components/menu-control-sheet";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<"list" | "edit">("list");
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [status, router]);

  const handleEditMenu = (menuId: string | null) => {
    setEditingMenuId(menuId);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setEditingMenuId(null);
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
          <p className='mt-4'>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === "unauthenticated") {
    return null;
  }

  return <main className='min-h-screen bg-background py-8 px-4 pb-20 sm:pb-8'>{currentView === "list" ? <MenuList onEditMenu={handleEditMenu} /> : <MenuControlSheet menuId={editingMenuId} onBack={handleBackToList} />}</main>;
}
