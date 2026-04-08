import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Package2, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const { isAuthenticated, isReady, login } = useAdminAuth();
  const [email, setEmail] = useState('admin@lighting.local');
  const [password, setPassword] = useState('Admin1234!');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/admin';

  const loginMutation = useMutation({
    mutationFn: async () => login(email, password),
    onSuccess: () => {
      toast.success('Autentificare reușită.');
      navigate(from, { replace: true });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isReady, navigate]);

  if (isReady && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-5xl grid overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden bg-gradient-dark p-8 md:p-12 text-primary-foreground flex flex-col justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,206,84,0.15),transparent_40%)]" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.3em] text-accent">RaView Admin</p>
            <h1 className="mt-4 text-3xl font-display font-bold leading-tight md:text-4xl">
              Administrează-ți magazinul rapid și simplu.
            </h1>
            <p className="mt-4 text-sm leading-7 text-primary-foreground/70">
              Gestionează produse, categorii, promoții și comenzi dintr-un singur loc.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Package2 className="h-5 w-5 text-accent" />
                <p className="mt-3 font-medium">Catalog complet</p>
                <p className="mt-1 text-sm text-primary-foreground/65">Produse, categorii și branduri într-un singur dashboard.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Megaphone className="h-5 w-5 text-accent" />
                <p className="mt-3 font-medium">Campanii și comenzi</p>
                <p className="mt-1 text-sm text-primary-foreground/65">Promoții active și comenzi recente la vedere.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-display font-bold">Autentificare</h2>
          <p className="mt-2 text-sm text-muted-foreground">Intră cu contul tău de administrator.</p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void loginMutation.mutateAsync();
            }}
            className="mt-6 space-y-4"
          >
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 h-11" placeholder="email@exemplu.ro" />
            </div>
            <div>
              <Label htmlFor="admin-password">Parolă</Label>
              <Input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-11" placeholder="••••••••" />
            </div>
            <Button type="submit" className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loginMutation.isPending || !isReady}>
              {loginMutation.isPending ? 'Se autentifică...' : 'Intră în cont'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
