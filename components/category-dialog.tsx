"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Loader2 } from "lucide-react";
import { Category } from "@/lib/types";
import { toast } from "sonner";

interface CategoryDialogProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  initialData?: Category;
  isLoading?: boolean;
}

export function CategoryDialog({ mode, isOpen, onClose, onSubmit, initialData, isLoading = false }: CategoryDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setName(initialData.name);
        setDescription(initialData.description || "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("カテゴリ名を入力してください");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
      });

      // Reset form and close dialog
      setName("");
      setDescription("");
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName("");
      setDescription("");
      onClose();
    }
  };

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "新しいカテゴリを作成" : "カテゴリを編集";
  const description_text = isCreateMode ? "新しいカテゴリを作成してメニューを整理しましょう。" : "選択されたカテゴリの情報を編集します。";
  const submitText = isCreateMode ? "作成" : "更新";
  const loadingText = isCreateMode ? "作成中..." : "更新中...";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description_text}</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='category-name'>カテゴリ名 *</Label>
            <Input id='category-name' placeholder='カテゴリ名を入力...' value={name} onChange={(e) => setName(e.target.value)} className='border-2 border-primary' disabled={isLoading} />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='category-description'>説明（任意）</Label>
            <Textarea id='category-description' placeholder='カテゴリの説明を入力...' value={description} onChange={(e) => setDescription(e.target.value)} className='border-2 border-primary resize-none' rows={3} disabled={isLoading} />
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={isLoading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isLoading} className='bg-primary hover:bg-primary/90'>
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                {loadingText}
              </>
            ) : (
              <>
                {isCreateMode ? <Plus className='h-4 w-4 mr-2' /> : <Edit className='h-4 w-4 mr-2' />}
                {submitText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
