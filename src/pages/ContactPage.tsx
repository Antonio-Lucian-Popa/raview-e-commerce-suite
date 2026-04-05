import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Mesajul a fost trimis! Te vom contacta în curând.');
  };

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Contactează-ne</h1>
        <p className="text-muted-foreground">Suntem aici să te ajutăm. Vizitează-ne în showroom sau trimite-ne un mesaj.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <div className="space-y-6 mb-8">
            {[
              { icon: MapPin, title: 'Adresă', text: 'Bacău, Str. Gheorghe Donici Nr.2' },
              { icon: Phone, title: 'Telefon', text: '0743 687 059' },
              { icon: Mail, title: 'Email', text: 'contact@raviewlighting.ro' },
              { icon: Clock, title: 'Program', text: 'Luni-Vineri: 9:00-18:00 | Sâmbătă: 9:00-14:00' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2734.5!2d26.9!3d46.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDbCsDMzJzAwLjAiTiAyNsKwNTQnMDAuMCJF!5e0!3m2!1sro!2sro!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Locația RaView Lighting"
            />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="border rounded-lg p-6 space-y-4 h-fit">
          <h3 className="font-display font-semibold text-lg">Trimite un mesaj</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Nume</Label><Input className="mt-1" required /></div>
            <div><Label>Telefon</Label><Input className="mt-1" required /></div>
          </div>
          <div><Label>Email</Label><Input type="email" className="mt-1" required /></div>
          <div><Label>Mesaj</Label><Textarea className="mt-1" rows={5} required /></div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-gold-dark">Trimite Mesajul</Button>
        </form>
      </div>
    </div>
  );
}
