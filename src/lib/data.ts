import { Product, Category, PortfolioProject, Promotion } from '@/types';

import categoryInterior from '@/assets/category-interior.jpg';
import categoryExterior from '@/assets/category-exterior.jpg';
import categoryDecorativ from '@/assets/category-decorativ.jpg';
import categoryArhitectural from '@/assets/category-arhitectural.jpg';
import categoryBecuri from '@/assets/category-becuri.jpg';
import categorySmarthome from '@/assets/category-smarthome.jpg';
import categoryLed from '@/assets/category-led.jpg';
import categoryIndustrial from '@/assets/category-industrial.jpg';

export const categories: Category[] = [
  { id: '1', slug: 'interior', name: 'Iluminat Interior', description: 'Soluții moderne care transformă orice spațiu într-un loc primitor și elegant.', image: categoryInterior, productCount: 124 },
  { id: '2', slug: 'exterior', name: 'Iluminat Exterior', description: 'Lumină eficientă și decorativă pentru exteriorul casei tale.', image: categoryExterior, productCount: 86 },
  { id: '3', slug: 'decorativ', name: 'Decorativ', description: 'Completează armonios designul interior prin accente moderne.', image: categoryDecorativ, productCount: 95 },
  { id: '4', slug: 'arhitectural', name: 'Arhitectural', description: 'Sisteme de iluminat pe șină flexibile și eficiente.', image: categoryArhitectural, productCount: 67 },
  { id: '5', slug: 'becuri', name: 'Becuri', description: 'Varietate de forme și temperaturi de culoare pentru orice spațiu.', image: categoryBecuri, productCount: 210 },
  { id: '6', slug: 'smarthome', name: 'Smart Home', description: 'Controlul total al intensității, culorii și programul de funcționare.', image: categorySmarthome, productCount: 45 },
  { id: '7', slug: 'led', name: 'Bandă LED', description: 'Soluții versatile pentru accente decorative și iluminare ambientală.', image: categoryLed, productCount: 78 },
  { id: '8', slug: 'industrial', name: 'Industrial', description: 'Lumină puternică și constantă în spații mari.', image: categoryIndustrial, productCount: 56 },
];

const makeProduct = (id: number, name: string, slug: string, cat: string, catSlug: string, price: number, oldPrice?: number, badges: Product['badges'] = [], brand = 'RaView'): Product => ({
  id: String(id),
  slug,
  name,
  sku: `RV-${String(id).padStart(4, '0')}`,
  brand,
  price,
  oldPrice,
  discount: oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined,
  images: [categoryInterior, categoryDecorativ, categoryExterior],
  category: cat,
  categorySlug: catSlug,
  description: `${name} - un produs premium din colecția RaView Lighting. Conceput pentru a oferi iluminare de excepție, combină designul modern cu eficiența energetică. Fabricat din materiale de calitate superioară, acest produs aduce eleganță și funcționalitate în orice spațiu.`,
  shortDescription: `${name} - design modern, eficiență energetică maximă.`,
  specs: {
    'Material': 'Aluminiu & Sticlă',
    'Putere': `${10 + id * 3}W`,
    'Temperatură culoare': '3000K / 4000K',
    'Flux luminos': `${800 + id * 100} lm`,
    'IP': id % 2 === 0 ? 'IP44' : 'IP20',
    'Garanție': '2 ani',
    'Dimensiuni': `${20 + id}x${15 + id}x${10 + id} cm`,
  },
  inStock: id % 5 !== 0,
  stockCount: id % 5 === 0 ? 0 : 5 + id,
  badges,
  rating: 4 + Math.random() * 1,
  reviewCount: 10 + id * 3,
  createdAt: '2025-01-01',
});

