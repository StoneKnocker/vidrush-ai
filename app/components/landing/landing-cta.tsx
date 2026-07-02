import type { LandingCtaSection } from "~/types/landingpage";
import { RichText } from "../rich-text";
import { LandingActionButton } from "./landing-actions";
import { shouldRenderSection } from "./landing-visibility";

export function LandingCta({
  section,
  onShowWorkspace,
}: {
  section?: LandingCtaSection;
  onShowWorkspace?: () => void;
}) {
  if (!shouldRenderSection(section)) {
    return null;
  }

  return (
    <section
      id={section.id ?? "cta"}
      className="px-4 pt-6 pb-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-lg border-2 border-[#00d992] bg-[#101010] px-6 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_30px_rgba(0,217,146,0.12)] sm:px-10 lg:px-12">
          {section.title ? (
            <h2 className="mx-auto max-w-3xl text-balance font-display font-normal text-3xl text-[#f2f2f2] leading-[1.06] tracking-[-0.03em] sm:text-4xl md:text-5xl">
              <RichText text={section.title} />
            </h2>
          ) : null}
          {section.description ? (
            <div className="mx-auto mt-5 max-w-2xl text-[#b8b3b0] text-base leading-8">
              <RichText text={section.description} />
            </div>
          ) : null}
          {section.button ? (
            <div className="mt-8 flex justify-center">
              <LandingActionButton
                button={section.button}
                onShowWorkspace={onShowWorkspace}
                className="rounded-xl"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
