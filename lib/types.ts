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
  ingredients: Ingredient[];
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
  ingredients: Ingredient[];
  sellingPrice: number;
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
