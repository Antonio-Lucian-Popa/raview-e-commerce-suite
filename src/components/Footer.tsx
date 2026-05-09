import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';

const footerLinks = {
  'Categorii': [
    { label: 'Iluminat Interior', href: '/category/interior' },
    { label: 'Iluminat Exterior', href: '/category/exterior' },
    { label: 'Decorativ', href: '/category/decorativ' },
    { label: 'Arhitectural', href: '/category/arhitectural' },
    { label: 'Smart Home', href: '/category/smarthome' },
  ],
  'Informații': [
    { label: 'Despre noi', href: '/contact' },
    { label: 'Portofoliu', href: '/portfolio' },
    { label: 'Oferte', href: '/promotions' },
    { label: 'Termeni și condiții', href: '/terms' },
    { label: 'Politica de confidențialitate', href: '/privacy' },
    { label: 'Politica cookies', href: '/cookies' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-page section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-2xl font-display font-bold">
              Rav<span className="text-gradient-gold">lux</span>
            </span>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Redefinim spațiul prin lumină. Showroom dedicat iluminatului interior și exterior în Bacău.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">{title}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-foreground/80">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/60">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
                Bacău, Str. Gheorghe Donici Nr.2
              </li>
              <li>
                <a href="tel:0743687059" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                  <Phone className="h-4 w-4 shrink-0 text-accent" /> 0743 687 059
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Mail className="h-4 w-4 shrink-0 text-accent" /> contact@raviewlighting.ro
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <Clock className="h-4 w-4 shrink-0 text-accent" /> Lun-Vin: 9-18 | Sâm: 9-14
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">© {new Date().getFullYear()} Ravlux Lighting. Toate drepturile rezervate.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">Termeni</Link>
            <Link to="/privacy" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">Confidențialitate</Link>
            <Link to="/cookies" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
