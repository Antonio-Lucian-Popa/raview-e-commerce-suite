import {
  Bell,
  FormEvent,
  ReactNode,
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LayoutGrid,
  LogOut,
  Megaphone,
  Package2,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Tags,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { api } from '@/lib/api';
import {
  Brand,
  Category,
  AdminNotification,
  CreateBrandPayload,
  CreateCategoryPayload,
  CreateProductPayload,
  CreatePromotionPayload,
  Order,
  Product,
  Promotion,
} from '@/types';

type AdminTab = 'products' | 'categories' | 'brands' | 'promotions' | 'orders';

type ProductFormState = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  oldPrice: string;
  stock: string;
  categoryId: string;
  brandId: string;
  description: string;
  imageUrls: string[];
  specs: string;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  active: boolean;
};

type ProductImageDraft = {
  url: string;
  file: File | null;
  previewUrl: string;
};

type CategoryFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string;
  active: boolean;
};

type BrandFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  active: boolean;
};

type PromotionFormState = {
  id?: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: string;
  startDate: string;
  endDate: string;
  scope: 'product' | 'category';
  productId: string;
  categoryId: string;
  active: boolean;
};

const emptyProductForm: ProductFormState = {
  name: '',
  slug: '',
  sku: '',
  price: '',
  oldPrice: '',
  stock: '',
  categoryId: '',
  brandId: '',
  description: '',
  imageUrls: [''],
  specs: '',
  featured: false,
  bestseller: false,
  isNew: false,
  active: true,
};

const emptyProductImageDraft = (): ProductImageDraft => ({
  url: '',
  file: null,
  previewUrl: '',
});

const emptyCategoryForm: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  image: '',
  parentId: '',
  active: true,
};

const emptyBrandForm: BrandFormState = {
  name: '',
  slug: '',
  description: '',
  logo: '',
  active: true,
};

const today = new Date().toISOString().slice(0, 10);
const nextMonth = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);

const emptyPromotionForm: PromotionFormState = {
  name: '',
  type: 'percentage',
  value: '',
  startDate: today,
  endDate: nextMonth,
  scope: 'product',
  productId: '',
  categoryId: '',
  active: true,
};

const adminQueryKeys = [
  ['admin', 'products'],
  ['admin', 'categories'],
  ['admin', 'brands'],
  ['admin', 'promotions'],
  ['admin', 'orders'],
  ['products', 'featured'],
  ['categories', 'home'],
  ['categories', 'header'],
  ['categories', 'shop'],
  ['brands', 'shop'],
  ['promotions'],
] as const;

const invalidateAdminData = (queryClient: QueryClient) =>
  Promise.all(adminQueryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));

const toProductPayload = (form: ProductFormState): CreateProductPayload => ({
  name: form.name,
  slug: form.slug,
  sku: form.sku,
  price: Number(form.price),
  oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
  stock: Number(form.stock),
  categoryId: form.categoryId,
  brandId: form.brandId,
  description: form.description,
  specs: form.specs ? JSON.parse(form.specs) : undefined,
  featured: form.featured,
  bestseller: form.bestseller,
  isNew: form.isNew,
  active: form.active,
  images: form.imageUrls
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url, index) => ({ url, position: index })),
});

const toCategoryPayload = (form: CategoryFormState): CreateCategoryPayload => ({
  name: form.name,
  slug: form.slug,
  description: form.description || undefined,
  image: form.image || undefined,
  parentId: form.parentId || undefined,
  active: form.active,
});

const toBrandPayload = (form: BrandFormState): CreateBrandPayload => ({
  name: form.name,
  slug: form.slug,
  description: form.description || undefined,
  logo: form.logo || undefined,
  active: form.active,
});

const toPromotionPayload = (form: PromotionFormState): CreatePromotionPayload => ({
  name: form.name,
  type: form.type,
  value: Number(form.value),
  startDate: new Date(form.startDate).toISOString(),
  endDate: new Date(form.endDate).toISOString(),
  scope: form.scope,
  productId: form.scope === 'product' ? form.productId : undefined,
  categoryId: form.scope === 'category' ? form.categoryId : undefined,
  active: form.active,
});

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ro-RO');
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatOrderStatus(status?: string | null) {
  const labels: Record<string, string> = {
    pending: 'În așteptare',
    paid: 'Plătită',
    processing: 'În procesare',
    shipped: 'Trimisă',
    delivered: 'Livrată',
    cancelled: 'Anulată',
    refunded: 'Rambursată',
  };

  return labels[status ?? ''] ?? status ?? '—';
}

function formatPaymentStatus(status?: string | null) {
  const labels: Record<string, string> = {
    pending: 'Plata în așteptare',
    requires_action: 'Necesită confirmare',
    paid: 'Plătită',
    failed: 'Plata a eșuat',
    refunded: 'Rambursată',
  };

  return labels[status ?? ''] ?? status ?? '—';
}

function getOrderCustomer(order: Order) {
  return (
    order.customerSnapshot ??
    order.customer ?? {
      firstName: 'Client',
      lastName: '',
      email: '',
      phone: '',
    }
  );
}

/* ───────── small reusable pieces ───────── */

function StatusPill({ children, variant = 'secondary' }: { children: ReactNode; variant?: 'default' | 'secondary' | 'destructive' }) {
  return <Badge variant={variant} className="rounded-full px-2.5 py-0.5 text-[11px] font-medium">{children}</Badge>;
}

function EmptyBlock({ message }: { message: string }) {
  return <div className="rounded-xl border border-dashed border-border bg-secondary/20 px-6 py-10 text-center text-sm text-muted-foreground">{message}</div>;
}

