import { products, categories, portfolioProjects, promotions } from './data';
import { Product, Category, PortfolioProject, Promotion, FilterState } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  products: {
    async getAll(filters?: Partial<FilterState>): Promise<Product[]> {
      await delay(300);
      let result = [...products];
      if (filters?.category) result = result.filter(p => p.categorySlug === filters.category);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
      }
      if (filters?.brands?.length) result = result.filter(p => filters.brands!.includes(p.brand));
      if (filters?.inStock) result = result.filter(p => p.inStock);
      if (filters?.priceRange) result = result.filter(p => p.price >= filters.priceRange![0] && p.price <= filters.priceRange![1]);
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'price-asc': result.sort((a, b) => a.price - b.price); break;
          case 'price-desc': result.sort((a, b) => b.price - a.price); break;
          case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
          case 'newest': result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
        }
      }
      return result;
    },
    async getBySlug(slug: string): Promise<Product | undefined> {
      await delay(200);
      return products.find(p => p.slug === slug);
    },
    async getRelated(categorySlug: string, excludeId: string): Promise<Product[]> {
      await delay(200);
      return products.filter(p => p.categorySlug === categorySlug && p.id !== excludeId).slice(0, 4);
    },
    async getFeatured(): Promise<Product[]> {
      await delay(200);
      return products.filter(p => p.badges.includes('bestseller')).slice(0, 8);
    },
  },
  categories: {
    async getAll(): Promise<Category[]> {
      await delay(200);
      return categories;
    },
    async getBySlug(slug: string): Promise<Category | undefined> {
      await delay(100);
      return categories.find(c => c.slug === slug);
    },
  },
  portfolio: {
    async getAll(): Promise<PortfolioProject[]> {
      await delay(300);
      return portfolioProjects;
    },
    async getBySlug(slug: string): Promise<PortfolioProject | undefined> {
      await delay(200);
      return portfolioProjects.find(p => p.slug === slug);
    },
  },
  promotions: {
    async getAll(): Promise<Promotion[]> {
      await delay(200);
      return promotions;
    },
  },
};
