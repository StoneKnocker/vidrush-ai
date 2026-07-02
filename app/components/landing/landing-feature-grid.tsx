import type { LandingFeatureGridSection } from "~/types/landingpage";
import { RichText } from "../rich-text";
import { LandingIcon, LandingIconBadge } from "./landing-icons";
import { LandingSectionHeading } from "./landing-section-heading";
import { shouldRenderSection } from "./landing-visibility";

export function LandingFeatureGrid({
  section,
}: {
  section?: LandingFeatureGridSection;
}) {
  if (!shouldRenderSection(section)) {
    return null;
  }

  return (
    <section
      id={section.id ?? "feature"}
      className="relative bg-background px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <LandingSectionHeading
          title={section.title}
          description={section.description}
          className="mb-12"
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {section.items.map((item) => (
            <article
              key={item.title}
              className="hover:-translate-y-1 rounded-lg border border-[#3d3a39] bg-[#101010] p-6 transition-all duration-300 hover:border-[#00d992]/70 hover:shadow-[0_0_15px_rgba(92,88,85,0.2)]"
            >
              <LandingIconBadge>
                <LandingIcon name={item.icon} className="size-5" />
              </LandingIconBadge>
              <div className="mt-5">
                <h3 className="font-medium text-[#f2f2f2] text-xl">
                  {item.title}
                </h3>
                <div className="mt-3 text-[#b8b3b0] text-sm leading-7">
                  <RichText text={item.description} />
                </div>
              </div>
              {item.bullets?.length ? (
                <ul className="mt-5 flex flex-col gap-2 text-[#b8b3b0] text-sm">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <LandingIcon
                        name="check"
                        className="mt-1 size-4 shrink-0 text-[#00d992]"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
