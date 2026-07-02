import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { LandingFaqSection } from "~/types/landingpage";
import { RichText } from "../rich-text";
import { LandingIconBadge } from "./landing-icons";
import { LandingSectionHeading } from "./landing-section-heading";
import { shouldRenderSection } from "./landing-visibility";

export function LandingFaq({ section }: { section?: LandingFaqSection }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!shouldRenderSection(section)) {
    return null;
  }

  return (
    <section id={section.id ?? "faq"} className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <LandingSectionHeading
          title={section.title}
          description={section.description}
          className="mb-12"
        />

        <div className="flex flex-col gap-4">
          {section.items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className="overflow-hidden rounded-lg border border-[#3d3a39] bg-[#101010] shadow-[0_0_15px_rgba(92,88,85,0.1)] transition-colors duration-300 hover:border-[#00d992]/60"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left"
                >
                  <span className="font-medium text-[#f2f2f2] text-lg">
                    {item.question}
                  </span>
                  <LandingIconBadge className="h-10 w-10 rounded-full">
                    {isOpen ? (
                      <Minus className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </LandingIconBadge>
                </button>

                <div
                  className={
                    isOpen
                      ? "grid grid-rows-[1fr] px-6 pb-6"
                      : "grid grid-rows-[0fr] px-6"
                  }
                >
                  <div className="overflow-hidden">
                    <div className="text-[#b8b3b0] text-sm leading-7">
                      <RichText text={item.answer} />
                    </div>
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
