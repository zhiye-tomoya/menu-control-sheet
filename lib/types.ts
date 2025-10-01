export interface Ingredient {
  id: string;
  no: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuData {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
  category?: Category;
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
  totalCost: number;
  sellingPrice: number;
  costRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuInput {
  name: string;
  imageUrl: string;
  categoryId: string;
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
