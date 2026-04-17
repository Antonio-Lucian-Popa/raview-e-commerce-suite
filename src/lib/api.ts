import {
  AdminNotification,
  AuthSession,
  Brand,
  Category,
  CheckoutFormData,
  CreateBrandPayload,
  CreateCategoryPayload,
  CreateProductPayload,
  CreatePromotionPayload,
  FilterState,
  LoginResponse,
  Order,
  PaymentMethod,
  PaginatedResponse,
  PortfolioProject,
  Product,
  Promotion,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
const ADMIN_SESSION_KEY = 'raview_admin_session';

const parseNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  return 0;
};

const normalizeCategory = (category: any): Category => ({
  ...category,
  description: category.description ?? '',
  image: category.image ?? '',
  children: category.children?.map(normalizeCategory) ?? [],
  parent: category.parent ? normalizeCategory(category.parent) : null,
  productCount: category._count?.products ?? category.productCount ?? 0,
});

const normalizeBrand = (brand: any): Brand => ({
  ...brand,
  description: brand.description ?? '',
  logo: brand.logo ?? '',
});

const buildBadges = (product: any): Array<'new' | 'sale' | 'bestseller'> => {
  const badges: Array<'new' | 'sale' | 'bestseller'> = [];
  if (product.isNew) badges.push('new');
  if (product.oldPrice && parseNumber(product.oldPrice) > parseNumber(product.price)) badges.push('sale');
  if (product.bestseller) badges.push('bestseller');
  return badges;
};

const normalizePromotion = (promotion: any): Promotion => ({
  ...promotion,
  value: parseNumber(promotion.value),
  product: promotion.product ? normalizeProduct(promotion.product) : null,
  category: promotion.category ? normalizeCategory(promotion.category) : null,
});

const normalizeProduct = (product: any): Product => {
  const price = parseNumber(product.price);
  const oldPrice = product.oldPrice == null ? null : parseNumber(product.oldPrice);
  return {
    ...product,
    price,
    oldPrice,
    currency: product.currency ?? product.specs?.currency ?? 'RON',
    exchangeRate: product.exchangeRate == null ? null : parseNumber(product.exchangeRate),
    stock: Number(product.stock ?? 0),
    featured: Boolean(product.featured),
    bestseller: Boolean(product.bestseller),
    isNew: Boolean(product.isNew),
    active: Boolean(product.active),
    category: product.category ? normalizeCategory(product.category) : undefined,
    brand: product.brand ? normalizeBrand(product.brand) : undefined,
    images: (product.images ?? []).map((image: any) => ({
      ...image,
      position: Number(image.position ?? 0),
    })),
    variants: (product.variants ?? []).map((variant: any) => ({
      ...variant,
      price: variant.price == null ? null : parseNumber(variant.price),
      stock: Number(variant.stock ?? 0),
    })),
    promotions: (product.promotions ?? []).map(normalizePromotion),
    reviews: product.reviews ?? [],
  };
};

const normalizePortfolio = (project: any): PortfolioProject => ({
  ...project,
  gallery: Array.isArray(project.gallery)
    ? project.gallery
    : Array.isArray(project.gallery?.images)
      ? project.gallery.images
      : project.coverImage
        ? [project.coverImage]
        : [],
});

const normalizeOrder = (order: any): Order => ({
  ...order,
  subtotal: parseNumber(order.subtotal),
  discount: parseNumber(order.discount),
  shipping: parseNumber(order.shipping),
  total: parseNumber(order.total),
  items: (order.items ?? []).map((item: any) => ({
    ...item,
    unitPrice: parseNumber(item.unitPrice),
    totalPrice: parseNumber(item.totalPrice),
  })),
});

const readStoredSession = (): AuthSession | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
};

