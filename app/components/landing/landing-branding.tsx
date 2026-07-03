import type { LandingBrandingSection } from "~/types/landingpage";
import { LandingIcon, LandingIconBadge } from "./landing-icons";
import { LandingSectionHeading } from "./landing-section-heading";
import { shouldRenderSection } from "./landing-visibility";

export function LandingBranding({
  section,
}: {
  section?: LandingBrandingSection;
}) {
  if (!shouldRenderSection(section)) {
    return null;
  }

  return (
    <section
      id={section.id ?? "branding"}
      className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <LandingSectionHeading
          title={section.title}
          description={section.description}
          className="mb-10"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {section.items.map((item) => (
            <div
              key={item.title}
              className="group hover:-translate-y-1 rounded-lg border bg-card p-6 shadow-[0_0_15px_rgba(92,88,85,0.16)] transition-all duration-300 hover:border-primary/70"
            >
              <LandingIconBadge className="h-12 w-12">
                {item.image ? (
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    loading="lazy"
                    decoding="async"
                    className="size-7 object-contain"
                  />
                ) : (
                  <LandingIcon name={item.icon} className="size-5" />
                )}
              </LandingIconBadge>
              <p className="mt-5 font-medium text-foreground text-lg">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
