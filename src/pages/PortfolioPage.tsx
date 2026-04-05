import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageSkeleton } from '@/components/LoadingSkeletons';
import { api } from '@/lib/api';

export default function PortfolioPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.portfolio.getAll(),
  });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ label: 'Portofoliu' }]} />
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Portofoliul Nostru</h1>
        <p className="text-muted-foreground">Inspiră-te din proiectele noastre de iluminat realizate.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {projects?.map(project => (
          <Link
            key={project.id}
            to={`/portfolio/${project.slug}`}
            className="group relative aspect-[16/10] rounded-xl overflow-hidden hover-lift"
          >
            <img
              src={project.coverImage || project.gallery?.[0] || '/placeholder.svg'}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="text-xs uppercase tracking-wider text-accent font-medium">
                {project.clientName || 'Proiect realizat'}
                {project.completedAt ? ` · ${new Date(project.completedAt).toLocaleDateString('ro-RO')}` : ''}
              </span>
              <h3 className="text-xl font-display font-bold text-background mt-1">{project.title}</h3>
              <p className="text-sm text-background/70 mt-1 line-clamp-2">{project.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