export const adminSessionStorage = {
  key: ADMIN_SESSION_KEY,
  get: readStoredSession,
  set(session: AuthSession | null) {
    if (typeof window === 'undefined') return;
    if (!session) {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      return;
    }
    window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  },
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

type UploadResponse = {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = 'A apărut o eroare la comunicarea cu serverul.';
    try {
      const errorData = await response.json();
      message = errorData.message ?? errorData.error ?? message;
      if (Array.isArray(message)) {
        message = message.join(', ');
      }
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function uploadRequest<T>(path: string, file: File, token: string): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    let message = 'A apărut o eroare la upload.';
    try {
      const errorData = await response.json();
      message = errorData.message ?? errorData.error ?? message;
      if (Array.isArray(message)) {
        message = message.join(', ');
      }
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

const createQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === false) return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const api = {
  auth: {
    async login(email: string, password: string): Promise<LoginResponse> {
      const tokens = await request<{ accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      const user = await request('/auth/me', { token: tokens.accessToken });
      return {
        ...tokens,
        user,
      } as LoginResponse;
    },
    async refresh(refreshToken: string): Promise<LoginResponse> {
      const tokens = await request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });
      const user = await request('/auth/me', { token: tokens.accessToken });
      return {
        ...tokens,
        user,
      } as LoginResponse;
    },
    async me(token: string) {
      return request('/auth/me', { token });
    },
    async logout(token: string) {
      return request('/auth/logout', { method: 'POST', token });
    },
  },
  uploads: {
    async uploadImage(token: string, file: File, folder: 'products' | 'categories' | 'brands'): Promise<string> {
      const response = await uploadRequest<UploadResponse>(`/uploads/image${createQueryString({ folder })}`, file, token);
      return response.url;
    },
  },
  notifications: {
    async getRecent(token: string): Promise<AdminNotification[]> {
      return request<AdminNotification[]>(`/notifications/recent${createQueryString({ token })}`);
    },
    async markAsRead(token: string, ids?: string[]): Promise<AdminNotification[]> {
      return request<AdminNotification[]>(`/notifications/read${createQueryString({ token })}`, {
        method: 'POST',
        body: { ids },
      });
    },
    getStreamUrl(token: string) {
      return `${API_BASE_URL}/notifications/stream${createQueryString({ token })}`;
    },
  },
  products: {
    async getAll(filters?: Partial<FilterState>): Promise<Product[]> {
      const sortMap: Record<string, { sortBy?: string; sortOrder?: string }> = {
        newest: { sortBy: 'createdAt', sortOrder: 'desc' },
        'price-asc': { sortBy: 'price', sortOrder: 'asc' },
        'price-desc': { sortBy: 'price', sortOrder: 'desc' },
        name: { sortBy: 'name', sortOrder: 'asc' },
      };
      const sort = sortMap[filters?.sortBy ?? 'newest'] ?? sortMap.newest;
      const response = await request<PaginatedResponse<any>>(
        `/products${createQueryString({
          categoryId: filters?.categoryId,
          brandId: filters?.brandIds?.[0],
          featured: undefined,
          search: filters?.search,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
          limit: 100,
        })}`,
      );

      let items = response.items.map(normalizeProduct);
      if (filters?.brandIds?.length) {
        items = items.filter((item) => filters.brandIds.includes(item.brandId));
      }
      if (filters?.inStock) {
        items = items.filter((item) => item.stock > 0);
      }
      if (typeof filters?.minPrice === 'number') {
        items = items.filter((item) => item.price >= filters.minPrice!);
      }
      if (typeof filters?.maxPrice === 'number') {
        items = items.filter((item) => item.price <= filters.maxPrice!);
      }
      return items;
    },
    async getCatalogPage(
      filters?: Partial<FilterState> & { page?: number; limit?: number },
    ): Promise<PaginatedResponse<Product>> {
      const sortMap: Record<string, { sortBy?: string; sortOrder?: string }> = {
        newest: { sortBy: 'createdAt', sortOrder: 'desc' },
        'price-asc': { sortBy: 'price', sortOrder: 'asc' },
        'price-desc': { sortBy: 'price', sortOrder: 'desc' },
        name: { sortBy: 'name', sortOrder: 'asc' },
      };
      const sort = sortMap[filters?.sortBy ?? 'newest'] ?? sortMap.newest;
      const response = await request<PaginatedResponse<any>>(
        `/products${createQueryString({
          page: filters?.page ?? 1,
          limit: filters?.limit ?? 12,
          categoryId: filters?.categoryId,
          brandIds: filters?.brandIds?.length ? filters.brandIds.join(',') : undefined,
          inStock: filters?.inStock || undefined,
          search: filters?.search,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
        })}`,
      );

      return {
        ...response,
        items: response.items.map(normalizeProduct),
      };
    },
    async getBySlug(slug: string): Promise<Product> {
      const response = await request<any>(`/products/slug/${slug}`);
      return normalizeProduct(response);
    },
    async getRelated(categoryId: string, excludeId: string): Promise<Product[]> {
      const items = await this.getAll({ categoryId, sortBy: 'newest', brandIds: [], inStock: false, search: '' });
      return items.filter((item) => item.id !== excludeId).slice(0, 4);
    },
    async getFeatured(): Promise<Product[]> {
      const response = await request<PaginatedResponse<any>>('/products?featured=true&limit=8');
      return response.items.map(normalizeProduct);
    },
    async adminGetAll(
      token: string,
      params?: { page?: number; limit?: number; search?: string; categoryId?: string; brandId?: string },
    ): Promise<PaginatedResponse<Product>> {
      const response = await request<PaginatedResponse<any>>(
        `/products/admin/all${createQueryString({
          page: params?.page ?? 1,
          limit: params?.limit ?? 12,
          search: params?.search,
          categoryId: params?.categoryId,
          brandId: params?.brandId,
        })}`,
        { token },
      );
      return { ...response, items: response.items.map(normalizeProduct) };
    },
    async create(token: string, payload: CreateProductPayload): Promise<Product> {
      const response = await request<any>('/products', { method: 'POST', body: payload, token });
      return normalizeProduct(response);
    },
    async update(token: string, id: string, payload: Partial<CreateProductPayload>): Promise<Product> {
      const response = await request<any>(`/products/${id}`, { method: 'PATCH', body: payload, token });
      return normalizeProduct(response);
    },
    async remove(token: string, id: string) {
      return request(`/products/${id}`, { method: 'DELETE', token });
    },
  },
  categories: {
    async getAll(): Promise<Category[]> {
      const response = await request<any[]>('/categories');
      return response.map(normalizeCategory);
    },
    async getBySlug(slug: string): Promise<Category | undefined> {
      const categories = await this.getAll();
      return categories.find((category) => category.slug === slug);
    },
    async adminGetAll(
      token: string,
      params?: { page?: number; limit?: number; search?: string },
    ): Promise<PaginatedResponse<Category>> {
      const response = await request<PaginatedResponse<any>>(
        `/categories/admin/all${createQueryString({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
        })}`,
        { token },
      );
      return { ...response, items: response.items.map(normalizeCategory) };
    },
    async create(token: string, payload: CreateCategoryPayload): Promise<Category> {
      const response = await request<any>('/categories', { method: 'POST', body: payload, token });
      return normalizeCategory(response);
    },
    async update(token: string, id: string, payload: Partial<CreateCategoryPayload>): Promise<Category> {
      const response = await request<any>(`/categories/${id}`, { method: 'PATCH', body: payload, token });
      return normalizeCategory(response);
    },
    async remove(token: string, id: string) {
      return request(`/categories/${id}`, { method: 'DELETE', token });
    },
  },
  brands: {
    async getAll(): Promise<Brand[]> {
      const response = await request<any[]>('/brands');
      return response.map(normalizeBrand);
    },
    async adminGetAll(
      token: string,
      params?: { page?: number; limit?: number; search?: string },
    ): Promise<PaginatedResponse<Brand>> {
      const response = await request<PaginatedResponse<any>>(
        `/brands/admin/all${createQueryString({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
        })}`,
        { token },
      );
      return { ...response, items: response.items.map(normalizeBrand) };
    },
    async create(token: string, payload: CreateBrandPayload): Promise<Brand> {
      const response = await request<any>('/brands', { method: 'POST', body: payload, token });
      return normalizeBrand(response);
    },
    async update(token: string, id: string, payload: Partial<CreateBrandPayload>): Promise<Brand> {
      const response = await request<any>(`/brands/${id}`, { method: 'PATCH', body: payload, token });
      return normalizeBrand(response);
    },
    async remove(token: string, id: string) {
      return request(`/brands/${id}`, { method: 'DELETE', token });
    },
  },
  promotions: {
    async getAll(): Promise<Promotion[]> {
      const response = await request<any[]>('/promotions');
      return response.map(normalizePromotion);
    },
    async adminGetAll(
      token: string,
      params?: { page?: number; limit?: number; search?: string },
    ): Promise<PaginatedResponse<Promotion>> {
      const response = await request<PaginatedResponse<any>>(
        `/promotions/admin/all${createQueryString({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
        })}`,
        { token },
      );
      return { ...response, items: response.items.map(normalizePromotion) };
    },
    async create(token: string, payload: CreatePromotionPayload): Promise<Promotion> {
      const response = await request<any>('/promotions', { method: 'POST', body: payload, token });
      return normalizePromotion(response);
    },
    async update(token: string, id: string, payload: Partial<CreatePromotionPayload>): Promise<Promotion> {
      const response = await request<any>(`/promotions/${id}`, { method: 'PATCH', body: payload, token });
      return normalizePromotion(response);
    },
    async remove(token: string, id: string) {
      return request(`/promotions/${id}`, { method: 'DELETE', token });
    },
  },
  portfolio: {
    async getAll(): Promise<PortfolioProject[]> {
      const response = await request<any[]>('/portfolio');
      return response.map(normalizePortfolio);
    },
    async getBySlug(slug: string): Promise<PortfolioProject | undefined> {
      const items = await this.getAll();
      return items.find((item) => item.slug === slug);
    },
  },
  payments: {
    async createCheckoutSession(payload: { orderId: string; successUrl: string; cancelUrl: string }): Promise<{ sessionId: string; checkoutUrl: string }> {
      return request('/payments/checkout-session', { method: 'POST', body: payload });
    },
  },
  orders: {
    async create(payload: CheckoutFormData, items: Array<{ productId: string; quantity: number }>, shipping: number, paymentMethod: PaymentMethod): Promise<Order> {
      return request('/orders', {
        method: 'POST',
        body: {
          customer: {
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
          },
          address: {
            line1: payload.address,
            city: payload.city,
            state: payload.county,
            postalCode: payload.postalCode,
            country: 'Romania',
          },
          items,
          shipping,
          notes: [
            `Metoda de plata: ${paymentMethod === 'card' ? 'card online' : 'ramburs la curier'}`,
            payload.notes,
          ].filter(Boolean).join('\n'),
        },
      });
    },
    async adminGetAll(
      token: string,
      params?: { page?: number; limit?: number; search?: string },
    ): Promise<PaginatedResponse<Order>> {
      const response = await request<PaginatedResponse<any>>(
        `/orders${createQueryString({
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
        })}`,
        { token },
      );
      return { ...response, items: response.items.map(normalizeOrder) };
    },
    async track(orderNumber: string, contact: string): Promise<Order> {
      const response = await request<any>('/orders/track', {
        method: 'POST',
        body: { orderNumber, contact },
      });
      return normalizeOrder(response);
    },
  },
};
