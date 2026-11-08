export const CONSENT_KEY = 'ravlux-cookie-consent';
export const CONSENT_EVENT = 'ravlux:consent-change';
export const OPEN_CONSENT_EVENT = 'ravlux:cookie-settings';
export const CONSENT_LIFETIME = 180 * 24 * 60 * 60 * 1000;
export interface CookiePreferences {
  version: 3;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export function readConsent(): CookiePreferences | null {
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    if (saved?.version !== 3 || typeof saved.analytics !== 'boolean' ||
      typeof saved.marketing !== 'boolean' || !Number.isFinite(saved.timestamp) ||
      saved.timestamp > Date.now() || Date.now() - saved.timestamp >= CONSENT_LIFETIME) return null;
    return saved;
  } catch { return null; }
}

export function saveConsent(analytics: boolean, marketing: boolean): boolean {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 3, analytics, marketing, timestamp: Date.now() }));
    window.dispatchEvent(new Event(CONSENT_EVENT));
    return true;
  } catch { return false; }
}
