import { merchant } from '@/lib/merchant';

export function MerchantIdentity() {
  return <div className="space-y-2">
    <p><strong>{merchant.brand}</strong> este numele comercial al magazinului operat de <strong>{merchant.legalName}</strong>, vânzătorul produselor și operatorul datelor personale.</p>
    <dl className="space-y-1">
      <div><dt className="inline font-semibold">CUI: </dt><dd className="inline">{merchant.cui}</dd></div>
      <div><dt className="inline font-semibold">Registrul Comerțului: </dt><dd className="inline">{merchant.tradeRegister}</dd></div>
      <div><dt className="inline font-semibold">Sediu social: </dt><dd className="inline">{merchant.registeredOffice}</dd></div>
      <div><dt className="inline font-semibold">Capital social: </dt><dd className="inline">{merchant.shareCapital}</dd></div>
    </dl>
    <p>Contact: <a href={`mailto:${merchant.email}`}>{merchant.email}</a> · <a href="tel:+40743687059">{merchant.phone}</a>.</p>
    <p>Pentru expedierea produselor returnate, solicită adresa de retur confirmată; sediul social nu este indicat automat ca punct de recepție a coletelor.</p>
  </div>;
}
