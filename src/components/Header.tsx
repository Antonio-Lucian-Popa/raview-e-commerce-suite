import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingBag, Menu, X, Phone, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { api } from '@/lib/api';

type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const baseNavLinks: NavLink[] = [
  { label: 'Acasă', href: '/' },
  { label: 'Magazine', href: '/shop' },
  { label: 'Oferte', href: '/promotions' },
  { label: 'Portofoliu', href: '/portfolio' },
  { label: 'Contact', href: '/contact' },
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
  const navLinks: NavLink[] = baseNavLinks.map((link) =>
    link.href === '/shop'
      ? {
          ...link,
          children: categories.map((category) => ({
            label: category.name,
            href: `/category/${category.slug}`,
          })),
        }
      : link,
  );

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary">
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
        <div className="container-page flex items-center justify-between h-[var(--header-height)]">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold tracking-tight">
              Ra<span className="text-gradient-gold">View</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground -mb-1 hidden sm:block">Lighting</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.children && setMegaMenuOpen(link.label)}
                onMouseLeave={() => setMegaMenuOpen(null)}
              >
                <Link
                  to={link.href}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 py-2 ${
                    location.pathname === link.href ? 'text-accent' : 'text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {link.label}
                  {link.children && <ChevronDown className="h-3 w-3" />}
                </Link>

                {/* Mega menu */}
                {link.children && megaMenuOpen === link.label && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                    <div className="bg-background border rounded-lg shadow-xl p-6 min-w-[500px] grid grid-cols-2 gap-3">
                      {link.children.map(child => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="flex items-center gap-3 p-3 rounded-md hover:bg-secondary transition-colors"
                          onClick={() => setMegaMenuOpen(null)}
                        >
                          <span className="text-sm font-medium">{child.label}</span>
                        </Link>
                      ))}
                      <Link
                        to="/shop"
                        className="col-span-2 flex items-center justify-center p-3 bg-secondary rounded-md hover:bg-secondary/80 transition-colors mt-2"
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
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="flex items-center gap-2">
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
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(true)}>
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-background shadow-2xl animate-slide-up overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-display font-bold text-lg">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-1">
              {navLinks.map(link => (
                <div key={link.href}>
                  <Link
                    to={link.href}
                    className="block py-3 px-3 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-4 space-y-1">
                      {link.children.map(child => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block py-2 px-3 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
