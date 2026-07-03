import { cn } from "~/lib/utils";
import type { LandingSplitSection } from "~/types/landingpage";
import { RichText } from "../rich-text";
import { LandingIcon, LandingIconBadge } from "./landing-icons";
import { LandingSectionHeading } from "./landing-section-heading";
import { shouldRenderSection } from "./landing-visibility";

export function LandingSplitSectionBlock({
  section,
}: {
  section?: LandingSplitSection;
}) {
  if (!shouldRenderSection(section)) {
    return null;
  }

  const imageFirst = section.imagePosition === "left";

  return (
    <section id={section.id} className="relative px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          className={cn(
            "grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center",
            imageFirst && "lg:grid-cols-[1.1fr_0.9fr]",
          )}
        >
          <div className={cn(imageFirst ? "lg:order-2" : "lg:order-1")}>
            <LandingSectionHeading
              title={section.title}
              description={section.description}
              align="left"
              className="mb-8 max-w-xl"
            />

            <div className="flex flex-col gap-4">
              {section.items.map((item) => (
                <article
                  key={item.title}
                  className="rounded-lg border bg-card/90 p-5 shadow-[0_0_15px_rgba(92,88,85,0.12)] transition-all duration-300 hover:border-primary/60"
                >
                  <div className="flex items-start gap-4">
                    <LandingIconBadge className="mt-0.5">
                      <LandingIcon name={item.icon} className="size-5" />
                    </LandingIconBadge>
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground text-lg">
                        {item.title}
                      </h3>
                      <div className="mt-2 text-muted-foreground text-sm leading-7">
                        <RichText text={item.description} />
                      </div>
                      {item.bullets?.length ? (
                        <ul className="mt-4 flex flex-col gap-2">
                          {item.bullets.map((bullet) => (
                            <li
                              key={bullet}
                              className="flex items-start gap-2 text-muted-foreground text-sm"
                            >
                              <LandingIcon
                                name="check"
                                className="mt-1 size-4 shrink-0 text-primary"
                              />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className={cn(imageFirst ? "lg:order-1" : "lg:order-2")}>
            <div className="relative overflow-hidden rounded-lg border bg-card shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
              {section.image ? (
                <img
                  src={section.image.src}
                  alt={section.image.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-auto max-h-[520px] w-full object-contain opacity-80 grayscale-[15%] transition duration-700 hover:scale-[1.02] hover:opacity-95"
                />
              ) : null}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_70%,rgba(5,5,7,0.5))]" />
              <div className="pointer-events-none absolute right-5 bottom-5 left-5 h-px bg-primary/70 shadow-[0_0_8px_rgba(0,217,146,0.4)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
