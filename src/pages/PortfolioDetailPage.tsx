import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PageSkeleton } from '@/components/LoadingSkeletons';
import { ErrorState } from '@/components/EmptyError';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';

export default function PortfolioDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { data: project, isLoading } = useQuery({
    queryKey: ['portfolio', slug],
    queryFn: () => api.portfolio.getBySlug(slug!),
    enabled: !!slug,
  });
  const galleryImages = useMemo(
    () => (project?.gallery?.length ? project.gallery : [project?.coverImage || '/placeholder.svg']),
    [project?.coverImage, project?.gallery],
  );
  const activeImage = galleryImages[selectedImage] ?? galleryImages[0] ?? '/placeholder.svg';
  const showPreviousImage = () => {
    setSelectedImage((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };
  const showNextImage = () => {
    setSelectedImage((current) => (current + 1) % galleryImages.length);
  };

  if (isLoading) return <PageSkeleton />;
  if (!project) return <ErrorState message="Proiectul nu a fost găsit." />;

  return (
    <div className="container-page pb-16">
      <Breadcrumbs items={[{ label: 'Portofoliu', href: '/portfolio' }, { label: project.title }]} />
      <div className="mx-auto max-w-5xl">
        <span className="text-sm uppercase tracking-wider text-accent font-medium">
          {project.clientName || 'Proiect Ravlux'}
          {project.completedAt ? ` · ${new Date(project.completedAt).toLocaleDateString('ro-RO')}` : ''}
        </span>
        <h1 className="text-3xl md:text-4xl font-display font-bold mt-2 mb-6">{project.title}</h1>
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => {
                setSelectedImage(i);
                setPreviewOpen(true);
              }}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border/70 bg-secondary text-left transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Deschide imaginea ${i + 1}`}
            >
              <img
                src={img}
                alt={`${project.title} ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-md bg-background/90 px-3 py-2 text-xs font-medium text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <ZoomIn className="h-4 w-4" />
                Mărește
              </span>
            </button>
          ))}
        </div>
        <p className="text-muted-foreground leading-relaxed mb-8">{project.description}</p>
        <Button variant="outline" asChild>
          <Link to="/portfolio">← Înapoi la portofoliu</Link>
        </Button>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[96vh] w-[96vw] max-w-6xl border-0 bg-background p-3 shadow-xl sm:p-4">
          <DialogTitle className="sr-only">{project.title}</DialogTitle>
          <div className="relative flex max-h-[calc(96vh-2rem)] items-center justify-center overflow-hidden rounded-md bg-secondary">
            <img
              src={activeImage}
              alt={`${project.title} ${selectedImage + 1}`}
              className="max-h-[calc(96vh-2rem)] w-auto max-w-full object-contain"
            />
            {galleryImages.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90 shadow-sm sm:left-4"
                  onClick={showPreviousImage}
                  aria-label="Imaginea precedentă"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90 shadow-sm sm:right-4"
                  onClick={showNextImage}
                  aria-label="Imaginea următoare"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                  {selectedImage + 1} / {galleryImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
