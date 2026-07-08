import { ArrowRight, Play } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

const GALLERY_ITEMS = [
  {
    id: 1,
    poster: "/seedance2-assets/poster-1.webp",
    alt: "Seedance 2.0 Video 1",
  },
  {
    id: 2,
    poster: "/seedance2-assets/poster-2.webp",
    alt: "Seedance 2.0 Video 2",
  },
  {
    id: 3,
    poster: "/seedance2-assets/poster-19.webp",
    alt: "Seedance 2.0 Video 3",
  },
  {
    id: 4,
    poster: "/seedance2-assets/poster-4.webp",
    alt: "Seedance 2.0 Video 4",
  },
  {
    id: 5,
    poster: "/seedance2-assets/poster-5.webp",
    alt: "Seedance 2.0 Video 5",
  },
  {
    id: 6,
    poster: "/seedance2-assets/poster-17.webp",
    alt: "Seedance 2.0 Video 6",
  },
  {
    id: 7,
    poster: "/seedance2-assets/poster-40.webp",
    alt: "Seedance 2.0 Video 7",
  },
  {
    id: 8,
    poster: "/seedance2-assets/poster-8.webp",
    alt: "Seedance 2.0 Video 8",
  },
  {
    id: 9,
    poster: "/seedance2-assets/poster-14.webp",
    alt: "Seedance 2.0 Video 9",
  },
  {
    id: 10,
    poster: "/seedance2-assets/poster-10.webp",
    alt: "Seedance 2.0 Video 10",
  },
  {
    id: 11,
    poster: "/seedance2-assets/poster-30.webp",
    alt: "Seedance 2.0 Video 11",
  },
  {
    id: 12,
    poster: "/seedance2-assets/poster-38.webp",
    alt: "Seedance 2.0 Video 12",
  },
  {
    id: 13,
    poster: "/seedance2-assets/poster-16.webp",
    alt: "Seedance 2.0 Video 13",
  },
  {
    id: 14,
    poster: "/seedance2-assets/poster-45.webp",
    alt: "Seedance 2.0 Video 14",
  },
];

function GalleryCard({ item }: { item: (typeof GALLERY_ITEMS)[number] }) {
  return (
    <div className="mb-4 break-inside-avoid">
      <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all duration-300 hover:border-primary/70 hover:shadow-[0_0_15px_rgba(0,217,146,0.14)]">
        <img
          src={item.poster}
          alt={item.alt}
          loading="lazy"
          className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/90 opacity-80 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:opacity-100 md:h-16 md:w-16">
            <Play
              className="ml-1 h-6 w-6 text-foreground md:h-7 md:w-7"
              fill="currentColor"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SeedanceGallery() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Get Inspired
          </h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed text-muted-foreground">
            Explore stunning video examples created with Seedance 2.0&apos;s
            multi-modal capabilities.
          </p>
        </div>

        <div className="w-full columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {GALLERY_ITEMS.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => setShowModal(true)}
            className="rounded-full bg-card px-8 py-3 font-medium text-primary hover:bg-card/80 hover:text-primary"
          >
            View More Showcases
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-card-foreground">
            <p className="text-lg font-medium">More showcases coming soon</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This is a demo clone of the Seedance 2.0 landing page.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
