import { Product } from '@/types';

const DEFAULT_VAT_RATE = 21;
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

const getProductBasePriceWithoutVat = (product: Product) =>
  convertProductPriceToRon(product, product.price);

export const getProductOldPriceWithoutVat = (product: Product) =>
  product.oldPrice == null ? null : convertProductPriceToRon(product, product.oldPrice);

const getVatRate = (product: Product) => {
  const rate = Number(product.vatRate ?? DEFAULT_VAT_RATE);
  return Number.isFinite(rate) && rate >= 0 ? rate : DEFAULT_VAT_RATE;
};

const priceIncludesVat = (product: Product) => product.specs?.priceIncludesVat === true;

const getActivePromotion = (product: Product) => {
  const now = Date.now();

  return product.promotions
    ?.filter((promotion) => {
      if (!promotion.active) return false;
      return new Date(promotion.startDate).getTime() <= now && new Date(promotion.endDate).getTime() >= now;
    })
    .sort((a, b) => Number(b.value) - Number(a.value))[0];
};

const applyPromotion = (product: Product, price: number) => {
  const promotion = getActivePromotion(product);
  if (!promotion) return price;

  const discount =
    promotion.type === 'percentage'
      ? price * (Number(promotion.value) / 100)
      : Number(promotion.value);

  return Math.max(0, price - discount);
};

export const getProductPriceWithVat = (product: Product) => {
  const price = getProductPriceWithoutVat(product);
  return priceIncludesVat(product) ? price : price * (1 + getVatRate(product) / 100);
};

export const getProductOldPriceWithVat = (product: Product) => {
  const oldPrice = getProductOldPriceWithoutVat(product);
  const hasPromotion = Boolean(getActivePromotion(product));
  const basePrice = hasPromotion ? getProductBasePriceWithoutVat(product) : oldPrice;

  return basePrice == null || priceIncludesVat(product)
    ? basePrice
    : basePrice * (1 + getVatRate(product) / 100);
};

export const getProductPriceWithoutVat = (product: Product) =>
  applyPromotion(product, getProductBasePriceWithoutVat(product));

export const getProductLineTotalWithVat = (product: Product, quantity: number) =>
  getProductPriceWithVat(product) * quantity;

export const formatLei = (value: number) =>
  new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);

export const getVatLabel = (product?: Product) => `TVA ${Math.round(product ? getVatRate(product) : DEFAULT_VAT_RATE)}% inclus`;
