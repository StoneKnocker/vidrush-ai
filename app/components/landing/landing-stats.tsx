import type { LandingStatsSection } from "~/types/landingpage";
import { LandingIcon, LandingIconBadge } from "./landing-icons";
import { LandingSectionHeading } from "./landing-section-heading";
import { shouldRenderSection } from "./landing-visibility";

export function LandingStats({ section }: { section?: LandingStatsSection }) {
  if (!shouldRenderSection(section)) {
    return null;
  }

  return (
    <section id={section.id ?? "stats"} className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-lg border border-[#3d3a39] bg-[#101010] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] lg:p-10">
        <LandingSectionHeading
          title={section.title}
          description={section.description}
          align="left"
          className="mb-10"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {section.items.map((item) => (
            <article
              key={item.label}
              className="rounded-lg border border-[#3d3a39] bg-[#050507] p-6 transition-all duration-300 hover:border-[#00d992]/70"
            >
              <LandingIconBadge className="mb-5">
                <LandingIcon name={item.icon} className="size-5" />
              </LandingIconBadge>
              <p className="font-mono font-semibold text-4xl text-[#00d992]">
                {item.value}
              </p>
              <p className="mt-3 font-medium text-[#f2f2f2]">{item.label}</p>
              <p className="mt-2 text-[#b8b3b0] text-sm leading-7">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
