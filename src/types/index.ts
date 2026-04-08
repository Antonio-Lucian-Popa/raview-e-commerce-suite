export type ProductBadge = 'new' | 'sale' | 'bestseller';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  active: boolean;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  alt?: string | null;
  position?: number;
}

export interface ProductVariant {
  id?: string;
  name: string;
  sku: string;
  price?: number | null;
  stock: number;
  attributes: Record<string, unknown>;
}

export interface Review {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  approved: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  active: boolean;
  description?: string | null;
  specs?: Record<string, unknown> | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  categoryId: string;
  brandId: string;
  category?: Category;
  brand?: Brand;
  images: ProductImage[];
  variants?: ProductVariant[];
  promotions?: Promotion[];
  reviews?: Review[];
  createdAt: string;
  updatedAt?: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
  scope: 'product' | 'category';
  productId?: string | null;
  categoryId?: string | null;
  product?: Product | null;
  category?: Category | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  gallery?: string[] | null;
  clientName?: string | null;
  completedAt?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
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
}

export interface FilterState {
  categoryId?: string;
  brandIds: string[];
  inStock: boolean;
  sortBy: string;
  search: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: {
    id: string;
    name: string;
  };
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export interface AdminNotification {
  id: string;
  type: 'new_order' | 'low_stock' | 'out_of_stock';
  title: string;
  message: string;
  createdAt: string;
  section: 'orders' | 'products';
}

export interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  notes?: string | null;
  createdAt: string;
  customer?: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
  customerSnapshot?: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
  addressSnapshot?: {
    line1: string;
    line2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
  };
  items?: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    productId: string;
  }>;
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active?: boolean;
  parentId?: string;
}

export interface CreateBrandPayload {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  active?: boolean;
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  sku: string;
  price: number;
  oldPrice?: number;
  stock: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  active?: boolean;
  categoryId: string;
  brandId: string;
  description?: string;
  specs?: Record<string, unknown>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface CreatePromotionPayload {
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  active?: boolean;
  scope: 'product' | 'category';
  productId?: string;
  categoryId?: string;
}
