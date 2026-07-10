import { Sparkles } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "VidRush AI's multi-modal input is a game-changer. I can finally reference a dance video and apply it to any character I want. The motion replication is incredibly accurate!",
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "https://cdn.vidrushai.com/seedance2-assets/avatars/sarah-chen.jpg",
  },
  {
    quote:
      "The reference capability is mind-blowing. I uploaded a film clip and the model perfectly replicated the camera movement and pacing. This is what AI video should be.",
    name: "Marcus Rodriguez",
    role: "Filmmaker",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/marcus-rodriguez.jpg",
  },
  {
    quote:
      "Finally, character consistency that actually works! Faces, clothing, even small text - everything stays consistent throughout the video. VidRush AI solved our biggest problem.",
    name: "Emily Watson",
    role: "Art Director",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/emily-watson.jpg",
  },
  {
    quote:
      "The video extension feature is seamless. I can extend clips naturally and even merge different scenes together. It's like having an AI editor that understands continuity.",
    name: "David Kim",
    role: "Video Editor",
    avatar: "https://cdn.vidrushai.com/seedance2-assets/avatars/david-kim.jpg",
  },
  {
    quote:
      "Being able to reference trending video templates and recreate them with my own style has 10x'd my content output. The multi-modal approach just makes sense.",
    name: "Priya Sharma",
    role: "Social Media Manager",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/priya-sharma.jpg",
  },
  {
    quote:
      "The audio generation feature is incredibly useful. I can generate videos with perfectly synced soundtracks without searching for stock music.",
    name: "Alex Turner",
    role: "Music Producer",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/alex-turner.jpg",
  },
  {
    quote:
      "As an educator, VidRush AI helps me create engaging visual explanations for complex topics. My students love the animated lessons.",
    name: "Jessica Liu",
    role: "Online Educator",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/jessica-liu.jpg",
  },
  {
    quote:
      "The consistency across multiple shots is unmatched. I can generate a full brand campaign and every video looks like it came from the same production house.",
    name: "Mohammed Hassan",
    role: "Brand Strategist",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/mohammed-hassan.jpg",
  },
  {
    quote:
      "Real estate walkthroughs used to take days. Now I can turn a few photos into a cinematic tour in minutes. My clients are amazed.",
    name: "Olivia Martinez",
    role: "Real Estate Agent",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/olivia-martinez.jpg",
  },
  {
    quote:
      "I use VidRush AI for pre-visualization on every project. It saves thousands in pre-production costs and helps me communicate ideas clearly.",
    name: "Thomas Anderson",
    role: "Creative Director",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/thomas-anderson.jpg",
  },
  {
    quote:
      "The multi-modal input lets me combine reference videos, images, and music all at once. It's the most intuitive AI video tool I've ever used.",
    name: "Dr. Linda Park",
    role: "Research Scientist",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/dr-linda-park.jpg",
  },
  {
    quote:
      "We create training videos at scale now. The ability to edit existing footage instead of reshooting saves our team countless hours.",
    name: "Robert Chen",
    role: "Corporate Trainer",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/robert-chen.jpg",
  },
  {
    quote:
      "The motion replication is scary good. I uploaded a choreography clip and VidRush AI applied the exact movements to my character on the first try.",
    name: "Aria Johnson",
    role: "Dance Choreographer",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/aria-johnson.jpg",
  },
  {
    quote:
      "From concept to final video, VidRush AI has become an essential part of my creative workflow. The quality keeps getting better.",
    name: "Jake Morrison",
    role: "YouTuber",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/jake-morrison.jpg",
  },
  {
    quote:
      "I create recipe and food content. The camera movement replication helps me achieve professional-looking shots without a film crew.",
    name: "Chef Maria Santos",
    role: "Culinary Creator",
    avatar:
      "https://cdn.vidrushai.com/seedance2-assets/avatars/chef-maria-santos.jpg",
  },
];

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof TESTIMONIALS)[number];
}) {
  return (
    <div className="w-full max-w-xs rounded-2xl border border-border bg-card p-10 shadow-[0_0_15px_rgba(92,88,85,0.12)]">
      <p className="leading-relaxed text-muted-foreground">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="mt-5 flex items-center gap-3">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <div className="font-medium leading-5 tracking-tight text-foreground">
            {testimonial.name}
          </div>
          <div className="leading-5 tracking-tight text-muted-foreground">
            {testimonial.role}
          </div>
        </div>
      </div>
    </div>
  );
}

function MarqueeColumn({
  items,
  direction,
  speed,
}: {
  items: typeof TESTIMONIALS;
  direction: "up" | "down";
  speed: "fast" | "slow" | "normal";
}) {
  const speedClass =
    speed === "fast"
      ? "animate-sd-scroll-up"
      : speed === "slow"
        ? "animate-sd-scroll-up-slow"
        : "animate-sd-scroll-down";
  const animationClass =
    direction === "up" ? speedClass : "animate-sd-scroll-down";

  return (
    <div className="flex flex-col gap-6 pb-6 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
      <div className={`flex flex-col gap-6 ${animationClass}`}>
        {items.map((t, i) => (
          <TestimonialCard key={`a-${i}`} testimonial={t} />
        ))}
        {items.map((t, i) => (
          <TestimonialCard key={`b-${i}`} testimonial={t} />
        ))}
      </div>
    </div>
  );
}

export function SeedanceTestimonials() {
  const col1 = TESTIMONIALS.slice(0, 5);
  const col2 = TESTIMONIALS.slice(5, 10);
  const col3 = TESTIMONIALS.slice(10, 15);

  return (
    <section className="relative bg-background py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto">
        <div className="mx-auto flex flex-col items-center justify-center px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Testimonials
            </span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Loved by Creators Worldwide
          </h2>
          <p className="mt-6 max-w-3xl text-center text-lg leading-relaxed text-muted-foreground">
            See what our customers have to say about VidRush AI and how
            it&apos;s transforming their creative workflows.
          </p>
        </div>

        <div className="mx-auto mt-16 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
          <div className="hidden lg:block">
            <MarqueeColumn items={col1} direction="up" speed="normal" />
          </div>
          <div className="hidden sm:block">
            <MarqueeColumn items={col2} direction="down" speed="slow" />
          </div>
          <div>
            <MarqueeColumn items={col3} direction="up" speed="fast" />
          </div>
        </div>
      </div>
    </section>
  );
}
