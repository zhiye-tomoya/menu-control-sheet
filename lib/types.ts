// Base ingredient definition (master data)
export interface BaseIngredient {
  id: string;
  name: string;
  defaultUnit: string; // g, ml, 個, etc.
  pricingUnit: string; // 袋, kg, l, etc.
  conversionFactor: number; // how many default_unit per pricing_unit
  currentPrice: number;
  category?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Recipe ingredient (used in menus)
export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  ingredient?: BaseIngredient; // populated via join
  quantity: number; // amount used in recipe
  calculatedCost: number; // auto-calculated
  createdAt: string;
}

// Legacy ingredient interface for backward compatibility
export interface Ingredient {
  id: string;
  no: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  // New fields for unit conversion
  pricingUnit?: string;
  conversionFactor?: number; // How many recipe units equal one pricing unit
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface MenuData {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
  category?: Category;
  subcategoryId: string;
  subcategory?: Subcategory;
  // New normalized structure
  recipeIngredients?: RecipeIngredient[];
  // Legacy field for backward compatibility
  ingredients?: Ingredient[];
  sellingPrice: number;
  totalCost: number;
  costRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
  category?: Category;
  subcategoryId: string;
  subcategory?: Subcategory;
  totalCost: number;
  sellingPrice: number;
  costRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuInput {
  name: string;
  imageUrl: string;
  subcategoryId: string;
  // Support both new and legacy format
  ingredients?: Ingredient[]; // legacy
  recipeIngredients?: Omit<RecipeIngredient, "createdAt">[]; // new normalized
  sellingPrice: number;
}

export interface CreateBaseIngredientInput {
  name: string;
  defaultUnit: string;
  pricingUnit: string;
  conversionFactor: number;
  currentPrice: number;
  category?: string;
  description?: string;
}

export interface UpdateBaseIngredientInput extends CreateBaseIngredientInput {
  id: string;
}

export interface UpdateMenuInput extends CreateMenuInput {
  id: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput extends CreateCategoryInput {
  id: string;
}

export interface CreateSubcategoryInput {
  name: string;
  description?: string;
  categoryId: string;
}

export interface UpdateSubcategoryInput extends CreateSubcategoryInput {
  id: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
