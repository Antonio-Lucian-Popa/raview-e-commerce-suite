import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, Shield, Headphones, Award, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';
import { api } from '@/lib/api';
import { getCategoryIcon } from '@/lib/category-icons';

const heroImage = '/showroom/image1.jpeg';
const showroomImages = [
  { src: '/showroom/image2.jpeg', alt: 'Showroom Ravlux cu corpuri de iluminat decorative' },
  { src: '/showroom/image3.jpeg', alt: 'Showroom Ravlux cu corpuri de iluminat moderne' },
  { src: '/showroom/image4.jpeg', alt: 'Zonă de expunere cu lampadar circular Ravlux' },
  { src: '/showroom/image5.jpeg', alt: 'Perspectivă showroom Ravlux cu lustre și aplice' },
  { src: '/showroom/image6.jpeg', alt: 'Showroom Ravlux cu iluminat ambiental și decorativ' },
];

const benefits = [
  { icon: Truck, title: 'Livrare Rapidă', desc: 'Livrare gratuită peste 500 lei' },
  { icon: Shield, title: 'Garanție', desc: 'Garanție de până la 5 ani' },
  { icon: Headphones, title: 'Consultanță', desc: 'Sfaturi de specialitate' },
  { icon: Award, title: 'Calitate Premium', desc: 'Branduri de încredere' },
];

