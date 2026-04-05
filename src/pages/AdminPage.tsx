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
  Boxes,
  LayoutGrid,
  Megaphone,
  Package2,
  Search,
  ShoppingCart,
  Sparkles,
  Tags,
  UserCog,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/Breadcrumbs';
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
  imageUrls: string;
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
  imageUrls: '',
  specs: '{\n  "material": "aluminiu"\n}',
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
    .split('\n')
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

function DashboardStat({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: typeof Package2;
}) {
  return (
    <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-card to-secondary/35 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-display font-bold">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-border/70 bg-gradient-to-b from-card to-secondary/25 p-6 shadow-sm xl:sticky xl:top-24">
        <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-display font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
      </aside>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function Surface({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/70 bg-secondary/25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function SearchToolbar({
  placeholder,
  value,
  onChange,
  countLabel,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  countLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pl-9" />
      </div>
      <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs">
        {countLabel}
      </Badge>
    </div>
  );
}

function SidebarItem({
  label,
  description,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  description: string;
  icon: typeof Package2;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
        active
          ? 'border-accent/40 bg-accent/10 shadow-sm'
          : 'border-transparent bg-transparent hover:border-border/70 hover:bg-secondary/35'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-medium">{label}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

function StatusPill({
  children,
  variant = 'secondary',
}: {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive';
}) {
  return (
    <Badge variant={variant} className="rounded-full px-2.5 py-1 text-[11px] font-medium">
      {children}
    </Badge>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-secondary/20 px-6 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return 'Nesetat';
  return new Date(value).toLocaleDateString('ro-RO');
}

function getOrderCustomer(order: Order) {
  return (
    order.customerSnapshot ??
    order.customer ?? {
      firstName: 'Client',
      lastName: '',
      email: 'fara@email',
      phone: '',
    }
  );
}

export default function AdminPage() {
  const { session, isAuthenticated, login, logout } = useAdminAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [email, setEmail] = useState('admin@lighting.local');
  const [password, setPassword] = useState('Admin1234!');
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

  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => api.products.adminGetAll(token),
    enabled: isAuthenticated,
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.categories.adminGetAll(token),
    enabled: isAuthenticated,
  });
  const { data: brands = [] } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: () => api.brands.adminGetAll(token),
    enabled: isAuthenticated,
  });
  const { data: promotions = [] } = useQuery({
    queryKey: ['admin', 'promotions'],
    queryFn: () => api.promotions.adminGetAll(token),
    enabled: isAuthenticated,
  });
  const { data: orders = [] } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: () => api.orders.adminGetAll(token),
    enabled: isAuthenticated,
  });

  const products = productsData?.items ?? [];
  const activePromotions = useMemo(
    () => promotions.filter((promotion) => promotion.active).length,
    [promotions],
  );

  const filteredProducts = useMemo(() => {
    const query = deferredProductSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.sku, product.brand?.name, product.category?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [deferredProductSearch, products]);

  const filteredCategories = useMemo(() => {
    const query = deferredCategorySearch.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      [category.name, category.slug, category.parent?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [categories, deferredCategorySearch]);

  const filteredBrands = useMemo(() => {
    const query = deferredBrandSearch.trim().toLowerCase();
    if (!query) return brands;
    return brands.filter((brand) =>
      [brand.name, brand.slug, brand.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [brands, deferredBrandSearch]);

  const filteredPromotions = useMemo(() => {
    const query = deferredPromotionSearch.trim().toLowerCase();
    if (!query) return promotions;
    return promotions.filter((promotion) =>
      [promotion.name, promotion.product?.name, promotion.category?.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [deferredPromotionSearch, promotions]);

  const filteredOrders = useMemo(() => {
    const query = deferredOrderSearch.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) => {
      const customer = getOrderCustomer(order);
      return [
        order.id,
        order.status,
        order.paymentStatus,
        customer.firstName,
        customer.lastName,
        customer.email,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    });
  }, [deferredOrderSearch, orders]);

  const loginMutation = useMutation({
    mutationFn: async () => login(email, password),
    onSuccess: () => toast.success('Autentificare reușită.'),
    onError: (error: Error) => toast.error(error.message),
  });

  const productMutation = useMutation({
    mutationFn: async () => {
      const payload = toProductPayload(productForm);
      return productForm.id
        ? api.products.update(token, productForm.id, payload)
        : api.products.create(token, payload);
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
      return categoryForm.id
        ? api.categories.update(token, categoryForm.id, payload)
        : api.categories.create(token, payload);
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
      return brandForm.id
        ? api.brands.update(token, brandForm.id, payload)
        : api.brands.create(token, payload);
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
      return promotionForm.id
        ? api.promotions.update(token, promotionForm.id, payload)
        : api.promotions.create(token, payload);
    },
    onSuccess: async () => {
      toast.success(promotionForm.id ? 'Promoție actualizată.' : 'Promoție creată.');
      setPromotionForm(emptyPromotionForm);
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.products.remove(token, id),
    onSuccess: async () => {
      toast.success('Produs șters.');
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.categories.remove(token, id),
    onSuccess: async () => {
      toast.success('Categorie ștearsă.');
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => api.brands.remove(token, id),
    onSuccess: async () => {
      toast.success('Brand șters.');
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deletePromotionMutation = useMutation({
    mutationFn: (id: string) => api.promotions.remove(token, id),
    onSuccess: async () => {
      toast.success('Promoție ștearsă.');
      await invalidateAdminData(queryClient);
    },
    onError: (error: Error) => toast.error(error.message),
  });

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
        imageUrls: product.images.map((image) => image.url).join('\n'),
        specs: JSON.stringify(product.specs ?? {}, null, 2),
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
      setCategoryForm({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? '',
        image: category.image ?? '',
        parentId: category.parentId ?? '',
        active: category.active,
      });
    });
  };

  const editBrand = (brand: Brand) => {
    startTransition(() => {
      setActiveTab('brands');
      setBrandForm({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        description: brand.description ?? '',
        logo: brand.logo ?? '',
        active: brand.active,
      });
    });
  };

  const editPromotion = (promotion: Promotion) => {
    startTransition(() => {
      setActiveTab('promotions');
      setPromotionForm({
        id: promotion.id,
        name: promotion.name,
        type: promotion.type,
        value: String(promotion.value),
        startDate: promotion.startDate.slice(0, 10),
        endDate: promotion.endDate.slice(0, 10),
        scope: promotion.scope,
        productId: promotion.productId ?? '',
        categoryId: promotion.categoryId ?? '',
        active: promotion.active,
      });
    });
  };

  const submit = async (event: FormEvent, action: () => Promise<unknown>) => {
    event.preventDefault();
    try {
      await action();
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('JSON-ul din specificații nu este valid.');
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-page py-10 md:py-16">
        <Breadcrumbs items={[{ label: 'Admin' }]} />
        <div className="mx-auto mt-6 grid max-w-6xl overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-xl lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden bg-gradient-dark p-8 text-background md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,206,84,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_24%)]" />
            <div className="relative">
              <p className="text-[11px] uppercase tracking-[0.3em] text-accent">Raview Admin</p>
              <h1 className="mt-5 max-w-xl text-4xl font-display font-bold leading-tight md:text-5xl">
                Dashboard de administrare gândit pentru lucru rapid, nu doar pentru editare.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-background/70">
                Am mers pe pattern-uri inspirate din dashboard-uri moderne de e-commerce și SaaS:
                overview clar, acțiuni rapide, listare căutabilă și formulare grupate logic.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <Package2 className="h-5 w-5 text-accent" />
                  <p className="mt-3 font-medium">Catalog & filtre</p>
                  <p className="mt-2 text-sm text-background/65">
                    Produse, categorii și branduri organizate astfel încât să actualizezi rapid storefrontul.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <Megaphone className="h-5 w-5 text-accent" />
                  <p className="mt-3 font-medium">Promoții & comenzi</p>
                  <p className="mt-2 text-sm text-background/65">
                    Control clar asupra campaniilor și vizibilitate mai bună în comenzile nou plasate.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Autentificare</p>
              <h2 className="mt-3 text-3xl font-display font-bold">Intră în panoul de administrare</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Folosește contul de admin din backend pentru a accesa dashboardul.
              </p>
            </div>

            <form onSubmit={(event) => submit(event, () => loginMutation.mutateAsync())} className="space-y-5">
              <div>
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11" />
              </div>
              <div>
                <Label htmlFor="admin-password">Parolă</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 h-11"
                />
              </div>
              <Button type="submit" className="h-11 w-full bg-accent text-accent-foreground hover:bg-gold-dark" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Se autentifică...' : 'Deschide dashboardul'}
              </Button>
            </form>

            <div className="mt-6 rounded-3xl bg-secondary/45 p-5">
              <p className="text-sm font-medium">Cont demo din seed</p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">admin@lighting.local / Admin1234!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-10">
      <Breadcrumbs items={[{ label: 'Admin' }]} />

      <section className="mt-5 overflow-hidden rounded-[2rem] border border-border/70 bg-gradient-to-br from-card via-card to-secondary/35 shadow-sm">
        <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1.45fr)_340px] xl:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-accent">Dashboard</p>
            <h1 className="mt-3 text-3xl font-display font-bold leading-tight md:text-5xl">
              Control mai bun pentru produse, structură și promoții.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Pagina e reorganizată pentru lucru real: overview sus, secțiuni clare, căutare în liste și formulare
              grupate pe context. Ideea e să intri, să găsești repede ce te interesează și să faci update fără să te lupți cu interfața.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setActiveTab('products')}>Produs nou</Button>
              <Button variant="outline" onClick={() => setActiveTab('promotions')}>Promoție nouă</Button>
              <Button variant="outline" onClick={() => setActiveTab('orders')}>Vezi comenzi</Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-background/85 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Sesiune activă</p>
                <p className="mt-3 font-semibold">
                  {currentUser?.firstName ?? 'Admin'} {currentUser?.lastName ?? ''}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{currentUser?.email ?? 'utilizator autentificat'}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <UserCog className="h-5 w-5" />
              </div>
            </div>
            <Button className="mt-5 w-full" variant="outline" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStat label="Produse" value={products.length} hint="În catalogul administrat" icon={Package2} />
        <DashboardStat label="Categorii" value={categories.length} hint="Structură pentru navigare și filtre" icon={LayoutGrid} />
        <DashboardStat label="Promoții active" value={activePromotions} hint="Campanii care pot apărea public" icon={Sparkles} />
        <DashboardStat label="Comenzi" value={orders.length} hint="Înregistrate din checkout" icon={ShoppingCart} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 h-fit">
          <div className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm">
            <p className="px-2 pb-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Navigație</p>
            <div className="space-y-2">
              <SidebarItem
                label="Produse"
                description="Catalog, prețuri, stoc și media"
                icon={Package2}
                active={activeTab === 'products'}
                onClick={() => setActiveTab('products')}
              />
              <SidebarItem
                label="Categorii"
                description="Structură pentru meniu și filtre"
                icon={LayoutGrid}
                active={activeTab === 'categories'}
                onClick={() => setActiveTab('categories')}
              />
              <SidebarItem
                label="Branduri"
                description="Filtre și identitate comercială"
                icon={Tags}
                active={activeTab === 'brands'}
                onClick={() => setActiveTab('brands')}
              />
              <SidebarItem
                label="Promoții"
                description="Campanii și reduceri active"
                icon={Megaphone}
                active={activeTab === 'promotions'}
                onClick={() => setActiveTab('promotions')}
              />
              <SidebarItem
                label="Comenzi"
                description="Monitorizare checkout și clienți"
                icon={ShoppingCart}
                active={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
              />
            </div>
          </div>
        </aside>

        <div className="min-w-0">
        {activeTab === 'products' ? (
          <SectionFrame
            eyebrow="Catalog"
            title="Produse"
            description="Editorul e grupat pe zone utile: identitate comercială, prețuri, media și publicare. În dreapta ai listarea cu căutare și acțiuni rapide."
          >
            <Surface
              title={productForm.id ? 'Editează produsul selectat' : 'Creează un produs nou'}
              subtitle="Completează datele esențiale și publică produsul în catalog."
              actions={productForm.id ? <Button variant="ghost" onClick={() => setProductForm(emptyProductForm)}>Reset formular</Button> : null}
            >
              <form onSubmit={(event) => submit(event, () => productMutation.mutateAsync())} className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Identitate</p>
                      <p className="text-xs text-muted-foreground">Nume, slug și cod intern.</p>
                    </div>
                    <div><Label>Nume</Label><Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="mt-2" /></div>
                    <div><Label>Slug</Label><Input value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} className="mt-2" /></div>
                    <div><Label>SKU</Label><Input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} className="mt-2" /></div>
                    <div><Label>Descriere</Label><Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="mt-2 min-h-36" /></div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Comercializare</p>
                      <p className="text-xs text-muted-foreground">Prețuri, stoc și încadrare în catalog.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><Label>Preț</Label><Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="mt-2" /></div>
                      <div><Label>Preț vechi</Label><Input type="number" value={productForm.oldPrice} onChange={(e) => setProductForm({ ...productForm, oldPrice: e.target.value })} className="mt-2" /></div>
                      <div><Label>Stoc</Label><Input type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="mt-2" /></div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Categorie</Label>
                        <Select value={productForm.categoryId} onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}>
                          <SelectTrigger className="mt-2"><SelectValue placeholder="Alege categoria" /></SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Brand</Label>
                        <Select value={productForm.brandId} onValueChange={(value) => setProductForm({ ...productForm, brandId: value })}>
                          <SelectTrigger className="mt-2"><SelectValue placeholder="Alege brandul" /></SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div><Label>Imagini, câte un URL pe rând</Label><Textarea value={productForm.imageUrls} onChange={(e) => setProductForm({ ...productForm, imageUrls: e.target.value })} className="mt-2 min-h-28" /></div>
                    <div><Label>Specificații JSON</Label><Textarea value={productForm.specs} onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })} className="mt-2 min-h-36 font-mono text-xs" /></div>
                  </div>
                </div>

                <div className="grid gap-3 rounded-3xl bg-secondary/35 p-4 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.featured} onCheckedChange={(checked) => setProductForm({ ...productForm, featured: Boolean(checked) })} /> Featured</label>
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.bestseller} onCheckedChange={(checked) => setProductForm({ ...productForm, bestseller: Boolean(checked) })} /> Bestseller</label>
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.isNew} onCheckedChange={(checked) => setProductForm({ ...productForm, isNew: Boolean(checked) })} /> Nou</label>
                  <label className="flex items-center gap-2 text-sm"><Checkbox checked={productForm.active} onCheckedChange={(checked) => setProductForm({ ...productForm, active: Boolean(checked) })} /> Activ</label>
                </div>

                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-gold-dark" disabled={productMutation.isPending}>
                  {productMutation.isPending ? 'Se salvează...' : productForm.id ? 'Actualizează produsul' : 'Creează produsul'}
                </Button>
              </form>
            </Surface>

            <Surface title="Lista de produse" subtitle="Căutare rapidă și carduri mai ușor de scanat." actions={<Button variant="outline" onClick={() => setProductForm(emptyProductForm)}>Produs nou</Button>}>
              <SearchToolbar
                placeholder="Caută după nume, SKU, brand sau categorie"
                value={productSearch}
                onChange={setProductSearch}
                countLabel={`${filteredProducts.length} produse`}
              />
              <div className="mt-5 space-y-3">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="rounded-3xl border border-border/70 bg-secondary/20 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <img src={product.images[0]?.url || '/placeholder.svg'} alt={product.name} className="h-20 w-20 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{product.name}</p>
                          {product.featured ? <StatusPill>featured</StatusPill> : null}
                          {product.bestseller ? <StatusPill>bestseller</StatusPill> : null}
                          {!product.active ? <StatusPill variant="destructive">inactiv</StatusPill> : null}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {product.brand?.name} · {product.category?.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          SKU {product.sku} · {product.price} lei · stoc {product.stock}
                        </p>
                      </div>
                      <div className="flex gap-2 sm:flex-col">
                        <Button variant="outline" onClick={() => editProduct(product)}>Editează</Button>
                        <Button variant="destructive" onClick={() => deleteProductMutation.mutate(product.id)}>Șterge</Button>
                      </div>
                    </div>
                  </article>
                ))}
                {filteredProducts.length === 0 ? <EmptyBlock message="Nu există produse care să corespundă filtrului." /> : null}
              </div>
            </Surface>
          </SectionFrame>
        ) : null}

        {activeTab === 'categories' ? (
          <SectionFrame
            eyebrow="Structură"
            title="Categorii"
            description="Aici administrezi ierarhia pentru navigare și filtre. Formularul e simplificat, iar lista are căutare după nume, slug și părinte."
          >
            <Surface
              title={categoryForm.id ? 'Editează categoria selectată' : 'Creează categorie'}
              subtitle="Folosește categorii principale și subcategorii pentru o experiență mai clară în magazin."
              actions={categoryForm.id ? <Button variant="ghost" onClick={() => setCategoryForm(emptyCategoryForm)}>Reset formular</Button> : null}
            >
              <form onSubmit={(event) => submit(event, () => categoryMutation.mutateAsync())} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Nume</Label><Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="mt-2" /></div>
                  <div><Label>Slug</Label><Input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} className="mt-2" /></div>
                  <div><Label>Imagine URL</Label><Input value={categoryForm.image} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })} className="mt-2" /></div>
                  <div>
                    <Label>Categorie părinte</Label>
                    <Select value={categoryForm.parentId || 'none'} onValueChange={(value) => setCategoryForm({ ...categoryForm, parentId: value === 'none' ? '' : value })}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Fără părinte</SelectItem>
                        {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Descriere</Label><Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="mt-2 min-h-32" /></div>
                <label className="flex items-center gap-2 rounded-3xl bg-secondary/35 p-4 text-sm">
                  <Checkbox checked={categoryForm.active} onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, active: Boolean(checked) })} />
                  Activă în site
                </label>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-gold-dark" disabled={categoryMutation.isPending}>
                  {categoryMutation.isPending ? 'Se salvează...' : categoryForm.id ? 'Actualizează categoria' : 'Creează categoria'}
                </Button>
              </form>
            </Surface>

            <Surface title="Lista de categorii" subtitle="Vezi rapid ierarhia și statusul de publicare.">
              <SearchToolbar
                placeholder="Caută categorie după nume sau slug"
                value={categorySearch}
                onChange={setCategorySearch}
                countLabel={`${filteredCategories.length} categorii`}
              />
              <div className="mt-5 space-y-3">
                {filteredCategories.map((category) => (
                  <article key={category.id} className="rounded-3xl border border-border/70 bg-secondary/20 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                        <LayoutGrid className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{category.name}</p>
                          {!category.active ? <StatusPill variant="destructive">inactivă</StatusPill> : null}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{category.slug}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {category.parent?.name ? `Subcategorie din ${category.parent.name}` : 'Categorie principală'}
                        </p>
                      </div>
                      <div className="flex gap-2 sm:flex-col">
                        <Button variant="outline" onClick={() => editCategory(category)}>Editează</Button>
                        <Button variant="destructive" onClick={() => deleteCategoryMutation.mutate(category.id)}>Șterge</Button>
                      </div>
                    </div>
                  </article>
                ))}
                {filteredCategories.length === 0 ? <EmptyBlock message="Nu există categorii care să corespundă filtrului." /> : null}
              </div>
            </Surface>
          </SectionFrame>
        ) : null}

        {activeTab === 'brands' ? (
          <SectionFrame
            eyebrow="Filtre"
            title="Branduri"
            description="Brandurile sunt afișate într-un grid compact, ușor de scanat și de editat. Pe mobil rămân ușor de folosit."
          >
            <Surface
              title={brandForm.id ? 'Editează brandul selectat' : 'Creează brand'}
              subtitle="Păstrezi lista de branduri coerentă pentru produse și filtrele din magazin."
              actions={brandForm.id ? <Button variant="ghost" onClick={() => setBrandForm(emptyBrandForm)}>Reset formular</Button> : null}
            >
              <form onSubmit={(event) => submit(event, () => brandMutation.mutateAsync())} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Nume</Label><Input value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} className="mt-2" /></div>
                  <div><Label>Slug</Label><Input value={brandForm.slug} onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })} className="mt-2" /></div>
                  <div><Label>Logo URL</Label><Input value={brandForm.logo} onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })} className="mt-2" /></div>
                </div>
                <div><Label>Descriere</Label><Textarea value={brandForm.description} onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })} className="mt-2 min-h-32" /></div>
                <label className="flex items-center gap-2 rounded-3xl bg-secondary/35 p-4 text-sm">
                  <Checkbox checked={brandForm.active} onCheckedChange={(checked) => setBrandForm({ ...brandForm, active: Boolean(checked) })} />
                  Activ în site
                </label>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-gold-dark" disabled={brandMutation.isPending}>
                  {brandMutation.isPending ? 'Se salvează...' : brandForm.id ? 'Actualizează brandul' : 'Creează brandul'}
                </Button>
              </form>
            </Surface>

            <Surface title="Lista de branduri" subtitle="Carduri compacte, cu focus pe nume și acțiuni rapide.">
              <SearchToolbar
                placeholder="Caută brand după nume sau slug"
                value={brandSearch}
                onChange={setBrandSearch}
                countLabel={`${filteredBrands.length} branduri`}
              />
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {filteredBrands.map((brand) => (
                  <article key={brand.id} className="rounded-3xl border border-border/70 bg-secondary/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{brand.name}</p>
                          {!brand.active ? <StatusPill variant="destructive">inactiv</StatusPill> : null}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{brand.slug}</p>
                        {brand.description ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{brand.description}</p> : null}
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                        <Tags className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => editBrand(brand)}>Editează</Button>
                      <Button variant="destructive" className="flex-1" onClick={() => deleteBrandMutation.mutate(brand.id)}>Șterge</Button>
                    </div>
                  </article>
                ))}
                {filteredBrands.length === 0 ? <EmptyBlock message="Nu există branduri care să corespundă filtrului." /> : null}
              </div>
            </Surface>
          </SectionFrame>
        ) : null}

        {activeTab === 'promotions' ? (
          <SectionFrame
            eyebrow="Campanii"
            title="Promoții"
            description="Promoțiile sunt organizate ca un centru de campanii: configurare clară și listare cu scope, valoare și perioadă."
          >
            <Surface
              title={promotionForm.id ? 'Editează promoția selectată' : 'Creează promoție'}
              subtitle="Alege tipul de reducere, scope-ul și perioada de valabilitate."
              actions={promotionForm.id ? <Button variant="ghost" onClick={() => setPromotionForm(emptyPromotionForm)}>Reset formular</Button> : null}
            >
              <form onSubmit={(event) => submit(event, () => promotionMutation.mutateAsync())} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><Label>Nume</Label><Input value={promotionForm.name} onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })} className="mt-2" /></div>
                  <div><Label>Valoare</Label><Input type="number" value={promotionForm.value} onChange={(e) => setPromotionForm({ ...promotionForm, value: e.target.value })} className="mt-2" /></div>
                  <div>
                    <Label>Tip</Label>
                    <Select value={promotionForm.type} onValueChange={(value: 'percentage' | 'fixed') => setPromotionForm({ ...promotionForm, type: value })}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Procent</SelectItem>
                        <SelectItem value="fixed">Sumă fixă</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Scope</Label>
                    <Select value={promotionForm.scope} onValueChange={(value: 'product' | 'category') => setPromotionForm({ ...promotionForm, scope: value })}>
                      <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Produs</SelectItem>
                        <SelectItem value="category">Categorie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Început</Label><Input type="date" value={promotionForm.startDate} onChange={(e) => setPromotionForm({ ...promotionForm, startDate: e.target.value })} className="mt-2" /></div>
                  <div><Label>Final</Label><Input type="date" value={promotionForm.endDate} onChange={(e) => setPromotionForm({ ...promotionForm, endDate: e.target.value })} className="mt-2" /></div>
                </div>

                {promotionForm.scope === 'product' ? (
                  <div>
                    <Label>Produs</Label>
                    <Select value={promotionForm.productId} onValueChange={(value) => setPromotionForm({ ...promotionForm, productId: value })}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Alege produsul" /></SelectTrigger>
                      <SelectContent>
                        {products.map((product) => <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label>Categorie</Label>
                    <Select value={promotionForm.categoryId} onValueChange={(value) => setPromotionForm({ ...promotionForm, categoryId: value })}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Alege categoria" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <label className="flex items-center gap-2 rounded-3xl bg-secondary/35 p-4 text-sm">
                  <Checkbox checked={promotionForm.active} onCheckedChange={(checked) => setPromotionForm({ ...promotionForm, active: Boolean(checked) })} />
                  Promoție activă
                </label>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-gold-dark" disabled={promotionMutation.isPending}>
                  {promotionMutation.isPending ? 'Se salvează...' : promotionForm.id ? 'Actualizează promoția' : 'Creează promoția'}
                </Button>
              </form>
            </Surface>

            <Surface title="Campanii existente" subtitle="Căutare rapidă după nume, produs sau categorie.">
              <SearchToolbar
                placeholder="Caută promoție după nume, produs sau categorie"
                value={promotionSearch}
                onChange={setPromotionSearch}
                countLabel={`${filteredPromotions.length} promoții`}
              />
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {filteredPromotions.map((promotion) => (
                  <article key={promotion.id} className="rounded-3xl border border-border/70 bg-secondary/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{promotion.name}</p>
                          {!promotion.active ? <StatusPill variant="destructive">inactivă</StatusPill> : null}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {promotion.type === 'percentage' ? `${promotion.value}%` : `${promotion.value} lei`} · {' '}
                          {promotion.scope === 'product' ? promotion.product?.name : promotion.category?.name}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                        </p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                        <Megaphone className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => editPromotion(promotion)}>Editează</Button>
                      <Button variant="destructive" className="flex-1" onClick={() => deletePromotionMutation.mutate(promotion.id)}>Șterge</Button>
                    </div>
                  </article>
                ))}
                {filteredPromotions.length === 0 ? <EmptyBlock message="Nu există promoții care să corespundă filtrului." /> : null}
              </div>
            </Surface>
          </SectionFrame>
        ) : null}

        {activeTab === 'orders' ? (
          <SectionFrame
            eyebrow="Comenzi"
            title="Comenzi recente"
            description="Zona de comenzi e gândită pentru citire rapidă: căutare după client sau status, carduri compacte și informații esențiale la vedere."
          >
            <Surface title="Flux de comenzi" subtitle="Vezi rapid cine a comandat, statusul și adresa de livrare.">
              <SearchToolbar
                placeholder="Caută după client, email, status sau id"
                value={orderSearch}
                onChange={setOrderSearch}
                countLabel={`${filteredOrders.length} comenzi`}
              />
              <div className="mt-5 space-y-3">
                {filteredOrders.map((order) => {
                  const customer = getOrderCustomer(order);
                  return (
                    <article key={order.id} className="rounded-3xl border border-border/70 bg-secondary/20 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">Comanda #{order.id.slice(-8).toUpperCase()}</p>
                            <StatusPill>{order.status}</StatusPill>
                            <StatusPill>{order.paymentStatus}</StatusPill>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {customer.firstName} {customer.lastName} · {customer.email}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {order.addressSnapshot?.line1}, {order.addressSnapshot?.city}, {order.addressSnapshot?.state}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-background px-4 py-3 text-sm">
                          <p className="font-semibold">{order.total} lei</p>
                          <p className="mt-1 text-muted-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
                {filteredOrders.length === 0 ? <EmptyBlock message="Nu există comenzi care să corespundă filtrului." /> : null}
              </div>
            </Surface>
          </SectionFrame>
        ) : null}
        </div>
      </div>
    </div>
  );
}
