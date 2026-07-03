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
      <div className="mx-auto max-w-7xl rounded-lg border bg-card p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] lg:p-10">
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
              className="rounded-lg border bg-background p-6 transition-all duration-300 hover:border-primary/70"
            >
              <LandingIconBadge className="mb-5">
                <LandingIcon name={item.icon} className="size-5" />
              </LandingIconBadge>
              <p className="font-mono font-semibold text-4xl text-primary">
                {item.value}
              </p>
              <p className="mt-3 font-medium text-foreground">{item.label}</p>
              <p className="mt-2 text-muted-foreground text-sm leading-7">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
