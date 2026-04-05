import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageSkeleton } from '@/components/LoadingSkeletons';
import { ErrorState } from '@/components/EmptyError';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function PortfolioDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading } = useQuery({
    queryKey: ['portfolio', slug],
    queryFn: () => api.portfolio.getBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) return <PageSkeleton />;
  if (!project) return <ErrorState message="Proiectul nu a fost găsit." />;

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ label: 'Portofoliu', href: '/portfolio' }, { label: project.title }]} />
      <div className="max-w-3xl mx-auto">
        <span className="text-sm uppercase tracking-wider text-accent font-medium">{project.category} · {project.location}</span>
        <h1 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-6">{project.title}</h1>
        <div className="space-y-4 mb-8">
          {project.images.map((img, i) => (
            <img key={i} src={img} alt={`${project.title} ${i + 1}`} className="w-full rounded-xl" loading="lazy" />
          ))}
        </div>
        <p className="text-muted-foreground leading-relaxed mb-8">{project.description}</p>
        <Button variant="outline" asChild>
          <Link to="/portfolio">← Înapoi la portofoliu</Link>
        </Button>
      </div>
    </div>
  );
}
