"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { IngredientsManagement } from "@/components/ingredients-management";

export default function IngredientsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
  }, [status, router]);

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

  return (
    <div className='p-4 md:p-0 min-h-screen bg-background'>
      {/* Navigation Header */}
      <div className='bg-card border-b-2 border-primary p-4 sticky top-0 z-50'>
        <div className='container mx-auto flex items-center justify-between'>
          <div className='hidden md:flex items-center gap-4'>
            <Link href='/'>
              <Button variant='outline' size='sm' className='flex items-center gap-2'>
                <ArrowLeft className='h-4 w-4' />
                メニュー一覧に戻る
              </Button>
            </Link>
          </div>
          <div className='flex items-center gap-2'>
            <Link href='/'>
              <Button variant='ghost' size='sm' className='flex items-center gap-2'>
                <Home className='h-4 w-4' />
                ホーム
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <IngredientsManagement />
    </div>
  );
}
