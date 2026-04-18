import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex w-full min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap py-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link to="/" className="shrink-0 transition-colors hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const labelClassName = `block truncate ${isLast ? 'max-w-full' : 'max-w-28 sm:max-w-none'}`;

        return (
        <span key={i} className={`flex min-w-0 items-center gap-1 ${isLast ? 'flex-1' : 'shrink-0'}`}>
          <ChevronRight className="h-3 w-3 shrink-0" />
          {item.href ? (
            <Link to={item.href} className={`${labelClassName} transition-colors hover:text-foreground`}>{item.label}</Link>
          ) : (
            <span className={`${labelClassName} font-medium text-foreground`}>{item.label}</span>
          )}
        </span>
        );
      })}
    </nav>
  );
}
