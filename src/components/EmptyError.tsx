import { AlertTriangle, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function ErrorState({ message = 'A apărut o eroare.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive/40 mb-4" />
      <p className="font-medium text-lg">{message}</p>
      {onRetry && <Button className="mt-4" onClick={onRetry}>Încearcă din nou</Button>}
    </div>
  );
}

export function EmptyState({ title = 'Niciun rezultat', description = 'Nu am găsit nimic.', actionLabel, actionHref }: { title?: string; description?: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <PackageX className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <p className="font-medium text-lg">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      {actionLabel && actionHref && (
        <Button className="mt-4" asChild>
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
