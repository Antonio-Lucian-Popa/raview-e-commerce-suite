import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_GTM_ID', 'GTM-TEST123');
  localStorage.clear();
  sessionStorage.clear();
  document.head.querySelectorAll('script').forEach((script) => script.remove());
  window.dataLayer = [];
});

describe('optional cookie consent', () => {
  it('rejects legacy, invalid and expired agreements', async () => {
    const { readConsent, CONSENT_KEY, CONSENT_LIFETIME } = await import('@/lib/consent');
    for (const value of ['accepted', 'broken', JSON.stringify({ version: 3, analytics: true, marketing: true, timestamp: Date.now() - CONSENT_LIFETIME - 1 })]) {
      localStorage.setItem(CONSENT_KEY, value);
      expect(readConsent()).toBeNull();
    }
  });

  it('does not load Google or queue events before agreement or after refusing', async () => {
    const gtm = await import('@/lib/gtm');
    const { saveConsent } = await import('@/lib/consent');
    gtm.bootstrapGtm();
    gtm.trackPageView('/checkout');
    saveConsent(false, false);
    gtm.bootstrapGtm();
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
    expect(window.dataLayer).toEqual([]);
    gtm.storePendingPurchase({ transactionId: 'order', items: [], value: 100 });
    expect(sessionStorage.getItem('ravlux:pending_purchase')).toBeNull();
  });

  it('keeps analytics and advertising choices separate and loads a single container', async () => {
    const { saveConsent, readConsent } = await import('@/lib/consent');
    saveConsent(false, true);
    const gtm = await import('@/lib/gtm');
    gtm.bootstrapGtm();
    gtm.bootstrapGtm();
    gtm.trackPageView('/shop');
    expect(document.querySelectorAll('script[src*="googletagmanager"]')).toHaveLength(1);
    expect(readConsent()).toMatchObject({ analytics: false, marketing: true });
    expect(window.dataLayer?.some((item) => item.event === 'page_view')).toBe(false);
    const command = window.dataLayer?.[0] as unknown as IArguments;
    expect(command[2]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'granted' });
  });
});
