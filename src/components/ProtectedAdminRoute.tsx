import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const ALLOWED_ROLES = ['super_admin', 'admin', 'editor'];

export function ProtectedAdminRoute() {
  const { isReady, isAuthenticated, hasRole } = useAdminAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
          <h1 className="mt-3 text-2xl font-display font-bold">Verificăm sesiunea</h1>
          <p className="mt-2 text-sm text-muted-foreground">Te conectăm în siguranță la panoul de administrare.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!hasRole(...ALLOWED_ROLES)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
