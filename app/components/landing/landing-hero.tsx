import type { LandingHero as LandingHeroProps } from "~/types/landingpage";
import { RichText } from "../rich-text";
import { LandingActionRow } from "./landing-actions";
import { shouldRenderSection } from "./landing-visibility";

export function LandingHero({
  section,
  onShowWorkspace,
}: {
  section?: LandingHeroProps;
  onShowWorkspace?: () => void;
}) {
  if (!shouldRenderSection(section)) {
    return null;
  }

  return (
    <section
      id={section.id ?? "hero"}
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8 lg:pt-32 lg:pb-24"
    >
      <div className="absolute inset-0 bg-background" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#050507_0%,rgba(5,5,7,0.95)_34%,rgba(5,5,7,0.72)_62%,rgba(5,5,7,0.96)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,#050507_78%)]" />
      <div className="pointer-events-none absolute top-24 left-4 h-px w-1/2 bg-[linear-gradient(90deg,#00d992,transparent)] opacity-70" />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex animate-fade-in flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex flex-col text-center lg:flex-1 lg:text-left">
            <h1 className="text-balance font-display font-normal text-5xl text-foreground leading-none tracking-[-0.02em] sm:text-6xl lg:text-7xl">
              <RichText text={section.title} />
            </h1>
            <div className="mt-6 max-w-2xl text-pretty text-muted-foreground text-base leading-8 sm:text-lg">
              <RichText text={section.description} />
            </div>

            <LandingActionRow
              buttons={section.buttons}
              onShowWorkspace={onShowWorkspace}
              className="mt-8 justify-center lg:justify-start"
              buttonClassName="rounded-xl"
            />
          </div>

          {section.image && (
            <div className="w-full max-w-sm lg:max-w-md lg:shrink-0">
              <img
                src={section.image.src}
                alt={section.image.alt}
                className="w-full rounded-2xl border border-white/[0.06] shadow-[0_0_80px_rgba(255,107,107,0.08)]"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