export default function HomePage() {
  const { data: inStockProductsData, isLoading } = useQuery({
    queryKey: ['products', 'home-in-stock'],
    queryFn: () => api.products.getCatalogPage({ page: 1, limit: 4, inStock: true }),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'home'],
    queryFn: () => api.categories.getAll(),
  });
  const { data: brands = [] } = useQuery({
    queryKey: ['brands', 'home'],
    queryFn: () => api.brands.getAll(),
  });
  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions', 'home'],
    queryFn: () => api.promotions.getAll(),
  });
  const topPromotion = promotions[0];
  const inStockProducts = inStockProductsData?.items ?? [];

  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Showroom Ravlux luminos"
            className="h-full w-full object-cover object-[58%_center]"
            width={1600}
            height={1200}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/62 to-background/10" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/45 to-transparent" />
        </div>
        <div className="relative container-page">
          <div className="max-w-xl space-y-6 animate-fade-in">
            <span className="inline-block text-sm uppercase tracking-[0.3em] text-accent font-medium">Corpuri de Iluminat</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] text-foreground">
              Redefinim spațiul prin <span className="text-gradient-gold">lumină</span>
            </h1>
            <p className="text-lg text-foreground/70 max-w-md">
              Descoperă soluții premium de iluminat interior și exterior. Design modern, calitate garantată.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-gold-dark" asChild>
                <Link to="/shop">Explorează Magazinul <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-foreground/20 bg-background/45 text-foreground backdrop-blur-sm hover:bg-background"
                asChild
              >
                <Link to="/contact">Vizitează Showroom-ul</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b bg-card">
        <div className="container-page py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(b => (
              <div key={b.title} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <b.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Categorii de Produse</h2>
            <p className="text-muted-foreground">Găsește soluția perfectă de iluminat pentru orice spațiu și nevoie.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => {
              const Icon = getCategoryIcon(cat);

              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="group flex min-h-40 flex-col items-center justify-center rounded-lg border border-border/80 bg-background p-5 text-center hover-lift hover:border-accent/70 hover:bg-accent/5"
                >
                  <Icon className="mb-4 h-10 w-10 stroke-[1.35] text-foreground/75 transition-colors group-hover:text-accent" />
                  <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-tight md:text-base">{cat.name}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{cat.productCount ?? 0} produse</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* In Stock Products */}
      <section className="section-padding bg-surface">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold">Produse în stoc</h2>
              <p className="text-muted-foreground mt-1">Corpuri de iluminat disponibile acum.</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/shop?inStock=true">Vezi toate <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          {isLoading ? <ProductGridSkeleton /> : <ProductGrid products={inStockProducts} />}
        </div>
      </section>

      {/* Suppliers */}
      {brands.length > 0 && (
        <section className="border-b border-border/80 bg-background">
          <div className="container-page py-12 md:py-16">
            <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.26em] text-accent">Furnizori</span>
                <h2 className="mt-3 text-3xl font-display font-bold md:text-4xl">Alege brandul preferat</h2>
              </div>
              <Button variant="outline" className="w-fit" asChild>
                <Link to="/shop">Toți furnizorii <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/shop?brandIds=${encodeURIComponent(brand.id)}`}
                  className="group flex min-h-24 items-center justify-center rounded-lg border border-border/80 bg-card px-5 py-6 transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-sm"
                  aria-label={`Vezi produse ${brand.name}`}
                >
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      loading="lazy"
                      className="max-h-12 max-w-full object-contain opacity-75 grayscale transition-all group-hover:opacity-100 group-hover:grayscale-0"
                    />
                  ) : (
                    <span className="text-center font-display text-lg font-semibold leading-none tracking-tight text-foreground/70 transition-colors group-hover:text-accent">
                      {brand.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo Banner */}
      {topPromotion && (
        <section className="bg-gradient-dark text-background">
          <div className="container-page section-padding">
            <div className="grid gap-8 overflow-hidden rounded-[2rem] border border-accent/15 bg-background/5 p-8 backdrop-blur-sm lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:p-12">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                  Ofertă Specială
                </span>
                <h2 className="mt-5 text-3xl font-display font-bold leading-tight md:text-5xl">
                  {topPromotion.type === 'percentage' ? (
                    <>
                      Economisești până la <span className="text-gradient-gold">{topPromotion.value}%</span>
                    </>
                  ) : (
                    <>
                      Reducere directă de <span className="text-gradient-gold">{topPromotion.value} lei</span>
                    </>
                  )}
                </h2>
                <p className="mt-4 text-lg text-background/72">
                  {topPromotion.name}
                </p>
                <p className="mt-2 text-sm text-background/50">
                  Valabilă până la {new Date(topPromotion.endDate).toLocaleDateString('ro-RO')}
                  {topPromotion.product?.name ? ` pentru ${topPromotion.product.name}` : ''}
                  {topPromotion.category?.name ? ` în categoria ${topPromotion.category.name}` : ''}
                </p>
                <Button size="lg" className="mt-7 bg-accent text-accent-foreground hover:bg-gold-dark" asChild>
                  <Link to="/promotions">Vezi Ofertele <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>

              <div className="flex justify-start lg:justify-end">
                <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-accent/20 bg-accent/10 shadow-[0_0_80px_rgba(212,165,36,0.12)] md:h-72 md:w-72">
                  <div className="absolute inset-5 rounded-full border border-accent/10" />
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-background/45">Oferta</p>
                    <p className="mt-3 font-display text-5xl font-bold text-gradient-gold md:text-7xl">
                      {topPromotion.type === 'percentage' ? `-${topPromotion.value}%` : `-${topPromotion.value}`}
                    </p>
                    <p className="mt-2 text-sm text-background/55">
                      {topPromotion.type === 'percentage' ? 'discount' : 'lei'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Showroom CTA */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.26em] text-accent">Showroom Ravlux</span>
              <h2 className="mt-3 text-3xl font-display font-bold md:text-4xl">Te așteptăm în showroom</h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Vizitează-ne și descoperă cele mai potrivite soluții de iluminat. Consultanții noștri sunt pregătiți să te ajute.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-accent" />
                <span>Bacău, Str. Gheorghe Donici Nr.2</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="bg-accent text-accent-foreground hover:bg-gold-dark" asChild>
                  <Link to="/contact">Contactează-ne</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="tel:0743687059">Sună acum</a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 auto-rows-[128px] gap-3 sm:grid-cols-4 sm:auto-rows-[180px] lg:auto-rows-[220px]">
              {showroomImages.map((image, index) => (
                <figure
                  key={image.src}
                  className={[
                    'overflow-hidden rounded-lg bg-background shadow-sm',
                    index === 0 ? 'col-span-2 row-span-2' : '',
                  ].join(' ')}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
