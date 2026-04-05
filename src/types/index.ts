export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  brand: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  specs: Record<string, string>;
  inStock: boolean;
  stockCount: number;
  badges: ProductBadge[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export type ProductBadge = 'new' | 'sale' | 'bestseller';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  location: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  image: string;
  validUntil: string;
  slug: string;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  postalCode: string;
  notes?: string;
  billingDifferent: boolean;
  billingAddress?: string;
  billingCity?: string;
  billingCounty?: string;
  billingPostalCode?: string;
}

export interface FilterState {
  category?: string;
  priceRange: [number, number];
  brands: string[];
  inStock: boolean;
  sortBy: string;
  search: string;
}
