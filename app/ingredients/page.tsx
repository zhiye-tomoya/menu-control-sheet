import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { IngredientsManagement } from "@/components/ingredients-management";

export default function IngredientsPage() {
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
