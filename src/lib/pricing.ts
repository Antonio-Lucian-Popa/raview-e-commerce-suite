import { Product } from '@/types';

const VAT_RATE = 0.21;
const DEFAULT_EUR_TO_RON = Number(import.meta.env.VITE_EUR_TO_RON ?? 5);

const getProductCurrency = (product: Product) =>
  String(product.currency ?? product.specs?.currency ?? 'RON').toUpperCase();

const getProductExchangeRate = (product: Product) => {
  const directRate = product.exchangeRate;
  const specsRate = product.specs?.exchangeRate;
  const rate = Number(directRate ?? specsRate ?? DEFAULT_EUR_TO_RON);
  return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_EUR_TO_RON;
};

export const convertProductPriceToRon = (product: Product, price = product.price) => {
  if (getProductCurrency(product) === 'EUR') {
    return price * getProductExchangeRate(product);
  }
  return price;
};

export const getProductPriceWithoutVat = (product: Product) =>
  convertProductPriceToRon(product, product.price);

export const getProductOldPriceWithoutVat = (product: Product) =>
  product.oldPrice == null ? null : convertProductPriceToRon(product, product.oldPrice);

export const getProductPriceWithVat = (product: Product) =>
  getProductPriceWithoutVat(product) * (1 + VAT_RATE);

export const getProductOldPriceWithVat = (product: Product) => {
  const oldPrice = getProductOldPriceWithoutVat(product);
  return oldPrice == null ? null : oldPrice * (1 + VAT_RATE);
};

export const getProductLineTotalWithVat = (product: Product, quantity: number) =>
  getProductPriceWithVat(product) * quantity;

export const formatLei = (value: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);

export const getVatLabel = () => `TVA ${Math.round(VAT_RATE * 100)}% inclus`;
