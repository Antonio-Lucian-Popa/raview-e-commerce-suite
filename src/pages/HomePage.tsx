import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Truck, Shield, Headphones, Award, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';
import { api } from '@/lib/api';
import { withAssetVersion } from '@/lib/assets';
import heroImage from '@/assets/hero-showroom.jpg';

const benefits = [
  { icon: Truck, title: 'Livrare Rapidă', desc: 'Livrare gratuită peste 500 lei' },
  { icon: Shield, title: 'Garanție', desc: 'Garanție de până la 5 ani' },
  { icon: Headphones, title: 'Consultanță', desc: 'Sfaturi de specialitate' },
  { icon: Award, title: 'Calitate Premium', desc: 'Branduri de încredere' },
];

export default function HomePage() {
  const { data: featured, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.products.getFeatured(),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'home'],
    queryFn: () => api.categories.getAll(),
  });
  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions', 'home'],
    queryFn: () => api.promotions.getAll(),
  });
  const topPromotion = promotions[0];

  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="RaView Lighting Showroom" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="relative container-page">
          <div className="max-w-xl space-y-6 animate-fade-in">
            <span className="inline-block text-sm uppercase tracking-[0.3em] text-accent font-medium">Corpuri de Iluminat</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] text-background">
              Redefinim spațiul prin <span className="text-gradient-gold">lumină</span>
            </h1>
            <p className="text-lg text-background/70 max-w-md">
              Descoperă soluții premium de iluminat interior și exterior. Design modern, calitate garantată.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-gold-dark" asChild>
                <Link to="/shop">Explorează Magazinul <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-background/35 bg-foreground/25 text-background backdrop-blur-sm hover:bg-background hover:text-foreground"
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
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden hover-lift"
              >
                <img src={withAssetVersion(cat.image, cat.updatedAt ?? cat.createdAt)} alt={cat.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-semibold text-background text-sm md:text-base">{cat.name}</h3>
                  <p className="text-xs text-background/60 mt-0.5">{cat.productCount ?? 0} produse</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-surface">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold">Produse Populare</h2>
              <p className="text-muted-foreground mt-1">Cele mai apreciate corpuri de iluminat.</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/shop">Vezi toate <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          {isLoading ? <ProductGridSkeleton /> : featured && <ProductGrid products={featured} />}
        </div>
      </section>

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
      <section className="section-padding">
        <div className="container-page">
          <div className="bg-secondary rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-display font-bold mb-4">Te așteptăm în Showroom</h2>
              <p className="text-muted-foreground mb-6">
                Vizitează-ne și descoperă cele mai potrivite soluții de iluminat. Consultanții noștri sunt pregătiți să te ajute.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 text-accent" />
                Bacău, Str. Gheorghe Donici Nr.2
              </div>
              <div className="flex gap-3">
                <Button className="bg-accent text-accent-foreground hover:bg-gold-dark" asChild>
                  <Link to="/contact">Contactează-ne</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="tel:0743687059">Sună acum</a>
                </Button>
              </div>
            </div>
            <div className="w-full md:w-80 h-60 rounded-xl overflow-hidden">
              <img src={heroImage} alt="Showroom RaView" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
