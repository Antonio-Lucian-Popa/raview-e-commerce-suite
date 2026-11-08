import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { updateConsent } from '@/lib/gtm';
import { CONSENT_KEY, CONSENT_EVENT, OPEN_CONSENT_EVENT, readConsent, saveConsent } from '@/lib/consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(() => !readConsent());
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const open = () => {
      const saved = readConsent();
      setAnalytics(saved?.analytics ?? false);
      setMarketing(saved?.marketing ?? false);
      setCustomize(true);
      setVisible(true);
    };
    const sync = () => { updateConsent(); setVisible(!readConsent()); };
    const storage = (event: StorageEvent) => { if (event.key === CONSENT_KEY || event.key === null) sync(); };
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', storage);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener(OPEN_CONSENT_EVENT, open);
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', storage);
      window.removeEventListener('focus', sync);
    };
  }, []);

  const save = (allowAnalytics: boolean, allowMarketing: boolean) => {
    if (!saveConsent(allowAnalytics, allowMarketing)) {
      // Fail closed: optional tracking stays off if the browser cannot retain the choice.
      setError(true);
      if (!allowAnalytics && !allowMarketing) setVisible(false);
      return;
    }
    setError(false);
    setVisible(false);
    setCustomize(false);
  };

  if (!visible) return null;
  return (
    <section aria-label="Preferințe cookies" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-h-[85vh] max-w-4xl overflow-y-auto rounded-xl border border-border bg-background p-5 shadow-2xl">
      <h2 className="text-base font-semibold">Tu alegi ce cookies accepți</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Folosim stocare strict necesară pentru funcționarea magazinului. Cu acordul tău, Google poate fi folosit pentru analiza traficului și pentru publicitate. Poți refuza și cumpăra în continuare. Îți poți retrage acordul din „Setări cookies” în subsolul site-ului. <Link to="/cookies" className="underline">Politica cookies</Link> · <Link to="/privacy" className="underline">Confidențialitate</Link>.
      </p>
      {customize && <fieldset className="mt-4 space-y-3 rounded-lg border p-4 text-sm">
        <legend className="px-1 font-medium">Alege scopurile opționale</legend>
        <p>Strict necesare: active permanent. Preferința este păstrată timp de 180 de zile.</p>
        <label className="flex items-start gap-3"><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="mt-1" /><span><strong>Analiză</strong> — măsurarea vizitelor și a utilizării magazinului prin serviciile Google configurate.</span></label>
        <label className="flex items-start gap-3"><input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} className="mt-1" /><span><strong>Marketing</strong> — măsurarea campaniilor și publicitate personalizată prin serviciile Google configurate.</span></label>
      </fieldset>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">Browserul nu permite salvarea preferinței. Serviciile opționale rămân oprite în lipsa unui acord salvat.</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => save(false, false)}>Respinge opționalele</Button>
        <Button variant="outline" onClick={() => save(true, true)}>Acceptă toate</Button>
        {customize
          ? <Button onClick={() => save(analytics, marketing)}>Salvează preferințele</Button>
          : <Button variant="outline" onClick={() => setCustomize(true)}>Personalizează</Button>}
      </div>
    </section>
  );
}
