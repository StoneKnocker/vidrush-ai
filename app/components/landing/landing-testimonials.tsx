import { cn } from "~/lib/utils";
import type { LandingTestimonialSection } from "~/types/landingpage";
import { RichText } from "../rich-text";
import { LandingIcon, LandingIconBadge } from "./landing-icons";
import { LandingSectionHeading } from "./landing-section-heading";
import { shouldRenderSection } from "./landing-visibility";

export function LandingTestimonials({
  section,
}: {
  section?: LandingTestimonialSection;
}) {
  if (!shouldRenderSection(section)) {
    return null;
  }

  const itemCount = section.items.length;
  const useCenteredThreeColumnLayout = itemCount >= 3;
  const remainder = itemCount % 3;

  return (
    <section
      id={section.id ?? "testimonial"}
      className="relative px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <LandingSectionHeading
          title={section.title}
          description={section.description}
          className="mb-12"
        />

        <div
          className={cn(
            "grid gap-5",
            useCenteredThreeColumnLayout ? "lg:grid-cols-6" : "lg:grid-cols-2",
          )}
        >
          {section.items.map((item, index) => {
            const isLastRowSingle =
              useCenteredThreeColumnLayout &&
              remainder === 1 &&
              index === itemCount - 1;
            const isLastRowPairStart =
              useCenteredThreeColumnLayout &&
              remainder === 2 &&
              index === itemCount - 2;

            return (
              <article
                key={`${item.author}-${item.role}`}
                className={cn(
                  "rounded-lg border border-[#3d3a39] bg-[#101010] p-6 shadow-[0_0_15px_rgba(92,88,85,0.12)] transition-all duration-300 hover:border-[#00d992]/70",
                  useCenteredThreeColumnLayout ? "lg:col-span-2" : "",
                  isLastRowSingle ? "lg:col-start-3" : "",
                  isLastRowPairStart ? "lg:col-start-2" : "",
                )}
              >
                <div className="mb-6 flex items-center justify-between">
                  <LandingIconBadge className="h-12 w-12">
                    <LandingIcon name="quote" className="size-5" />
                  </LandingIconBadge>
                  <span className="text-[#00d992] text-sm">
                    {item.rating ?? "★★★★★"}
                  </span>
                </div>
                <div className="text-[#b8b3b0] text-sm leading-7">
                  <RichText text={item.quote} />
                </div>
                <div className="mt-8 flex items-center gap-4">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.author}
                      loading="lazy"
                      decoding="async"
                      className="size-12 rounded-full border border-[#3d3a39] object-cover"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-full border border-[#3d3a39] bg-[#050507] font-medium text-[#00d992]">
                      {item.author.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-[#f2f2f2]">{item.author}</p>
                    <p className="text-[#8b949e] text-sm">{item.role}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
