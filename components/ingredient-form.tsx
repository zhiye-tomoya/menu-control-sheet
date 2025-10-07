"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IngredientData, CreateIngredientInput } from "@/lib/services/ingredient-service";
import { IngredientClientService } from "@/lib/services/ingredient-client-service";
import { getSuggestedPricingUnits } from "@/lib/unit-conversions";
import { useToast } from "@/hooks/use-toast";

interface IngredientFormProps {
  ingredient?: IngredientData;
  onSave: () => void;
  onCancel: () => void;
}

const UNIT_OPTIONS = ["g", "ml", "個", "袋", "振り", "枚", "本", "缶", "パック"];

const CATEGORY_OPTIONS = ["野菜・果物", "肉類", "魚介類", "乳製品", "穀物・麺類", "調味料・スパイス", "油脂類", "飲み物", "冷凍食品", "その他"];

export function IngredientForm({ ingredient, onSave, onCancel }: IngredientFormProps) {
  const [formData, setFormData] = useState<CreateIngredientInput>({
    name: "",
    defaultUnit: "g",
    pricingUnit: "g",
    conversionFactor: 1,
    currentPrice: 0,
    category: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Initialize form data when editing
  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        defaultUnit: ingredient.defaultUnit,
        pricingUnit: ingredient.pricingUnit,
        conversionFactor: Number(ingredient.conversionFactor),
        currentPrice: Number(ingredient.currentPrice),
        category: ingredient.category && ingredient.category.trim() ? ingredient.category : "none",
        description: ingredient.description || "",
      });
    }
  }, [ingredient]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "材料名は必須です";
    }

    if (!formData.defaultUnit) {
      newErrors.defaultUnit = "使用単位は必須です";
    }

    if (!formData.pricingUnit) {
      newErrors.pricingUnit = "価格単位は必須です";
    }

    if (formData.conversionFactor <= 0) {
      newErrors.conversionFactor = "換算係数は0より大きい値を入力してください";
    }

    if (formData.currentPrice <= 0) {
      newErrors.currentPrice = "単価は0より大きい値を入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Convert 'none' back to empty string for database storage
      const submitData = {
        ...formData,
        category: formData.category === "none" ? "" : formData.category,
      };

      if (ingredient) {
        // Update existing ingredient
        await IngredientClientService.update(ingredient.id, submitData);
      } else {
        // Create new ingredient
        await IngredientClientService.create(submitData);
      }

      onSave();
    } catch (error) {
      toast({
        title: "エラー",
        description: ingredient ? "材料の更新に失敗しました。" : "材料の追加に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = (field: "defaultUnit" | "pricingUnit", value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-suggest pricing unit based on default unit
      if (field === "defaultUnit" && !ingredient) {
        const suggestedPricingUnits = getSuggestedPricingUnits(value);
        if (suggestedPricingUnits.length > 0) {
          updated.pricingUnit = suggestedPricingUnits[0];
        }
      }

      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* 材料名 */}
        <div className='md:col-span-2'>
          <Label htmlFor='name'>材料名 *</Label>
          <Input id='name' value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder='例: コーヒー豆、牛乳など' className={errors.name ? "border-red-500" : ""} />
          {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name}</p>}
        </div>

        {/* 使用単位 */}
        <div>
          <Label htmlFor='defaultUnit'>使用単位 *</Label>
          <Select value={formData.defaultUnit} onValueChange={(value) => handleUnitChange("defaultUnit", value)}>
            <SelectTrigger className={errors.defaultUnit ? "border-red-500" : ""}>
              <SelectValue placeholder='単位を選択' />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.defaultUnit && <p className='text-sm text-red-500 mt-1'>{errors.defaultUnit}</p>}
        </div>

        {/* 価格単位 */}
        <div>
          <Label htmlFor='pricingUnit'>価格単位 *</Label>
          <Select value={formData.pricingUnit} onValueChange={(value) => handleUnitChange("pricingUnit", value)}>
            <SelectTrigger className={errors.pricingUnit ? "border-red-500" : ""}>
              <SelectValue placeholder='価格単位を選択' />
            </SelectTrigger>
            <SelectContent>
              {getSuggestedPricingUnits(formData.defaultUnit).map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.pricingUnit && <p className='text-sm text-red-500 mt-1'>{errors.pricingUnit}</p>}
        </div>

        {/* 換算係数 */}
        <div>
          <Label htmlFor='conversionFactor'>
            換算係数 *
            <span className='text-sm text-muted-foreground ml-1'>
              (1{formData.pricingUnit}あたりの{formData.defaultUnit}数)
            </span>
          </Label>
          <Input id='conversionFactor' type='number' step='0.1' min='0.1' value={formData.conversionFactor} onChange={(e) => setFormData((prev) => ({ ...prev, conversionFactor: Number(e.target.value) || 0 }))} placeholder='例: 250 (250gの袋の場合)' className={errors.conversionFactor ? "border-red-500" : ""} />
          {errors.conversionFactor && <p className='text-sm text-red-500 mt-1'>{errors.conversionFactor}</p>}
        </div>

        {/* 単価 */}
        <div>
          <Label htmlFor='currentPrice'>
            単価(税別) *<span className='text-sm text-muted-foreground ml-1'>(1{formData.pricingUnit}あたりの価格)</span>
          </Label>
          <Input id='currentPrice' type='number' step='0.01' min='0.01' value={formData.currentPrice} onChange={(e) => setFormData((prev) => ({ ...prev, currentPrice: Number(e.target.value) || 0 }))} placeholder='例: 350 (350円/袋)' className={errors.currentPrice ? "border-red-500" : ""} />
          {errors.currentPrice && <p className='text-sm text-red-500 mt-1'>{errors.currentPrice}</p>}
        </div>

        {/* カテゴリー */}
        <div className='md:col-span-2'>
          <Label htmlFor='category'>カテゴリー</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder='カテゴリーを選択（任意）' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>カテゴリーなし</SelectItem>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 説明 */}
        <div className='md:col-span-2'>
          <Label htmlFor='description'>説明・メモ</Label>
          <Textarea id='description' value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder='材料に関するメモや説明（任意）' rows={3} />
        </div>
      </div>

      {/* 計算例 */}
      {formData.conversionFactor > 0 && formData.currentPrice > 0 && (
        <div className='bg-muted p-4 rounded-lg'>
          <h4 className='font-medium mb-2'>計算例:</h4>
          <p className='text-sm text-muted-foreground'>
            {formData.defaultUnit}あたりの単価: ¥{(formData.currentPrice / formData.conversionFactor).toFixed(3)} / {formData.defaultUnit}
          </p>
          <p className='text-sm text-muted-foreground'>
            例: 10{formData.defaultUnit}使用時の原価 = ¥{((formData.currentPrice / formData.conversionFactor) * 10).toFixed(2)}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex justify-end gap-3'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={loading}>
          キャンセル
        </Button>
        <Button type='submit' disabled={loading}>
          {loading ? "保存中..." : ingredient ? "更新" : "追加"}
        </Button>
      </div>
    </form>
  );
}
