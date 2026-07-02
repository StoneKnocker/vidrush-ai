import { cn } from "~/lib/utils";
import type { LandingUsageSection } from "~/types/landingpage";
import { LandingIcon, LandingIconBadge } from "./landing-icons";
import { LandingSectionHeading } from "./landing-section-heading";
import { shouldRenderSection } from "./landing-visibility";

export function LandingUsage({ section }: { section?: LandingUsageSection }) {
  if (!shouldRenderSection(section)) {
    return null;
  }

  const desktopColumnsClass =
    section.items.length >= 4
      ? "lg:grid-cols-4"
      : section.items.length === 3
        ? "lg:grid-cols-3"
        : section.items.length === 2
          ? "lg:grid-cols-2"
          : "lg:grid-cols-1";

  return (
    <section
      id={section.id ?? "usage"}
      className="relative px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <LandingSectionHeading
          title={section.title}
          description={section.description}
          className="mb-12"
        />

        <div className={cn("grid gap-5", desktopColumnsClass)}>
          {section.items.map((item, index) => (
            <article
              key={item.title}
              className="group hover:-translate-y-1 relative overflow-hidden rounded-lg border border-[#3d3a39] bg-[#101010] p-5 shadow-[0_0_15px_rgba(92,88,85,0.14)] transition-all duration-300 hover:border-[#00d992]/70"
            >
              <div className="mb-6 flex justify-between">
                <span className="font-mono text-[#8b949e] text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <LandingIconBadge className="h-10 w-10">
                  <LandingIcon name={item.icon} className="size-4" />
                </LandingIconBadge>
              </div>

              {item.image ? (
                <div className="mb-5 overflow-hidden rounded-md border border-[#3d3a39] bg-[#050507]">
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "h-48 w-full object-contain transition duration-500 group-hover:scale-[1.03]",
                      index % 2 === 0 ? "object-center" : "object-top",
                    )}
                  />
                </div>
              ) : null}

              <h3 className="font-medium text-[#f2f2f2] text-xl">
                {item.title}
              </h3>
              <p className="mt-3 text-[#b8b3b0] text-sm leading-7">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
