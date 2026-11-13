export type ProductCategory =
  | "Tees"
  | "Hoodies & Sweats"
  | "Jackets & Outerwear"
  | "Bottoms & Cargo"
  | "Caps & Accessories";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Tees",
  "Hoodies & Sweats",
  "Jackets & Outerwear",
  "Bottoms & Cargo",
  "Caps & Accessories",
];

export type ProductSize = "S" | "M" | "L" | "XL" | "XXL" | "OS";

export const PRODUCT_SIZES: ProductSize[] = ["S", "M", "L", "XL", "XXL", "OS"];

export type ProductStatus = "available" | "reserved" | "sold";

export interface Product {
  id: string;
  sku: string;
  title: string;
  category: ProductCategory;
  price_php: number;
  size: string;
  fit_notes: string;
  condition_rating: string;
  condition_notes: string;
  status: ProductStatus;
  images: string[];
  era: string;
  featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProductInput {
  sku: string;
  title: string;
  category: ProductCategory;
  price_php: number;
  size: string;
  fit_notes: string;
  condition_rating: string;
  condition_notes: string;
  status: ProductStatus;
  images: string[];
  era: string;
  featured: boolean;
}
