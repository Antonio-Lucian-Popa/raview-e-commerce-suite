import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'ravlux-cookie-consent';

type CookieConsentValue = 'accepted' | 'rejected';

export function CookieConsent() {
  const [choice, setChoice] = useState<CookieConsentValue | null>('accepted');

  useEffect(() => {
    setChoice(localStorage.getItem(COOKIE_CONSENT_KEY) as CookieConsentValue | null);
  }, []);

  const saveChoice = (value: CookieConsentValue) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
    setChoice(value);
  };

  if (choice) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-4xl rounded-lg border border-border bg-background p-4 shadow-2xl md:flex md:items-center md:gap-5">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">Preferințe cookies</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Folosim cookies strict necesare pentru funcționarea site-ului. Cookie-urile analitice sau de
          marketing se activează doar cu acordul tău. Detalii în{' '}
          <Link to="/cookies" className="font-medium text-accent underline-offset-4 hover:underline">
            Politica de Cookies
          </Link>
          .
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row md:mt-0">
        <Button variant="outline" size="sm" onClick={() => saveChoice('rejected')}>
          Respinge
        </Button>
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-gold-dark" onClick={() => saveChoice('accepted')}>
          Acceptă
        </Button>
      </div>
    </div>
  );
}
