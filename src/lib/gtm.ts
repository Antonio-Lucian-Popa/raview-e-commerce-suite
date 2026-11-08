import { Product } from '@/types';
import { getProductPriceWithVat } from '@/lib/pricing';

import { readConsent } from '@/lib/consent';

/** Google scripts are loaded only after explicit consent to an optional purpose. */
const GTM_ID = (import.meta.env.VITE_GTM_ID as string | undefined)?.trim();

// Currency reported to GA4. Prices are normalised to RON incl. VAT in `toGa4Item`.
const CURRENCY = 'RON';

// Keeps the purchase payload alive across the Stripe redirect (see checkout flow).
const PENDING_PURCHASE_KEY = 'ravlux:pending_purchase';

type DataLayerObject = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerObject[];
  }
}

export function isGtmConfigured(): boolean {
  return Boolean(GTM_ID && /^GTM-[A-Z0-9]+$/.test(GTM_ID));
}

/** Low-level push to the GTM dataLayer. Safe to call even when GTM is disabled. */
export function pushToDataLayer(data: DataLayerObject): void {
  if (typeof window === 'undefined' || !readConsent()?.analytics) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(data);
}

// Google's canonical gtag shim — it forwards its arguments to the dataLayer.
function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  // GTM expects the raw `arguments` object, not a normal array.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments as unknown as DataLayerObject);
}

// ---------------------------------------------------------------------------
// Consent Mode v2
// ---------------------------------------------------------------------------

let bootstrapped = false;
let loadedPreferences: { analytics: boolean; marketing: boolean } | null = null;

/** Stop loaded tags on revocation; a removed script alone would not stop its timers. */
export function updateConsent(): void {
  const preferences = readConsent();
  const analytics = preferences?.analytics === true;
  const marketing = preferences?.marketing === true;
  if (bootstrapped && loadedPreferences &&
    ((loadedPreferences.analytics && !analytics) || (loadedPreferences.marketing && !marketing))) {
    gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl_|_fbp)/.test(name)) continue;
      const labels = location.hostname.split('.');
      for (const domain of ['', ...labels.map((_, i) => labels.slice(i).join('.'))]) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
      }
    }
    try { sessionStorage.removeItem(PENDING_PURCHASE_KEY); } catch { /* unavailable */ }
    window.location.reload();
    return;
  }
  if (!bootstrapped) { bootstrapGtm(); return; }
  loadedPreferences = { analytics, marketing };
  gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
  });
}

export function bootstrapGtm(): void {
  const preferences = readConsent();
  if (bootstrapped || !isGtmConfigured() || typeof window === 'undefined' ||
    (!preferences?.analytics && !preferences?.marketing)) return;
  bootstrapped = true;
  loadedPreferences = preferences;
  window.dataLayer = [];
  gtag('consent', 'default', {
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
    ad_storage: preferences.marketing ? 'granted' : 'denied',
    ad_user_data: preferences.marketing ? 'granted' : 'denied',
    ad_personalization: preferences.marketing ? 'granted' : 'denied',
  });
  gtag('set', 'ads_data_redaction', true);
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID!)}`;
  document.head.appendChild(script);
}

// ---------------------------------------------------------------------------
// Page views (SPA route changes)
// ---------------------------------------------------------------------------

export function trackPageView(path: string, title?: string): void {
  if (!isGtmConfigured()) return;
  pushToDataLayer({
    event: 'page_view',
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : path,
    page_title: title ?? (typeof document !== 'undefined' ? document.title : undefined),
  });
}

// ---------------------------------------------------------------------------
// E-commerce events (GA4 / Google Ads schema)
// ---------------------------------------------------------------------------

const round2 = (value: number) => Math.round(value * 100) / 100;

export interface Ga4Item {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price: number;
  quantity: number;
}

/** Maps a store Product into a GA4 `items[]` entry (price in RON incl. VAT). */
export function toGa4Item(product: Product, quantity = 1): Ga4Item {
  return {
    item_id: product.sku || product.id,
    item_name: product.name,
    item_brand: product.brand?.name ?? undefined,
    item_category: product.category?.name ?? undefined,
    price: round2(getProductPriceWithVat(product)),
    quantity,
  };
}

const itemsValue = (items: Ga4Item[]) =>
  round2(items.reduce((sum, item) => sum + item.price * item.quantity, 0));

/**
 * Pushes a GA4 e-commerce event. The `ecommerce: null` reset clears any
 * previous ecommerce object so values from earlier events never bleed through.
 */
function pushEcommerce(event: string, ecommerce: DataLayerObject): void {
  if (!isGtmConfigured()) return;
  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({ event, ecommerce: { currency: CURRENCY, ...ecommerce } });
}

export function trackViewItem(product: Product): void {
  const item = toGa4Item(product);
  pushEcommerce('view_item', { value: item.price, items: [item] });
}

export function trackAddToCart(product: Product, quantity = 1): void {
  const item = toGa4Item(product, quantity);
  pushEcommerce('add_to_cart', { value: itemsValue([item]), items: [item] });
}

export function trackRemoveFromCart(product: Product, quantity = 1): void {
  const item = toGa4Item(product, quantity);
  pushEcommerce('remove_from_cart', { value: itemsValue([item]), items: [item] });
}

export function trackBeginCheckout(items: Ga4Item[], coupon?: string): void {
  pushEcommerce('begin_checkout', {
    value: itemsValue(items),
    coupon: coupon || undefined,
    items,
  });
}

export interface PurchasePayload {
  transactionId: string;
  items: Ga4Item[];
  value: number;
  shipping?: number;
  tax?: number;
  coupon?: string;
}

export function trackPurchase(payload: PurchasePayload): void {
  pushEcommerce('purchase', {
    transaction_id: payload.transactionId,
    value: round2(payload.value),
    shipping: payload.shipping != null ? round2(payload.shipping) : undefined,
    tax: payload.tax != null ? round2(payload.tax) : undefined,
    coupon: payload.coupon || undefined,
    items: payload.items,
  });
}

// ---------------------------------------------------------------------------
// Pending purchase (survives the Stripe redirect)
// ---------------------------------------------------------------------------

/** Stashes the purchase payload just before redirecting to the payment provider. */
export function storePendingPurchase(payload: PurchasePayload): void {
  if (!isGtmConfigured() || !readConsent()?.analytics) return;
  try {
    sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage unavailable (private mode / quota) — purchase tracking is
    // best-effort, so silently skip rather than break the checkout flow.
  }
}

/**
 * Fires the `purchase` event for a completed order, exactly once. Returns true
 * when an event was sent. The stored payload is removed so a page refresh on
 * the success screen never double-counts the conversion.
 */
export function flushPendingPurchase(orderId: string | null): boolean {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(PENDING_PURCHASE_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;

  let payload: PurchasePayload | null = null;
  try {
    payload = JSON.parse(raw) as PurchasePayload;
  } catch {
    payload = null;
  }

  // Only report when it matches the order shown on the success page.
  if (!payload || (orderId && payload.transactionId !== orderId)) return false;

  try {
    sessionStorage.removeItem(PENDING_PURCHASE_KEY);
  } catch {
    /* ignore */
  }

  trackPurchase(payload);
  return true;
}
