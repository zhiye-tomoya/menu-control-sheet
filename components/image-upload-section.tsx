"use client";

import { Upload } from "lucide-react";

interface ImageUploadSectionProps {
  imageUrl: string;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploadSection({ imageUrl, onImageUpload }: ImageUploadSectionProps) {
  return (
    <div className='lg:col-span-4 lg:border-r-4 border-primary p-4 lg:p-6 bg-muted/20'>
      <div className='aspect-square max-w-sm mx-auto lg:max-w-none bg-muted border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center relative overflow-hidden'>
        {imageUrl ? (
          <img src={imageUrl || "/placeholder.svg"} alt='Product' className='w-full h-full object-cover' />
        ) : (
          <div className='text-center'>
            <Upload className='w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-2 text-muted-foreground' />
            <p className='text-xs lg:text-sm text-muted-foreground'>商品画像</p>
          </div>
        )}
        <input type='file' accept='image/*' onChange={onImageUpload} className='absolute inset-0 opacity-0 cursor-pointer' />
      </div>
    </div>
  );
}
