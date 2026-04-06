import {
  FormEvent,
  ReactNode,
  startTransition,
  useDeferredValue,
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
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { api } from '@/lib/api';
import {
  Brand,
  Category,
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
  const { session, isAuthenticated, login, logout } = useAdminAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [brandForm, setBrandForm] = useState<BrandFormState>(emptyBrandForm);
  const [promotionForm, setPromotionForm] = useState<PromotionFormState>(emptyPromotionForm);
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [promotionSearch, setPromotionSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  const deferredProductSearch = useDeferredValue(productSearch);
  const deferredCategorySearch = useDeferredValue(categorySearch);
  const deferredBrandSearch = useDeferredValue(brandSearch);
  const deferredPromotionSearch = useDeferredValue(promotionSearch);
  const deferredOrderSearch = useDeferredValue(orderSearch);

  const token = session?.accessToken ?? '';
  const currentUser = session?.user;

  const { data: productsData } = useQuery({ queryKey: ['admin', 'products'], queryFn: () => api.products.adminGetAll(token), enabled: isAuthenticated });
  const { data: categories = [] } = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => api.categories.adminGetAll(token), enabled: isAuthenticated });
  const { data: brands = [] } = useQuery({ queryKey: ['admin', 'brands'], queryFn: () => api.brands.adminGetAll(token), enabled: isAuthenticated });
  const { data: promotions = [] } = useQuery({ queryKey: ['admin', 'promotions'], queryFn: () => api.promotions.adminGetAll(token), enabled: isAuthenticated });
  const { data: orders = [] } = useQuery({ queryKey: ['admin', 'orders'], queryFn: () => api.orders.adminGetAll(token), enabled: isAuthenticated });

  const products = productsData?.items ?? [];
  const activePromotions = useMemo(() => promotions.filter((p) => p.active).length, [promotions]);

  /* ── filtering ── */
  const filteredProducts = useMemo(() => {
    const q = deferredProductSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => [p.name, p.sku, p.brand?.name, p.category?.name].filter(Boolean).some((v) => v!.toLowerCase().includes(q)));
  }, [deferredProductSearch, products]);

  const filteredCategories = useMemo(() => {
    const q = deferredCategorySearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => [c.name, c.slug].filter(Boolean).some((v) => v!.toLowerCase().includes(q)));
  }, [categories, deferredCategorySearch]);

  const filteredBrands = useMemo(() => {
    const q = deferredBrandSearch.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => [b.name, b.slug].filter(Boolean).some((v) => v!.toLowerCase().includes(q)));
  }, [brands, deferredBrandSearch]);

  const filteredPromotions = useMemo(() => {
    const q = deferredPromotionSearch.trim().toLowerCase();
    if (!q) return promotions;
    return promotions.filter((p) => [p.name, p.product?.name, p.category?.name].filter(Boolean).some((v) => v!.toLowerCase().includes(q)));
  }, [deferredPromotionSearch, promotions]);

  const filteredOrders = useMemo(() => {
    const q = deferredOrderSearch.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const c = getOrderCustomer(o);
      return [o.id, o.status, c.firstName, c.lastName, c.email].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [deferredOrderSearch, orders]);

  /* ── mutations ── */
  const loginMutation = useMutation({
    mutationFn: async () => login(email, password),
    onSuccess: () => toast.success('Autentificare reușită.'),
    onError: (error: Error) => toast.error(error.message),
  });

  const productMutation = useMutation({
    mutationFn: async () => {
      const payload = toProductPayload(productForm);
      return productForm.id ? api.products.update(token, productForm.id, payload) : api.products.create(token, payload);
    },
    onSuccess: async () => {
      toast.success(productForm.id ? 'Produs actualizat.' : 'Produs creat.');
      setProductForm(emptyProductForm);
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const categoryMutation = useMutation({
    mutationFn: async () => {
      const payload = toCategoryPayload(categoryForm);
      return categoryForm.id ? api.categories.update(token, categoryForm.id, payload) : api.categories.create(token, payload);
    },
    onSuccess: async () => {
      toast.success(categoryForm.id ? 'Categorie actualizată.' : 'Categorie creată.');
      setCategoryForm(emptyCategoryForm);
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const brandMutation = useMutation({
    mutationFn: async () => {
      const payload = toBrandPayload(brandForm);
      return brandForm.id ? api.brands.update(token, brandForm.id, payload) : api.brands.create(token, payload);
    },
    onSuccess: async () => {
      toast.success(brandForm.id ? 'Brand actualizat.' : 'Brand creat.');
      setBrandForm(emptyBrandForm);
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
    });
  };

  const editCategory = (category: Category) => {
    startTransition(() => {
      setActiveTab('categories');
      setCategoryForm({ id: category.id, name: category.name, slug: category.slug, description: category.description ?? '', image: category.image ?? '', parentId: category.parentId ?? '', active: category.active });
    });
  };

  const editBrand = (brand: Brand) => {
    startTransition(() => {
      setActiveTab('brands');
      setBrandForm({ id: brand.id, name: brand.name, slug: brand.slug, description: brand.description ?? '', logo: brand.logo ?? '', active: brand.active });
    });
  };

  const editPromotion = (promotion: Promotion) => {
    startTransition(() => {
      setActiveTab('promotions');
      setPromotionForm({ id: promotion.id, name: promotion.name, type: promotion.type, value: String(promotion.value), startDate: promotion.startDate.slice(0, 10), endDate: promotion.endDate.slice(0, 10), scope: promotion.scope, productId: promotion.productId ?? '', categoryId: promotion.categoryId ?? '', active: promotion.active });
    });
  };

  const submit = async (event: FormEvent, action: () => Promise<unknown>) => {
    event.preventDefault();
    try { await action(); } catch (error) { if (error instanceof SyntaxError) toast.error('Specificațiile nu sunt valide.'); }
  };

  /* ── image helpers ── */
  const addImageUrl = () => setProductForm({ ...productForm, imageUrls: [...productForm.imageUrls, ''] });
  const removeImageUrl = (index: number) => {
    const urls = productForm.imageUrls.filter((_, i) => i !== index);
    setProductForm({ ...productForm, imageUrls: urls.length > 0 ? urls : [''] });
  };
  const updateImageUrl = (index: number, value: string) => {
    const urls = [...productForm.imageUrls];
    urls[index] = value;
    setProductForm({ ...productForm, imageUrls: urls });
  };

  /* ════════════════════════════════════════
   *  LOGIN SCREEN
   * ════════════════════════════════════════ */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-12">
        <div className="w-full max-w-5xl grid overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left – branding */}
          <div className="relative overflow-hidden bg-gradient-dark p-8 md:p-12 text-primary-foreground flex flex-col justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,206,84,0.15),transparent_40%)]" />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.3em] text-accent">RaView Admin</p>
              <h1 className="mt-4 text-3xl font-display font-bold leading-tight md:text-4xl">
                Administrează-ți magazinul rapid și simplu.
              </h1>
              <p className="mt-4 text-sm leading-7 text-primary-foreground/70">
                Gestionează produse, categorii, promoții și comenzi dintr-un singur loc.
              </p>
            </div>
          </div>

          {/* Right – form */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-2xl font-display font-bold">Autentificare</h2>
            <p className="mt-2 text-sm text-muted-foreground">Intră cu contul tău de administrator.</p>

            <form onSubmit={(e) => submit(e, () => loginMutation.mutateAsync())} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" placeholder="email@exemplu.ro" />
              </div>
              <div>
                <Label htmlFor="admin-password">Parolă</Label>
                <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" placeholder="••••••••" />
              </div>
              <Button type="submit" className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Se autentifică...' : 'Intră în cont'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════
   *  DASHBOARD
   * ════════════════════════════════════════ */
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))]">
      {/* ── Fixed sidebar ── */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/70 bg-card">
        <div className="p-5 border-b border-border/70">
          <p className="font-display font-bold text-lg">Ra<span className="text-gradient-gold">View</span> Admin</p>
          <p className="mt-1 text-xs text-muted-foreground truncate">{currentUser?.email}</p>
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
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
        {/* Stats bar */}
        <div className="border-b border-border/70 bg-secondary/15 px-6 py-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Produse</p>
              <p className="mt-1 text-2xl font-display font-bold">{products.length}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Categorii</p>
              <p className="mt-1 text-2xl font-display font-bold">{categories.length}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Promoții active</p>
              <p className="mt-1 text-2xl font-display font-bold">{activePromotions}</p>
            </div>
            <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
              <p className="text-xs text-muted-foreground">Comenzi</p>
              <p className="mt-1 text-2xl font-display font-bold">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">

        {/* ═══════ PRODUCTS ═══════ */}
        {activeTab === 'products' && (
          <>
            <Card
              title={productForm.id ? 'Editează produs' : 'Produs nou'}
              actions={productForm.id ? <Button variant="ghost" size="sm" onClick={() => setProductForm(emptyProductForm)}>Resetează</Button> : null}
            >
              <form onSubmit={(e) => submit(e, () => productMutation.mutateAsync())} className="space-y-6">
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div><Label>Nume produs</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="mt-1.5" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Slug</Label><Input value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} className="mt-1.5" /></div>
                      <div><Label>SKU</Label><Input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} className="mt-1.5" /></div>
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
                          <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Brand</Label>
                        <Select value={productForm.brandId} onValueChange={(v) => setProductForm({ ...productForm, brandId: v })}>
                          <SelectTrigger className="mt-1.5"><SelectValue placeholder="Alege" /></SelectTrigger>
                          <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Multi-image upload */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Imagini produs</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addImageUrl} className="gap-1 text-xs">
                          <Plus className="h-3 w-3" /> Adaugă imagine
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {productForm.imageUrls.map((url, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={url}
                              onChange={(e) => updateImageUrl(index, e.target.value)}
                              placeholder={`URL imagine ${index + 1}`}
                              className="flex-1"
                            />
                            {url && (
                              <img src={url} alt="" className="h-9 w-9 rounded object-cover border border-border" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            )}
                            {productForm.imageUrls.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => removeImageUrl(index)}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div><Label>Specificații (JSON)</Label><Textarea value={productForm.specs} onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })} className="mt-1.5 min-h-28 font-mono text-xs" placeholder='{"material": "aluminiu"}' /></div>

                    <div className="grid grid-cols-2 gap-3 rounded-lg bg-secondary/35 p-3">
                      <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.featured} onCheckedChange={(c) => setProductForm({ ...productForm, featured: Boolean(c) })} /> Recomandat</label>
                      <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.bestseller} onCheckedChange={(c) => setProductForm({ ...productForm, bestseller: Boolean(c) })} /> Bestseller</label>
                      <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.isNew} onCheckedChange={(c) => setProductForm({ ...productForm, isNew: Boolean(c) })} /> Nou</label>
                      <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.active} onCheckedChange={(c) => setProductForm({ ...productForm, active: Boolean(c) })} /> Activ</label>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={productMutation.isPending}>
                  {productMutation.isPending ? 'Se salvează...' : productForm.id ? 'Actualizează' : 'Creează produsul'}
                </Button>
              </form>
            </Card>

            <Card title="Toate produsele" actions={<Button variant="outline" size="sm" onClick={() => setProductForm(emptyProductForm)}>Produs nou</Button>}>
              <SearchToolbar placeholder="Caută după nume, SKU, brand…" value={productSearch} onChange={setProductSearch} countLabel={`${filteredProducts.length} produse`} />
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
              </div>
            </Card>
          </>
        )}

        {/* ═══════ CATEGORIES ═══════ */}
        {activeTab === 'categories' && (
          <>
            <Card
              title={categoryForm.id ? 'Editează categorie' : 'Categorie nouă'}
              actions={categoryForm.id ? <Button variant="ghost" size="sm" onClick={() => setCategoryForm(emptyCategoryForm)}>Resetează</Button> : null}
            >
              <form onSubmit={(e) => submit(e, () => categoryMutation.mutateAsync())} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Nume</Label><Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Slug</Label><Input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Imagine URL</Label><Input value={categoryForm.image} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })} className="mt-1.5" /></div>
                  <div>
                    <Label>Categorie părinte</Label>
                    <Select value={categoryForm.parentId || 'none'} onValueChange={(v) => setCategoryForm({ ...categoryForm, parentId: v === 'none' ? '' : v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Fără părinte</SelectItem>
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Descriere</Label><Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="mt-1.5 min-h-24" /></div>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={categoryForm.active} onCheckedChange={(c) => setCategoryForm({ ...categoryForm, active: Boolean(c) })} /> Activă pe site</label>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={categoryMutation.isPending}>
                  {categoryMutation.isPending ? 'Se salvează...' : categoryForm.id ? 'Actualizează' : 'Creează categoria'}
                </Button>
              </form>
            </Card>

            <Card title="Toate categoriile">
              <SearchToolbar placeholder="Caută categorie…" value={categorySearch} onChange={setCategorySearch} countLabel={`${filteredCategories.length} categorii`} />
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
              </div>
            </Card>
          </>
        )}

        {/* ═══════ BRANDS ═══════ */}
        {activeTab === 'brands' && (
          <>
            <Card
              title={brandForm.id ? 'Editează brand' : 'Brand nou'}
              actions={brandForm.id ? <Button variant="ghost" size="sm" onClick={() => setBrandForm(emptyBrandForm)}>Resetează</Button> : null}
            >
              <form onSubmit={(e) => submit(e, () => brandMutation.mutateAsync())} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Nume</Label><Input value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Slug</Label><Input value={brandForm.slug} onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Logo URL</Label><Input value={brandForm.logo} onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })} className="mt-1.5" /></div>
                </div>
                <div><Label>Descriere</Label><Textarea value={brandForm.description} onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })} className="mt-1.5 min-h-24" /></div>
                <label className="flex items-center gap-2 text-sm"><Checkbox checked={brandForm.active} onCheckedChange={(c) => setBrandForm({ ...brandForm, active: Boolean(c) })} /> Activ pe site</label>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={brandMutation.isPending}>
                  {brandMutation.isPending ? 'Se salvează...' : brandForm.id ? 'Actualizează' : 'Creează brandul'}
                </Button>
              </form>
            </Card>

            <Card title="Toate brandurile">
              <SearchToolbar placeholder="Caută brand…" value={brandSearch} onChange={setBrandSearch} countLabel={`${filteredBrands.length} branduri`} />
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
            </Card>
          </>
        )}

        {/* ═══════ PROMOTIONS ═══════ */}
        {activeTab === 'promotions' && (
          <>
            <Card
              title={promotionForm.id ? 'Editează promoție' : 'Promoție nouă'}
              actions={promotionForm.id ? <Button variant="ghost" size="sm" onClick={() => setPromotionForm(emptyPromotionForm)}>Resetează</Button> : null}
            >
              <form onSubmit={(e) => submit(e, () => promotionMutation.mutateAsync())} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Nume</Label><Input value={promotionForm.name} onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })} className="mt-1.5" /></div>
                  <div><Label>Valoare</Label><Input type="number" value={promotionForm.value} onChange={(e) => setPromotionForm({ ...promotionForm, value: e.target.value })} className="mt-1.5" /></div>
                  <div>
                    <Label>Tip reducere</Label>
                    <Select value={promotionForm.type} onValueChange={(v: 'percentage' | 'fixed') => setPromotionForm({ ...promotionForm, type: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Procent (%)</SelectItem>
                        <SelectItem value="fixed">Sumă fixă (lei)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Se aplică pe</Label>
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
                      <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label>Categorie</Label>
                    <Select value={promotionForm.categoryId} onValueChange={(v) => setPromotionForm({ ...promotionForm, categoryId: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Alege categoria" /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm"><Checkbox checked={promotionForm.active} onCheckedChange={(c) => setPromotionForm({ ...promotionForm, active: Boolean(c) })} /> Promoție activă</label>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={promotionMutation.isPending}>
                  {promotionMutation.isPending ? 'Se salvează...' : promotionForm.id ? 'Actualizează' : 'Creează promoția'}
                </Button>
              </form>
            </Card>

            <Card title="Toate promoțiile">
              <SearchToolbar placeholder="Caută promoție…" value={promotionSearch} onChange={setPromotionSearch} countLabel={`${filteredPromotions.length} promoții`} />
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
            </Card>
          </>
        )}

        {/* ═══════ ORDERS ═══════ */}
        {activeTab === 'orders' && (
          <Card title="Comenzi">
            <SearchToolbar placeholder="Caută după client, email sau status…" value={orderSearch} onChange={setOrderSearch} countLabel={`${filteredOrders.length} comenzi`} />
            <div className="mt-4 space-y-2">
              {filteredOrders.map((order) => {
                const customer = getOrderCustomer(order);
                return (
                  <article key={order.id} className="flex flex-col gap-3 rounded-lg border border-border/70 bg-secondary/15 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-medium text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                        <StatusPill>{order.status}</StatusPill>
                        <StatusPill>{order.paymentStatus}</StatusPill>
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
            </div>
          </Card>
        )}

        </div>
      </main>
    </div>
  );
}
