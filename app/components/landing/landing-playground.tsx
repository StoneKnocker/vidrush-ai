import { useState } from "react";
import type { LandingPlaygroundSection } from "~/types/landingpage";
import { LandingSectionHeading } from "./landing-section-heading";
import { shouldRenderSection } from "./landing-visibility";

export function LandingPlayground({
  section,
}: {
  section?: LandingPlaygroundSection;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!shouldRenderSection(section)) {
    return null;
  }

  const items = section.items.filter((item) => item.src);
  if (items.length === 0) {
    return null;
  }

  const currentTab = items[activeIndex];
  if (!currentTab) {
    return null;
  }

  return (
    <section
      id={section.id ?? "playground"}
      className="px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <LandingSectionHeading
          title={section.title}
          description={section.description}
          className="mb-12"
        />

        <div className="overflow-hidden rounded-lg border border-[#3d3a39]">
          <div className="flex bg-[#0a0a0d]" role="tablist">
            {items.map((tab, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={tab.src}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveIndex(i)}
                  className={
                    "relative flex-1 px-5 py-3 font-medium text-sm transition-all" +
                    (isActive
                      ? "bg-[#050507] text-[#f2f2f2]"
                      : "bg-transparent text-[#7d7875] hover:bg-[#111115] hover:text-[#b8b3b0]") +
                    (i === 0 ? "" : "border-[#3d3a39] border-l")
                  }
                >
                  {isActive && (
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-[#00d992]" />
                  )}
                  {tab.title}
                </button>
              );
            })}
          </div>
          <iframe
            key={currentTab.src}
            src={currentTab.src}
            title={currentTab.title}
            className="w-full border-[#3d3a39] border-t"
            height={800}
          />
        </div>
      </div>
    </section>
  );
}
