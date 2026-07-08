import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

const VIDEO_BASE = "https://cdn.vidrushai.com/seedance2-assets";

const GALLERY_ITEMS = [
  {
    id: 1,
    videoNum: 1,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-1.webp",
    alt: "Seedance 2.0 Video 1",
  },
  {
    id: 2,
    videoNum: 2,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-2.webp",
    alt: "Seedance 2.0 Video 2",
  },
  {
    id: 3,
    videoNum: 19,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-19.webp",
    alt: "Seedance 2.0 Video 3",
  },
  {
    id: 4,
    videoNum: 4,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-4.webp",
    alt: "Seedance 2.0 Video 4",
  },
  {
    id: 5,
    videoNum: 5,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-5.webp",
    alt: "Seedance 2.0 Video 5",
  },
  {
    id: 6,
    videoNum: 17,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-17.webp",
    alt: "Seedance 2.0 Video 6",
  },
  {
    id: 7,
    videoNum: 40,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-40.webp",
    alt: "Seedance 2.0 Video 7",
  },
  {
    id: 8,
    videoNum: 8,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-8.webp",
    alt: "Seedance 2.0 Video 8",
  },
  {
    id: 9,
    videoNum: 14,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-14.webp",
    alt: "Seedance 2.0 Video 9",
  },
  {
    id: 10,
    videoNum: 10,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-10.webp",
    alt: "Seedance 2.0 Video 10",
  },
  {
    id: 11,
    videoNum: 30,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-30.webp",
    alt: "Seedance 2.0 Video 11",
  },
  {
    id: 12,
    videoNum: 38,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-38.webp",
    alt: "Seedance 2.0 Video 12",
  },
  {
    id: 13,
    videoNum: 16,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-16.webp",
    alt: "Seedance 2.0 Video 13",
  },
  {
    id: 14,
    videoNum: 45,
    poster: "https://cdn.vidrushai.com/seedance2-assets/poster-45.webp",
    alt: "Seedance 2.0 Video 14",
  },
];

type GalleryItem = (typeof GALLERY_ITEMS)[number];

function GalleryCard({
  item,
  onPlay,
}: {
  item: GalleryItem;
  onPlay: (item: GalleryItem) => void;
}) {
  return (
    <div className="mb-4 break-inside-avoid">
      <button
        type="button"
        onClick={() => onPlay(item)}
        aria-label={`Play ${item.alt}`}
        className="group relative block w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left shadow-lg transition-all duration-300 hover:border-primary/70 hover:shadow-[0_0_15px_rgba(0,217,146,0.14)]"
      >
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
      </button>
    </div>
  );
}

function VideoLightbox({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          className="aspect-video h-auto w-full bg-black"
          src={`${VIDEO_BASE}/video-${item.videoNum}.mp4`}
          poster={item.poster}
          controls
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    </div>
  );
}

export function SeedanceGallery() {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

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
            <GalleryCard key={item.id} item={item} onPlay={setActiveItem} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            asChild
            className="rounded-full bg-card px-8 py-3 font-medium text-primary hover:bg-card/80 hover:text-primary"
          >
            <a
              href="https://seedance2.ai/showcase"
              target="_blank"
              rel="noreferrer"
            >
              View More Showcases
              <Play className="ml-2 h-4 w-4" fill="currentColor" />
            </a>
          </Button>
        </div>
      </div>

      {activeItem && (
        <VideoLightbox item={activeItem} onClose={() => setActiveItem(null)} />
      )}
    </section>
  );
}
