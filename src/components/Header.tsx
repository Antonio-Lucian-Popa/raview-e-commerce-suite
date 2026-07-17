import { Link, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  ChevronDown,
  Gift,
  Grid3X3,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  PackageSearch,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { api } from '@/lib/api';
import { Category } from '@/types';

type NavLink = {
  label: string;
  href: string;
  hasMegaMenu?: boolean;
};

const baseNavLinks: NavLink[] = [
  { label: 'Acasă', href: '/' },
  { label: 'Magazin', href: '/shop' },
  { label: 'Oferte', href: '/promotions' },
  { label: 'Comanda mea', href: '/track-order' },
  { label: 'Portofoliu', href: '/portfolio' },
  { label: 'Contact', href: '/contact' },
];

const mobileQuickLinks = [
  { label: 'Acasă', href: '/', icon: Home },
  { label: 'Magazin', href: '/shop', icon: Grid3X3 },
  { label: 'Oferte', href: '/promotions', icon: Gift },
  { label: 'Comanda mea', href: '/track-order', icon: PackageSearch },
  { label: 'Portofoliu', href: '/portfolio', icon: Briefcase },
  { label: 'Contact', href: '/contact', icon: MessageCircle },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);
  const { totalItems, setIsOpen } = useCart();
  const location = useLocation();
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'header'],
    queryFn: () => api.categories.getAll(),
  });
  const parentCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories],
  );
  const subcategoriesByParent = useMemo(() => {
    return categories.reduce<Record<string, Category[]>>((groups, category) => {
      if (!category.parentId) return groups;

      return {
        ...groups,
        [category.parentId]: [...(groups[category.parentId] ?? []), category],
      };
    }, {});
  }, [categories]);
  const navLinks: NavLink[] = baseNavLinks.map((link) =>
    link.href === '/shop'
      ? {
          ...link,
          hasMegaMenu: parentCategories.length > 0,
        }
      : link,
  );

  return (
    <>
      {/* Top bar */}
      <div className="hidden bg-primary sm:block">
        <div className="container-page flex items-center justify-between py-2 text-xs text-primary-foreground/80">
          <div className="flex items-center gap-4">
            <a href="tel:0743687059" className="flex items-center gap-1 hover:text-primary-foreground transition-colors">
              <Phone className="h-3 w-3" /> 0743 687 059
            </a>
            <span className="hidden sm:flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Bacău, Str. Gheorghe Donici Nr.2
            </span>
          </div>
          <span className="hidden sm:block">Livrare gratuită peste 500 lei</span>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container-page flex min-h-[var(--header-height)] flex-col justify-center py-2 lg:h-[var(--header-height)] lg:py-0">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex min-w-0 flex-shrink-0 items-center gap-2">
              <span className="text-xl font-display font-bold tracking-tight sm:text-2xl">
                Rav<span className="text-gradient-gold">lux</span>
              </span>
            </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            {navLinks.map(link => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.hasMegaMenu && setMegaMenuOpen(link.label)}
                onMouseLeave={() => setMegaMenuOpen(null)}
              >
                <Link
                  to={link.href}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 py-2 ${
                    location.pathname === link.href ? 'text-accent' : 'text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {link.hasMegaMenu && <ChevronDown className="h-3 w-3" />}
                </Link>

                {/* Mega menu */}
                {link.hasMegaMenu && megaMenuOpen === link.label && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                    <div className="max-h-[70vh] min-w-[640px] overflow-y-auto rounded-lg border bg-background p-5 shadow-xl">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                      {parentCategories.map((category) => (
                        <div key={category.id} className="min-w-0">
                          <Link
                            to={`/category/${category.slug}`}
                            className="block rounded-md px-2 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                            onClick={() => setMegaMenuOpen(null)}
                          >
                            {category.name}
                          </Link>
                          {(subcategoriesByParent[category.id]?.length ?? 0) > 0 && (
                            <div className="mt-1 space-y-0.5 border-l border-border/70 pl-3">
                              {subcategoriesByParent[category.id].map((subcategory) => (
                                <Link
                                  key={subcategory.id}
                                  to={`/category/${subcategory.slug}`}
                                  className="block rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                  onClick={() => setMegaMenuOpen(null)}
                                >
                                  {subcategory.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      </div>
                      <Link
                        to="/shop"
                        className="mt-5 flex items-center justify-center rounded-md bg-secondary p-3 transition-colors hover:bg-secondary/80"
                        onClick={() => setMegaMenuOpen(null)}
                      >
                        <span className="text-sm font-semibold">Vezi toate produsele →</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex min-w-0 flex-shrink-0 items-center justify-end gap-0.5 sm:gap-2">
            {searchOpen ? (
              <div className="hidden items-center gap-2 sm:flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchQuery) {
                      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  placeholder="Caută produse..."
                  className="w-40 sm:w-64 h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
                <Button variant="ghost" size="icon" onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} aria-label="Caută">
                <Search className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(true)} aria-label="Coș">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-full border-accent/40 bg-accent/10 px-2.5 text-accent hover:bg-accent hover:text-accent-foreground sm:gap-2 sm:px-3 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Meniu
            </Button>
          </div>
          </div>

          {searchOpen && (
            <form
              className="mt-3 flex gap-2 sm:hidden"
              onSubmit={(event) => {
                event.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Caută corpuri de iluminat..."
                className="h-10 min-w-0 flex-1 rounded-full border bg-background px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} aria-label="Închide căutarea">
                <X className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-primary/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[2rem] border border-border/70 bg-background shadow-2xl animate-slide-up">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-background/95 p-5 backdrop-blur">
              <div>
                <p className="font-display text-xl font-bold">
                  Rav<span className="text-gradient-gold">lux</span>
                </p>
                <p className="text-xs text-muted-foreground">Navigare rapidă</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Închide meniul">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6 p-5 pb-8">
              <Link
                to="/shop"
                onClick={() => setMobileOpen(false)}
                className="group flex items-center justify-between overflow-hidden rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Magazin</p>
                  <p className="mt-1 font-display text-2xl font-bold">Vezi colecția</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">Corpuri de iluminat pentru orice spațiu.</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform group-hover:translate-x-1">
                  <Sparkles className="h-5 w-5" />
                </span>
              </Link>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Acces rapid</p>
                <nav className="grid grid-cols-2 gap-2">
                  {mobileQuickLinks.map((link) => {
                    const Icon = link.icon;
                    const active = location.pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`flex items-center gap-3 rounded-2xl border p-3 text-sm font-medium transition-colors ${
                          active ? 'border-accent bg-accent/10 text-accent' : 'border-border/70 bg-secondary/30 hover:bg-secondary'
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {parentCategories.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Categorii</p>
                    <Link to="/shop" className="text-xs font-medium text-accent" onClick={() => setMobileOpen(false)}>
                      Vezi toate
                    </Link>
                  </div>
                  <div className="grid gap-2">
                    {parentCategories.slice(0, 6).map((category) => (
                      <div key={category.id} className="rounded-2xl border border-border/70 bg-card p-3">
                        <Link
                          to={`/category/${category.slug}`}
                          className="flex items-center justify-between text-sm font-semibold transition-colors hover:text-accent"
                          onClick={() => setMobileOpen(false)}
                        >
                          {category.name}
                          <span className="text-xs font-medium text-muted-foreground">{category.productCount ?? 0} produse</span>
                        </Link>
                        {(subcategoriesByParent[category.id]?.length ?? 0) > 0 && (
                          <div className="mt-2 grid gap-1 border-l border-border/70 pl-3">
                            {subcategoriesByParent[category.id].slice(0, 5).map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                to={`/category/${subcategory.slug}`}
                                className="py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
                                onClick={() => setMobileOpen(false)}
                              >
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <a href="tel:0743687059" className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm">
                  <Phone className="mb-2 h-4 w-4 text-accent" />
                  <span className="font-medium">Sună-ne</span>
                  <span className="mt-1 block text-xs text-muted-foreground">0743 687 059</span>
                </a>
                <Link to="/contact" onClick={() => setMobileOpen(false)} className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm">
                  <MapPin className="mb-2 h-4 w-4 text-accent" />
                  <span className="font-medium">Showroom</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Bacău</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