function SearchToolbar({ placeholder, value, onChange, countLabel }: { placeholder: string; value: string; onChange: (v: string) => void; countLabel: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9" />
      </div>
      <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs">{countLabel}</Badge>
    </div>
  );
}

function Card({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border/70 bg-secondary/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Pagina {page} din {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrevious} disabled={page <= 1}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={page >= totalPages}>
          Următor
        </Button>
      </div>
    </div>
  );
}

/* ───────── sidebar nav items ───────── */

const sidebarItems: { key: AdminTab; label: string; icon: typeof Package2 }[] = [
  { key: 'products', label: 'Produse', icon: Package2 },
  { key: 'categories', label: 'Categorii', icon: LayoutGrid },
  { key: 'brands', label: 'Branduri', icon: Tags },
  { key: 'promotions', label: 'Promoții', icon: Megaphone },
  { key: 'orders', label: 'Comenzi', icon: ShoppingCart },
];

/* ───────── MAIN ───────── */

export default function AdminPage() {
  const { session, logout } = useAdminAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const pageSize = 10;
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [productImageDrafts, setProductImageDrafts] = useState<ProductImageDraft[]>([emptyProductImageDraft()]);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState('');
  const [brandForm, setBrandForm] = useState<BrandFormState>(emptyBrandForm);
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);
  const [brandLogoPreview, setBrandLogoPreview] = useState('');
  const [promotionForm, setPromotionForm] = useState<PromotionFormState>(emptyPromotionForm);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [promotionSearch, setPromotionSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [productsPage, setProductsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [brandsPage, setBrandsPage] = useState(1);
  const [promotionsPage, setPromotionsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);

  const deferredProductSearch = useDeferredValue(productSearch);
  const deferredCategorySearch = useDeferredValue(categorySearch);
  const deferredBrandSearch = useDeferredValue(brandSearch);
  const deferredPromotionSearch = useDeferredValue(promotionSearch);
  const deferredOrderSearch = useDeferredValue(orderSearch);

  const token = session?.accessToken ?? '';
  const currentUser = session?.user;
  const needsProducts = activeTab === 'products' || productDialogOpen || promotionDialogOpen;
  const needsCategories = activeTab === 'categories' || categoryDialogOpen || productDialogOpen || promotionDialogOpen;
  const needsBrands = activeTab === 'brands' || brandDialogOpen || productDialogOpen;
  const needsPromotions = activeTab === 'promotions' || promotionDialogOpen;
  const needsOrders = activeTab === 'orders';

  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products', productsPage, deferredProductSearch],
    queryFn: () => api.products.adminGetAll(token, { page: productsPage, limit: pageSize, search: deferredProductSearch || undefined }),
    enabled: Boolean(token) && needsProducts,
    placeholderData: (previousData) => previousData,
  });
  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'categories', categoriesPage, deferredCategorySearch],
    queryFn: () => api.categories.adminGetAll(token, { page: categoriesPage, limit: pageSize, search: deferredCategorySearch || undefined }),
    enabled: Boolean(token) && needsCategories,
    placeholderData: (previousData) => previousData,
  });
  const { data: brandsData } = useQuery({
    queryKey: ['admin', 'brands', brandsPage, deferredBrandSearch],
    queryFn: () => api.brands.adminGetAll(token, { page: brandsPage, limit: pageSize, search: deferredBrandSearch || undefined }),
    enabled: Boolean(token) && needsBrands,
    placeholderData: (previousData) => previousData,
  });
  const { data: categoriesLookup } = useQuery({
    queryKey: ['admin', 'categories', 'lookup'],
    queryFn: () => api.categories.adminGetAll(token, { page: 1, limit: 100 }),
    enabled: Boolean(token) && (categoryDialogOpen || productDialogOpen || promotionDialogOpen),
  });
  const { data: brandsLookup } = useQuery({
    queryKey: ['admin', 'brands', 'lookup'],
    queryFn: () => api.brands.adminGetAll(token, { page: 1, limit: 100 }),
    enabled: Boolean(token) && productDialogOpen,
  });
  const { data: productsLookup } = useQuery({
    queryKey: ['admin', 'products', 'lookup'],
    queryFn: () => api.products.adminGetAll(token, { page: 1, limit: 100 }),
    enabled: Boolean(token) && promotionDialogOpen,
  });
  const { data: promotionsData } = useQuery({
    queryKey: ['admin', 'promotions', promotionsPage, deferredPromotionSearch],
    queryFn: () => api.promotions.adminGetAll(token, { page: promotionsPage, limit: pageSize, search: deferredPromotionSearch || undefined }),
    enabled: Boolean(token) && needsPromotions,
    placeholderData: (previousData) => previousData,
  });
  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'orders', ordersPage, deferredOrderSearch],
    queryFn: () => api.orders.adminGetAll(token, { page: ordersPage, limit: pageSize, search: deferredOrderSearch || undefined }),
    enabled: Boolean(token) && needsOrders,
    placeholderData: (previousData) => previousData,
  });
  const { data: statsCategoriesData } = useQuery({
    queryKey: ['admin', 'stats', 'categories'],
    queryFn: () => api.categories.adminGetAll(token, { page: 1, limit: 1 }),
    enabled: Boolean(token),
    staleTime: 60_000,
  });
  const { data: statsPromotionsData } = useQuery({
    queryKey: ['admin', 'stats', 'promotions'],
    queryFn: () => api.promotions.adminGetAll(token, { page: 1, limit: 1 }),
    enabled: Boolean(token),
    staleTime: 60_000,
  });
  const { data: statsOrdersData } = useQuery({
    queryKey: ['admin', 'stats', 'orders'],
    queryFn: () => api.orders.adminGetAll(token, { page: 1, limit: 1 }),
    enabled: Boolean(token),
    staleTime: 60_000,
  });

  const products = productsData?.items ?? [];
  const categories = categoriesData?.items ?? [];
  const brands = brandsData?.items ?? [];
  const promotions = promotionsData?.items ?? [];
  const orders = ordersData?.items ?? [];
  const categoryOptions = categoriesLookup?.items ?? categories;
  const brandOptions = brandsLookup?.items ?? brands;
  const promotionProducts = productsLookup?.items ?? products;
  const productsTotalPages = Math.max(1, productsData?.meta.totalPages ?? 1);

  const openNewProduct = () => {
    setProductForm(emptyProductForm);
    setProductImageDrafts([emptyProductImageDraft()]);
    setProductDialogOpen(true);
  };
  const openNewCategory = () => {
    setCategoryForm(emptyCategoryForm);
    setCategoryImageFile(null);
    setCategoryImagePreview('');
    setCategoryDialogOpen(true);
  };
  const openNewBrand = () => {
    setBrandForm(emptyBrandForm);
    setBrandLogoFile(null);
    setBrandLogoPreview('');
    setBrandDialogOpen(true);
  };
  const openNewPromotion = () => {
    setPromotionForm(emptyPromotionForm);
    setPromotionDialogOpen(true);
  };

  const validateProductForm = () => {
    if (!productForm.name.trim()) return 'Numele produsului este obligatoriu.';
    if (!productForm.slug.trim()) return 'Numele din link este obligatoriu.';
    if (!productForm.sku.trim()) return 'Codul produsului este obligatoriu.';
    if (!productForm.categoryId) return 'Selectează o categorie pentru produs.';
    if (!productForm.brandId) return 'Selectează un brand pentru produs.';
    return null;
  };

  /* ── filtering ── */
  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  const filteredCategories = useMemo(() => categories, [categories]);
  const filteredBrands = useMemo(() => brands, [brands]);
  const filteredPromotions = useMemo(() => promotions, [promotions]);
  const filteredOrders = useMemo(() => orders, [orders]);

  const categoriesTotalPages = Math.max(1, categoriesData?.meta.totalPages ?? 1);
  const brandsTotalPages = Math.max(1, brandsData?.meta.totalPages ?? 1);
  const promotionsTotalPages = Math.max(1, promotionsData?.meta.totalPages ?? 1);
  const ordersTotalPages = Math.max(1, ordersData?.meta.totalPages ?? 1);

  useEffect(() => {
    setProductsPage(1);
  }, [deferredProductSearch]);

  useEffect(() => {
    setCategoriesPage(1);
  }, [deferredCategorySearch]);

  useEffect(() => {
    setBrandsPage(1);
  }, [deferredBrandSearch]);

  useEffect(() => {
    setPromotionsPage(1);
  }, [deferredPromotionSearch]);

  useEffect(() => {
    setOrdersPage(1);
  }, [deferredOrderSearch]);

  useEffect(() => {
    if (productsPage > productsTotalPages) setProductsPage(productsTotalPages);
  }, [productsPage, productsTotalPages]);

  useEffect(() => {
    if (categoriesPage > categoriesTotalPages) setCategoriesPage(categoriesTotalPages);
  }, [categoriesPage, categoriesTotalPages]);

  useEffect(() => {
    if (brandsPage > brandsTotalPages) setBrandsPage(brandsTotalPages);
  }, [brandsPage, brandsTotalPages]);

  useEffect(() => {
    if (promotionsPage > promotionsTotalPages) setPromotionsPage(promotionsTotalPages);
  }, [promotionsPage, promotionsTotalPages]);

  useEffect(() => {
    if (ordersPage > ordersTotalPages) setOrdersPage(ordersTotalPages);
  }, [ordersPage, ordersTotalPages]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return;
    }

    let isMounted = true;
    let eventSource: EventSource | null = null;

    const pushNotification = (notification: AdminNotification) => {
      setNotifications((current) => {
        const next = [notification, ...current.filter((entry) => entry.id !== notification.id)];
        return next.slice(0, 20);
      });

      toast(notification.title, {
        description: notification.message,
      });

      if (notification.section === 'orders') {
        void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
        void queryClient.invalidateQueries({ queryKey: ['admin', 'stats', 'orders'] });
        void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      }

      if (notification.section === 'products') {
        void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      }
    };

    void api.notifications
      .getRecent(token)
      .then((items) => {
        if (!isMounted) return;
        setNotifications(items);
      })
      .catch(() => {
        if (!isMounted) return;
        setNotifications([]);
      });

    eventSource = new EventSource(api.notifications.getStreamUrl(token));
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as Partial<AdminNotification> & { type?: string };
        if (!payload || payload.type === 'connected' || !payload.id) {
          return;
        }
        pushNotification(payload as AdminNotification);
      } catch {
        // Ignore malformed SSE payloads.
      }
    };
    eventSource.onerror = () => {
      eventSource?.close();
    };

    return () => {
      isMounted = false;
      eventSource?.close();
    };
  }, [token, queryClient]);

  /* ── mutations ── */
  const productMutation = useMutation({
    mutationFn: async () => {
      const validationMessage = validateProductForm();
      if (validationMessage) {
        throw new Error(validationMessage);
      }
      const basePayload = toProductPayload({ ...productForm, imageUrls: [] });

      if (!productForm.id) {
        const createdProduct = await api.products.create(token, basePayload);
        const resolvedImageUrls = await Promise.all(
          productImageDrafts.map(async (draft) => (draft.file ? api.uploads.uploadImage(token, draft.file, 'products') : draft.url.trim())),
        );
        const finalImages = resolvedImageUrls
          .filter(Boolean)
          .map((url, index) => ({ url, position: index }));

        if (finalImages.length > 0) {
          return api.products.update(token, createdProduct.id, { images: finalImages });
        }

        return createdProduct;
      }

      const updatedProduct = await api.products.update(token, productForm.id, basePayload);
      const resolvedImageUrls = await Promise.all(
        productImageDrafts.map(async (draft) => (draft.file ? api.uploads.uploadImage(token, draft.file, 'products') : draft.url.trim())),
      );
      const finalImages = resolvedImageUrls
        .filter(Boolean)
        .map((url, index) => ({ url, position: index }));

      if (finalImages.length > 0 || productImageDrafts.some((draft) => draft.url)) {
        return api.products.update(token, productForm.id, { images: finalImages });
      }

      return updatedProduct;
    },
    onSuccess: async () => {
      toast.success(productForm.id ? 'Produs actualizat.' : 'Produs creat.');
      setProductForm(emptyProductForm);
      setProductImageDrafts([emptyProductImageDraft()]);
      setProductDialogOpen(false);
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const categoryMutation = useMutation({
    mutationFn: async () => {
      const basePayload = toCategoryPayload({
        ...categoryForm,
        image: categoryImageFile ? '' : categoryForm.image,
      });

      if (!categoryForm.id) {
        const createdCategory = await api.categories.create(token, basePayload);
        if (categoryImageFile) {
          const image = await api.uploads.uploadImage(token, categoryImageFile, 'categories');
          return api.categories.update(token, createdCategory.id, { image });
        }
        return createdCategory;
      }

      const updatedCategory = await api.categories.update(token, categoryForm.id, basePayload);
      if (categoryImageFile) {
        const image = await api.uploads.uploadImage(token, categoryImageFile, 'categories');
        return api.categories.update(token, categoryForm.id, { image });
      }
      return updatedCategory;
    },
    onSuccess: async () => {
      toast.success(categoryForm.id ? 'Categorie actualizată.' : 'Categorie creată.');
      setCategoryForm(emptyCategoryForm);
      setCategoryImageFile(null);
      setCategoryImagePreview('');
      setCategoryDialogOpen(false);
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const brandMutation = useMutation({
    mutationFn: async () => {
      const basePayload = toBrandPayload({
        ...brandForm,
        logo: brandLogoFile ? '' : brandForm.logo,
      });

      if (!brandForm.id) {
        const createdBrand = await api.brands.create(token, basePayload);
        if (brandLogoFile) {
          const logo = await api.uploads.uploadImage(token, brandLogoFile, 'brands');
          return api.brands.update(token, createdBrand.id, { logo });
        }
        return createdBrand;
      }

      const updatedBrand = await api.brands.update(token, brandForm.id, basePayload);
      if (brandLogoFile) {
        const logo = await api.uploads.uploadImage(token, brandLogoFile, 'brands');
        return api.brands.update(token, brandForm.id, { logo });
      }
      return updatedBrand;
    },
    onSuccess: async () => {
      toast.success(brandForm.id ? 'Brand actualizat.' : 'Brand creat.');
      setBrandForm(emptyBrandForm);
      setBrandLogoFile(null);
      setBrandLogoPreview('');
      setBrandDialogOpen(false);
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const promotionMutation = useMutation({
    mutationFn: async () => {
      const payload = toPromotionPayload(promotionForm);
      return promotionForm.id ? api.promotions.update(token, promotionForm.id, payload) : api.promotions.create(token, payload);
    },
    onSuccess: async () => {
      toast.success(promotionForm.id ? 'Promoție actualizată.' : 'Promoție creată.');
      setPromotionForm(emptyPromotionForm);
      setPromotionDialogOpen(false);
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteProductMutation = useMutation({ mutationFn: (id: string) => api.products.remove(token, id), onSuccess: async () => { toast.success('Produs șters.'); await invalidateAdminData(queryClient); }, onError: (e: Error) => toast.error(e.message) });
  const deleteCategoryMutation = useMutation({ mutationFn: (id: string) => api.categories.remove(token, id), onSuccess: async () => { toast.success('Categorie ștearsă.'); await invalidateAdminData(queryClient); }, onError: (e: Error) => toast.error(e.message) });
  const deleteBrandMutation = useMutation({ mutationFn: (id: string) => api.brands.remove(token, id), onSuccess: async () => { toast.success('Brand șters.'); await invalidateAdminData(queryClient); }, onError: (e: Error) => toast.error(e.message) });
  const deletePromotionMutation = useMutation({ mutationFn: (id: string) => api.promotions.remove(token, id), onSuccess: async () => { toast.success('Promoție ștearsă.'); await invalidateAdminData(queryClient); }, onError: (e: Error) => toast.error(e.message) });

  /* ── edit helpers ── */
  const editProduct = (product: Product) => {
    startTransition(() => {
      setActiveTab('products');
      setProductForm({
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: String(product.price),
        oldPrice: product.oldPrice ? String(product.oldPrice) : '',
        stock: String(product.stock),
        categoryId: product.categoryId,
        brandId: product.brandId,
        description: product.description ?? '',
        imageUrls: product.images.length > 0 ? product.images.map((img) => img.url) : [''],
        specs: product.specs ? JSON.stringify(product.specs, null, 2) : '',
        featured: product.featured,
        bestseller: product.bestseller,
        isNew: product.isNew,
        active: product.active,
      });
      setProductImageDrafts(
        product.images.length > 0
          ? product.images.map((img) => ({
              url: img.url,
              file: null,
              previewUrl: img.url,
            }))
          : [emptyProductImageDraft()],
      );
      setProductDialogOpen(true);
    });
  };

  const editCategory = (category: Category) => {
    startTransition(() => {
      setActiveTab('categories');
      setCategoryForm({ id: category.id, name: category.name, slug: category.slug, description: category.description ?? '', image: category.image ?? '', parentId: category.parentId ?? '', active: category.active });
      setCategoryImageFile(null);
      setCategoryImagePreview(category.image ?? '');
      setCategoryDialogOpen(true);
    });
  };

  const editBrand = (brand: Brand) => {
    startTransition(() => {
      setActiveTab('brands');
      setBrandForm({ id: brand.id, name: brand.name, slug: brand.slug, description: brand.description ?? '', logo: brand.logo ?? '', active: brand.active });
      setBrandLogoFile(null);
      setBrandLogoPreview(brand.logo ?? '');
      setBrandDialogOpen(true);
    });
  };

  const editPromotion = (promotion: Promotion) => {
    startTransition(() => {
      setActiveTab('promotions');
      setPromotionForm({ id: promotion.id, name: promotion.name, type: promotion.type, value: String(promotion.value), startDate: promotion.startDate.slice(0, 10), endDate: promotion.endDate.slice(0, 10), scope: promotion.scope, productId: promotion.productId ?? '', categoryId: promotion.categoryId ?? '', active: promotion.active });
      setPromotionDialogOpen(true);
    });
  };

  const submit = async (event: FormEvent, action: () => Promise<unknown>) => {
    event.preventDefault();
    try { await action(); } catch (error) { if (error instanceof SyntaxError) toast.error('Specificațiile nu sunt valide.'); }
  };

  /* ── image helpers ── */
  const addImageUrl = () => {
    setProductForm((current) => ({ ...current, imageUrls: [...current.imageUrls, ''] }));
    setProductImageDrafts((current) => [...current, emptyProductImageDraft()]);
  };
  const removeImageUrl = (index: number) => {
    const urls = productForm.imageUrls.filter((_, i) => i !== index);
    setProductForm({ ...productForm, imageUrls: urls.length > 0 ? urls : [''] });
    setProductImageDrafts((current) => {
      const next = current.filter((_, i) => i !== index);
      return next.length > 0 ? next : [emptyProductImageDraft()];
    });
  };
  const updateImageUrl = (index: number, value: string) => {
    const urls = [...productForm.imageUrls];
    urls[index] = value;
    setProductForm({ ...productForm, imageUrls: urls });
    setProductImageDrafts((current) => {
      const next = [...current];
      next[index] = {
        url: value,
        file: next[index]?.file ?? null,
        previewUrl: next[index]?.previewUrl || value,
      };
      return next;
    });
  };
  const updateProductImageFile = (index: number, file?: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setProductImageDrafts((current) => {
      const next = [...current];
      next[index] = {
        url: next[index]?.url ?? '',
        file,
        previewUrl,
      };
      return next;
    });
  };
  const updateCategoryImageFile = (file?: File | null) => {
    if (!file) return;
    setCategoryImageFile(file);
    setCategoryImagePreview(URL.createObjectURL(file));
  };
  const updateBrandLogoFile = (file?: File | null) => {
    if (!file) return;
    setBrandLogoFile(file);
    setBrandLogoPreview(URL.createObjectURL(file));
  };

  const openNotificationTarget = (notification: AdminNotification) => {
    setNotificationsOpen(false);
    setActiveTab(notification.section);
  };

  /* ════════════════════════════════════════
   *  DASHBOARD
   * ════════════════════════════════════════ */
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))]">
      {/* ── Fixed sidebar ── */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/70 bg-card">
        <div className="border-b border-border/70 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display font-bold text-lg">Ra<span className="text-gradient-gold">View</span> Admin</p>
              <p className="mt-1 text-xs text-muted-foreground truncate">{currentUser?.email}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="relative shrink-0"
              onClick={() => setNotificationsOpen(true)}
              aria-label="Notificări"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {Math.min(notifications.length, 9)}
                </span>
              )}
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/70">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => logout()}>
            <LogOut className="h-4 w-4" /> Deconectare
          </Button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-border/70 bg-card px-4 py-3 lg:hidden">
        <div>
          <p className="font-display text-lg font-bold">
            Ra<span className="text-gradient-gold">View</span> Admin
          </p>
          <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-muted-foreground" onClick={() => setNotificationsOpen(true)} aria-label="Notificări">
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                {Math.min(notifications.length, 9)}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => logout()}>
            <LogOut className="h-4 w-4" /> Ieșire
          </Button>
        </div>
      </div>

      {/* ── Mobile tab bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden border-t border-border bg-card">
        {sidebarItems.map((item) => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto pb-20 pt-[72px] lg:pb-8 lg:pt-0">
        {/* Stats bar */}
        <div className="hidden border-b border-border/70 bg-secondary/15 px-6 py-4 lg:block">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Produse</p>
              <p className="mt-1 text-2xl font-display font-bold">{productsData?.meta.total ?? '—'}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Categorii</p>
              <p className="mt-1 text-2xl font-display font-bold">{categoriesData?.meta.total ?? statsCategoriesData?.meta.total ?? '—'}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Promoții</p>
              <p className="mt-1 text-2xl font-display font-bold">{promotionsData?.meta.total ?? statsPromotionsData?.meta.total ?? '—'}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Comenzi</p>
              <p className="mt-1 text-2xl font-display font-bold">{ordersData?.meta.total ?? statsOrdersData?.meta.total ?? '—'}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">

        {/* ═══════ PRODUCTS ═══════ */}
        {activeTab === 'products' && (
          <>
            <Card title="Toate produsele" actions={<Button variant="outline" size="sm" onClick={openNewProduct}>Produs nou</Button>}>
              <SearchToolbar placeholder="Caută după nume, cod produs sau brand…" value={productSearch} onChange={setProductSearch} countLabel={`${productsData?.meta.total ?? 0} produse`} />
            <div className="mt-4 space-y-2">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="flex flex-col gap-3 rounded-lg border border-border/70 bg-secondary/15 p-3 sm:flex-row sm:items-center">
                    <img src={product.images[0]?.url || '/placeholder.svg'} alt={product.name} className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-medium text-sm">{product.name}</p>
                        {product.featured && <StatusPill>recomandat</StatusPill>}
                        {!product.active && <StatusPill variant="destructive">inactiv</StatusPill>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{product.brand?.name} · {product.category?.name} · {product.price} lei · stoc {product.stock}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => editProduct(product)}>Editează</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteProductMutation.mutate(product.id)}>Șterge</Button>
                    </div>
                  </article>
                ))}
                {filteredProducts.length === 0 && <EmptyBlock message="Nu s-au găsit produse." />}
                <PaginationControls
                  page={productsPage}
                  totalPages={productsTotalPages}
                  onPrevious={() => setProductsPage((page) => Math.max(1, page - 1))}
                  onNext={() => setProductsPage((page) => Math.min(productsTotalPages, page + 1))}
                />
              </div>
            </Card>
          </>
        )}

        {/* ═══════ CATEGORIES ═══════ */}
        {activeTab === 'categories' && (
          <>
            <Card title="Toate categoriile" actions={<Button variant="outline" size="sm" onClick={openNewCategory}>Categorie nouă</Button>}>
              <SearchToolbar placeholder="Caută categorie…" value={categorySearch} onChange={setCategorySearch} countLabel={`${categoriesData?.meta.total ?? 0} categorii`} />
            <div className="mt-4 space-y-2">
                {filteredCategories.map((cat) => (
                  <article key={cat.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-secondary/15 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"><LayoutGrid className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-sm">{cat.name}</p>
                        {!cat.active && <StatusPill variant="destructive">inactivă</StatusPill>}
                      </div>
                      <p className="text-xs text-muted-foreground">{cat.parent?.name ? `Sub: ${cat.parent.name}` : 'Principală'}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => editCategory(cat)}>Editează</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteCategoryMutation.mutate(cat.id)}>Șterge</Button>
                    </div>
                  </article>
                ))}
                {filteredCategories.length === 0 && <EmptyBlock message="Nu s-au găsit categorii." />}
                <PaginationControls
                  page={categoriesPage}
                  totalPages={categoriesTotalPages}
                  onPrevious={() => setCategoriesPage((page) => Math.max(1, page - 1))}
                  onNext={() => setCategoriesPage((page) => Math.min(categoriesTotalPages, page + 1))}
                />
              </div>
            </Card>
          </>
        )}

        {/* ═══════ BRANDS ═══════ */}
        {activeTab === 'brands' && (
          <>
            <Card title="Toate brandurile" actions={<Button variant="outline" size="sm" onClick={openNewBrand}>Brand nou</Button>}>
              <SearchToolbar placeholder="Caută brand…" value={brandSearch} onChange={setBrandSearch} countLabel={`${brandsData?.meta.total ?? 0} branduri`} />
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {filteredBrands.map((brand) => (
                  <article key={brand.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-secondary/15 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"><Tags className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-sm">{brand.name}</p>
                        {!brand.active && <StatusPill variant="destructive">inactiv</StatusPill>}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => editBrand(brand)}>Editează</Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteBrandMutation.mutate(brand.id)}>Șterge</Button>
                    </div>
                  </article>
                ))}
                {filteredBrands.length === 0 && <EmptyBlock message="Nu s-au găsit branduri." />}
              </div>
              <PaginationControls
                page={brandsPage}
                totalPages={brandsTotalPages}
                onPrevious={() => setBrandsPage((page) => Math.max(1, page - 1))}
                onNext={() => setBrandsPage((page) => Math.min(brandsTotalPages, page + 1))}
              />
            </Card>
          </>
        )}

        {/* ═══════ PROMOTIONS ═══════ */}
        {activeTab === 'promotions' && (
          <>
            <Card title="Toate promoțiile" actions={<Button variant="outline" size="sm" onClick={openNewPromotion}>Promoție nouă</Button>}>
              <SearchToolbar placeholder="Caută promoție…" value={promotionSearch} onChange={setPromotionSearch} countLabel={`${promotionsData?.meta.total ?? 0} promoții`} />
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {filteredPromotions.map((promo) => (
                  <article key={promo.id} className="rounded-lg border border-border/70 bg-secondary/15 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-sm">{promo.name}</p>
                          {!promo.active && <StatusPill variant="destructive">inactivă</StatusPill>}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {promo.type === 'percentage' ? `${promo.value}%` : `${promo.value} lei`} · {promo.scope === 'product' ? promo.product?.name : promo.category?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(promo.startDate)} – {formatDate(promo.endDate)}</p>
                      </div>
                      <Sparkles className="h-4 w-4 text-accent shrink-0" />
                    </div>
                    <div className="mt-3 flex gap-1.5">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => editPromotion(promo)}>Editează</Button>
                      <Button variant="destructive" size="sm" className="flex-1" onClick={() => deletePromotionMutation.mutate(promo.id)}>Șterge</Button>
                    </div>
                  </article>
                ))}
                {filteredPromotions.length === 0 && <EmptyBlock message="Nu s-au găsit promoții." />}
              </div>
              <PaginationControls
                page={promotionsPage}
                totalPages={promotionsTotalPages}
                onPrevious={() => setPromotionsPage((page) => Math.max(1, page - 1))}
                onNext={() => setPromotionsPage((page) => Math.min(promotionsTotalPages, page + 1))}
              />
            </Card>
          </>
        )}

        {/* ═══════ ORDERS ═══════ */}
        {activeTab === 'orders' && (
            <Card title="Comenzi">
              <SearchToolbar placeholder="Caută după client, email sau stare comandă…" value={orderSearch} onChange={setOrderSearch} countLabel={`${ordersData?.meta.total ?? 0} comenzi`} />
              <div className="mt-4 space-y-2">
              {filteredOrders.map((order) => {
                const customer = getOrderCustomer(order);
                return (
                  <article key={order.id} className="flex flex-col gap-3 rounded-lg border border-border/70 bg-secondary/15 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-medium text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                        <StatusPill>{formatOrderStatus(order.status)}</StatusPill>
                        <StatusPill>{formatPaymentStatus(order.paymentStatus)}</StatusPill>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{customer.firstName} {customer.lastName} · {customer.email}</p>
                      {order.addressSnapshot && <p className="text-xs text-muted-foreground">{order.addressSnapshot.line1}, {order.addressSnapshot.city}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-sm">{order.total} lei</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                  </article>
                );
              })}
              {filteredOrders.length === 0 && <EmptyBlock message="Nu s-au găsit comenzi." />}
              <PaginationControls
                page={ordersPage}
                totalPages={ordersTotalPages}
                onPrevious={() => setOrdersPage((page) => Math.max(1, page - 1))}
                onNext={() => setOrdersPage((page) => Math.min(ordersTotalPages, page + 1))}
              />
            </div>
          </Card>
        )}

        <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Notificări</DialogTitle>
              <DialogDescription>Vezi rapid ce s-a întâmplat recent în magazin.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => openNotificationTarget(notification)}
                  className="w-full rounded-xl border border-border/70 bg-secondary/20 p-4 text-left transition-colors hover:bg-secondary/35"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <StatusPill>{notification.section === 'orders' ? 'Comenzi' : 'Produse'}</StatusPill>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
                </button>
              ))}
              {notifications.length === 0 && <EmptyBlock message="Nu există notificări noi momentan." />}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{productForm.id ? 'Editează produs' : 'Produs nou'}</DialogTitle>
              <DialogDescription>Completează datele produsului fără să aglomerezi pagina principală.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => submit(e, () => productMutation.mutateAsync())} className="space-y-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-4">
                  <div><Label>Nume produs</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="mt-1.5" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Nume în link</Label><Input value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} className="mt-1.5" /></div>
                    <div><Label>Cod produs</Label><Input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} className="mt-1.5" /></div>
                  </div>
                  <div><Label>Descriere</Label><Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="mt-1.5 min-h-28" /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Preț (lei)</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="mt-1.5" /></div>
                    <div><Label>Preț vechi</Label><Input type="number" value={productForm.oldPrice} onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })} className="mt-1.5" /></div>
                    <div><Label>Stoc</Label><Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="mt-1.5" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Categorie</Label>
                      <Select value={productForm.categoryId} onValueChange={(v) => setProductForm({ ...productForm, categoryId: v })}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Alege" /></SelectTrigger>
                        <SelectContent>{categoryOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Brand</Label>
                      <Select value={productForm.brandId} onValueChange={(v) => setProductForm({ ...productForm, brandId: v })}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Alege" /></SelectTrigger>
                        <SelectContent>{brandOptions.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Imagini produs</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={addImageUrl} className="gap-1 text-xs">
                        <Plus className="h-3 w-3" /> Adaugă imagine
                      </Button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {productImageDrafts.map((draft, index) => (
                        <div key={index} className="rounded-lg border border-border/70 bg-background p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-2">
                              <Label className="text-xs text-muted-foreground">Imagine {index + 1}</Label>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => updateProductImageFile(index, e.target.files?.[0])}
                              />
                              <p className="text-xs text-muted-foreground">
                                {draft.file
                                  ? 'Fișier selectat. Se va încărca la salvarea produsului.'
                                  : draft.url
                                    ? 'Imagine deja salvată pentru acest produs.'
                                    : 'Selectează un fișier imagine.'}
                              </p>
                            </div>
                            {productForm.imageUrls.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => removeImageUrl(index)}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          {draft.previewUrl && (
                            <div className="mt-3 overflow-hidden rounded-lg border border-border/70">
                              <img src={draft.previewUrl} alt="" className="h-28 w-full object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div><Label>Detalii produs</Label><Textarea value={productForm.specs} onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })} className="mt-1.5 min-h-28 font-mono text-xs" placeholder='{"material": "aluminiu"}' /></div>

                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-secondary/35 p-3">
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.featured} onCheckedChange={(c) => setProductForm({ ...productForm, featured: Boolean(c) })} /> Recomandat</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.bestseller} onCheckedChange={(c) => setProductForm({ ...productForm, bestseller: Boolean(c) })} /> Bestseller</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.isNew} onCheckedChange={(c) => setProductForm({ ...productForm, isNew: Boolean(c) })} /> Nou</label>
                    <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.active} onCheckedChange={(c) => setProductForm({ ...productForm, active: Boolean(c) })} /> Activ</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={productMutation.isPending}>
                  {productMutation.isPending ? 'Se salvează...' : productForm.id ? 'Actualizează' : 'Creează produsul'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{categoryForm.id ? 'Editează categorie' : 'Categorie nouă'}</DialogTitle>
              <DialogDescription>Adaugă sau actualizează o categorie fără să ocupe spațiu în pagină.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => submit(e, () => categoryMutation.mutateAsync())} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Nume</Label><Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="mt-1.5" /></div>
                <div><Label>Nume în link</Label><Input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} className="mt-1.5" /></div>
                <div className="space-y-2">
                  <Label>Imagine categorie</Label>
                  <Input type="file" accept="image/*" onChange={(e) => updateCategoryImageFile(e.target.files?.[0])} className="mt-1.5" />
                  <p className="text-xs text-muted-foreground">{categoryImageFile ? 'Fișier selectat. Se va încărca la salvarea categoriei.' : 'Încarcă o imagine din calculator.'}</p>
                  {categoryImagePreview && (
                    <div className="overflow-hidden rounded-lg border border-border/70">
                      <img src={categoryImagePreview} alt={categoryForm.name || 'Categorie'} className="h-24 w-full object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <Label>Categorie principală</Label>
                  <Select value={categoryForm.parentId || 'none'} onValueChange={(v) => setCategoryForm({ ...categoryForm, parentId: v === 'none' ? '' : v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                      <SelectItem value="none">Fără părinte</SelectItem>
                      {categoryOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Descriere</Label><Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="mt-1.5 min-h-24" /></div>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={categoryForm.active} onCheckedChange={(c) => setCategoryForm({ ...categoryForm, active: Boolean(c) })} /> Activă pe site</label>
              <div className="flex justify-end">
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={categoryMutation.isPending}>
                  {categoryMutation.isPending ? 'Se salvează...' : categoryForm.id ? 'Actualizează' : 'Creează categoria'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{brandForm.id ? 'Editează brand' : 'Brand nou'}</DialogTitle>
              <DialogDescription>Editează brandurile într-o fereastră separată, mai simplă de folosit.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => submit(e, () => brandMutation.mutateAsync())} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Nume</Label><Input value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} className="mt-1.5" /></div>
                <div><Label>Nume în link</Label><Input value={brandForm.slug} onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })} className="mt-1.5" /></div>
                <div className="space-y-2">
                  <Label>Siglă brand</Label>
                  <Input type="file" accept="image/*" onChange={(e) => updateBrandLogoFile(e.target.files?.[0])} className="mt-1.5" />
                  <p className="text-xs text-muted-foreground">{brandLogoFile ? 'Fișier selectat. Se va încărca la salvarea brandului.' : 'Încarcă logo-ul din calculator.'}</p>
                  {brandLogoPreview && (
                    <div className="overflow-hidden rounded-lg border border-border/70 bg-background p-3">
                      <img src={brandLogoPreview} alt={brandForm.name || 'Brand'} className="h-16 w-auto max-w-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
              <div><Label>Descriere</Label><Textarea value={brandForm.description} onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })} className="mt-1.5 min-h-24" /></div>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={brandForm.active} onCheckedChange={(c) => setBrandForm({ ...brandForm, active: Boolean(c) })} /> Activ pe site</label>
              <div className="flex justify-end">
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={brandMutation.isPending}>
                  {brandMutation.isPending ? 'Se salvează...' : brandForm.id ? 'Actualizează' : 'Creează brandul'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={promotionDialogOpen} onOpenChange={setPromotionDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{promotionForm.id ? 'Editează promoție' : 'Promoție nouă'}</DialogTitle>
              <DialogDescription>Configurează o campanie nouă fără să aglomerezi pagina de administrare.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => submit(e, () => promotionMutation.mutateAsync())} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Nume</Label><Input value={promotionForm.name} onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })} className="mt-1.5" /></div>
                <div><Label>Valoare</Label><Input type="number" value={promotionForm.value} onChange={(e) => setPromotionForm({ ...promotionForm, value: e.target.value })} className="mt-1.5" /></div>
                <div>
                  <Label>Reducere</Label>
                  <Select value={promotionForm.type} onValueChange={(v: 'percentage' | 'fixed') => setPromotionForm({ ...promotionForm, type: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Procent (%)</SelectItem>
                      <SelectItem value="fixed">Sumă fixă (lei)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unde se aplică</Label>
                  <Select value={promotionForm.scope} onValueChange={(v: 'product' | 'category') => setPromotionForm({ ...promotionForm, scope: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Un produs</SelectItem>
                      <SelectItem value="category">O categorie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Început</Label><Input type="date" value={promotionForm.startDate} onChange={(e) => setPromotionForm({ ...promotionForm, startDate: e.target.value })} className="mt-1.5" /></div>
                <div><Label>Sfârșit</Label><Input type="date" value={promotionForm.endDate} onChange={(e) => setPromotionForm({ ...promotionForm, endDate: e.target.value })} className="mt-1.5" /></div>
              </div>

              {promotionForm.scope === 'product' ? (
                <div>
                  <Label>Produs</Label>
                    <Select value={promotionForm.productId} onValueChange={(v) => setPromotionForm({ ...promotionForm, productId: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Alege produsul" /></SelectTrigger>
                      <SelectContent>{promotionProducts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
              ) : (
                <div>
                  <Label>Categorie</Label>
                  <Select value={promotionForm.categoryId} onValueChange={(v) => setPromotionForm({ ...promotionForm, categoryId: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Alege categoria" /></SelectTrigger>
                    <SelectContent>{categoryOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm"><Checkbox checked={promotionForm.active} onCheckedChange={(c) => setPromotionForm({ ...promotionForm, active: Boolean(c) })} /> Promoție activă</label>
              <div className="flex justify-end">
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={promotionMutation.isPending}>
                  {promotionMutation.isPending ? 'Se salvează...' : promotionForm.id ? 'Actualizează' : 'Creează promoția'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        </div>
      </main>
    </div>
  );
}