export const products: Product[] = [
  makeProduct(1, 'Lustră Pandant Auriu Nordic', 'lustra-pandant-auriu-nordic', 'Iluminat Interior', 'interior', 459, 599, ['sale', 'bestseller'], 'Nordlux'),
  makeProduct(2, 'Aplică Perete LED Minimalist', 'aplica-perete-led-minimalist', 'Iluminat Interior', 'interior', 189, undefined, ['new'], 'RaView'),
  makeProduct(3, 'Spot Încastrat Dimabil', 'spot-incastrat-dimabil', 'Iluminat Interior', 'interior', 79, 99, ['sale']),
  makeProduct(4, 'Felinar Exterior Solar', 'felinar-exterior-solar', 'Iluminat Exterior', 'exterior', 249, undefined, ['new'], 'Philips'),
  makeProduct(5, 'Proiector LED 50W', 'proiector-led-50w', 'Iluminat Exterior', 'exterior', 159, 199, ['sale']),
  makeProduct(6, 'Candelabru Crystal Elegance', 'candelabru-crystal-elegance', 'Decorativ', 'decorativ', 1299, 1599, ['bestseller'], 'Eglo'),
  makeProduct(7, 'Veioză Design Artdeco', 'veioza-design-artdeco', 'Decorativ', 'decorativ', 349, undefined, ['new']),
  makeProduct(8, 'Spot pe Șină Magnetic', 'spot-pe-sina-magnetic', 'Arhitectural', 'arhitectural', 129, undefined, [], 'Nowodvorski'),
  makeProduct(9, 'Sistem Șină 2m Negru', 'sistem-sina-2m-negru', 'Arhitectural', 'arhitectural', 289, 349, ['sale']),
  makeProduct(10, 'Bec LED E27 12W', 'bec-led-e27-12w', 'Becuri', 'becuri', 19, 29, ['sale', 'bestseller'], 'Osram'),
  makeProduct(11, 'Bec Filament Vintage E27', 'bec-filament-vintage-e27', 'Becuri', 'becuri', 29, undefined, ['new']),
  makeProduct(12, 'Bec Smart WiFi RGB', 'bec-smart-wifi-rgb', 'Smart Home', 'smarthome', 49, 69, ['sale'], 'Philips Hue'),
  makeProduct(13, 'Controller LED Smart', 'controller-led-smart', 'Smart Home', 'smarthome', 89, undefined, ['new']),
  makeProduct(14, 'Bandă LED 5m Alb Cald', 'banda-led-5m-alb-cald', 'Bandă LED', 'led', 69, 89, ['bestseller']),
  makeProduct(15, 'Bandă LED RGB 10m', 'banda-led-rgb-10m', 'Bandă LED', 'led', 129, undefined, ['new']),
  makeProduct(16, 'Corp Industrial High Bay', 'corp-industrial-high-bay', 'Industrial', 'industrial', 399, 499, ['sale'], 'Ledvance'),
  makeProduct(17, 'Lampă Birou LED Flexibilă', 'lampa-birou-led-flexibila', 'Iluminat Interior', 'interior', 149, undefined, []),
  makeProduct(18, 'Plafonieră LED 60W Rotundă', 'plafoniera-led-60w-rotunda', 'Iluminat Interior', 'interior', 219, 279, ['sale', 'bestseller']),
];

export const portfolioProjects: PortfolioProject[] = [
  { id: '1', slug: 'hotel-boutique-iasi', title: 'Hotel Boutique Iași', description: 'Proiect complet de iluminat interior și exterior pentru un hotel boutique premium din centrul istoric al Iașului.', images: [categoryInterior, categoryDecorativ], category: 'Hospitality', location: 'Iași' },
  { id: '2', slug: 'vila-moderna-bacau', title: 'Vilă Modernă Bacău', description: 'Iluminat arhitectural și decorativ pentru o vilă modernă cu design contemporan.', images: [categoryExterior, categoryInterior], category: 'Rezidențial', location: 'Bacău' },
  { id: '3', slug: 'restaurant-urban', title: 'Restaurant Urban Kitchen', description: 'Atmosferă caldă și intimă creată prin iluminat decorativ personalizat.', images: [categoryDecorativ, categoryLed], category: 'HoReCa', location: 'București' },
  { id: '4', slug: 'showroom-auto', title: 'Showroom Auto Premium', description: 'Iluminat industrial și arhitectural de înaltă performanță.', images: [categoryArhitectural, categoryIndustrial], category: 'Comercial', location: 'Cluj-Napoca' },
];

export const promotions: Promotion[] = [
  { id: '1', title: 'Summer Sale -40%', description: 'Reduceri de până la 40% la corpuri de iluminat interior.', discount: 40, image: categoryInterior, validUntil: '2026-05-30', slug: 'summer-sale' },
  { id: '2', title: 'Smart Home Bundle', description: 'Pachet complet Smart Home la preț special.', discount: 25, image: categorySmarthome, validUntil: '2026-06-15', slug: 'smart-home-bundle' },
];

export const brands = ['RaView', 'Nordlux', 'Philips', 'Eglo', 'Osram', 'Nowodvorski', 'Ledvance', 'Philips Hue'];
