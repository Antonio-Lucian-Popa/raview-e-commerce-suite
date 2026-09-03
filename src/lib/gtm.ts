import { Product } from '@/types';
import { getProductPriceWithVat } from '@/lib/pricing';

/**
 * Google Tag Manager + GDPR consent (Consent Mode v2) integration.
 *
 * The GTM container id is read from the `VITE_GTM_ID` environment variable
 * (format `GTM-XXXXXXX`). When it is missing (local dev, preview builds), the
 * integration stays completely inert — no script is injected and every helper
 * becomes a no-op, so nothing breaks and no analytics run.
 *
 * Marketing/analytics tags are gated behind the cookie banner: consent defaults
 * to "denied" and is only upgraded to "granted" once the visitor accepts, in
 * line with the promise made in the consent banner and RO/EU (GDPR) rules.
 */

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
  return Boolean(GTM_ID);
}

/** Low-level push to the GTM dataLayer. Safe to call even when GTM is disabled. */
export function pushToDataLayer(data: DataLayerObject): void {
  if (typeof window === 'undefined') return;
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

const STORED_CONSENT_KEY = 'ravlux-cookie-consent';

function readStoredConsent(): 'accepted' | 'rejected' | null {
  try {
    return localStorage.getItem(STORED_CONSENT_KEY) as 'accepted' | 'rejected' | null;
  } catch {
    return null;
  }
}

/**
 * Registers the default (denied) consent state. MUST run before the GTM
 * container loads so that tags never fire before the visitor has accepted.
 */
function initConsentDefault(): void {
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  });
  // Preserve ad-click / session info through the URL while cookies are denied.
  gtag('set', 'url_passthrough', true);
  gtag('set', 'ads_data_redaction', true);
}

/** Upgrades or downgrades consent after the visitor makes a choice. */
export function updateConsent(granted: boolean): void {
  if (!isGtmConfigured()) return;
  const value = granted ? 'granted' : 'denied';
  gtag('consent', 'update', {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

// ---------------------------------------------------------------------------
// Container bootstrap
// ---------------------------------------------------------------------------

let bootstrapped = false;

/**
 * Initialises consent defaults and injects the GTM container script.
 * Call once, as early as possible (before React renders).
 */
export function bootstrapGtm(): void {
  if (bootstrapped || !GTM_ID || typeof window === 'undefined') return;
  bootstrapped = true;

  window.dataLayer = window.dataLayer ?? [];

  // 1. Consent defaults (denied) — before anything else lands in the dataLayer.
  initConsentDefault();

  // 2. Honour a previously stored acceptance so returning visitors are tracked.
  if (readStoredConsent() === 'accepted') {
    updateConsent(true);
  }

  // 3. Standard GTM start marker + async container script.
  pushToDataLayer({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  document.head.appendChild(script);

  // 4. <noscript> fallback for the rare no-JS crawler.
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(GTM_ID)}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);
  document.body.appendChild(noscript);
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
