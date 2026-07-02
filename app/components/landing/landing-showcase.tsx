import { useMemo } from "react";
import { useR2Domain } from "~/lib/public-env";
import { buildR2Url } from "~/lib/r2/r2.shared";
import type { LandingShowcaseSection } from "~/types/landingpage";
import { LandingSectionHeading } from "./landing-section-heading";
import { shouldRenderSection } from "./landing-visibility";

function buildAssetUrl(pathOrUrl: string, r2Domain: string) {
  if (!pathOrUrl) {
    return "";
  }

  if (!r2Domain && !/^https?:\/\//.test(pathOrUrl)) {
    return `/${pathOrUrl.replace(/^\/+/, "")}`;
  }

  return buildR2Url(pathOrUrl, r2Domain);
}

function ShowcaseCard({
  item,
  r2Domain,
}: {
  item: LandingShowcaseSection["items"][number];
  r2Domain: string;
}) {
  const imageUrl = useMemo(
    () => buildAssetUrl(item.image, r2Domain),
    [item.image, r2Domain],
  );

  return (
    <div className="rounded-lg border border-[#3d3a39] bg-[#101010] p-4 shadow-[0_0_15px_rgba(92,88,85,0.12)] transition-all duration-300 hover:border-[#00d992]/70 hover:shadow-[0_0_15px_rgba(0,217,146,0.14)]">
      <div className="relative aspect-square overflow-hidden rounded-md border border-[#3d3a39] bg-[#050507]">
        <img
          src={imageUrl}
          alt={`${item.title} showcase`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain opacity-90 transition duration-500 hover:scale-[1.02] hover:opacity-100"
        />
      </div>
      <div className="mt-5">
        <h3 className="font-medium text-[#f2f2f2] text-xl">{item.title}</h3>
        <p className="mt-2 text-[#b8b3b0] text-sm leading-7">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export function LandingShowcase({
  section,
}: {
  section?: LandingShowcaseSection;
}) {
  const r2Domain = useR2Domain();

  if (!shouldRenderSection(section)) {
    return null;
  }

  const items = section.items.filter((item) => item.image);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id={section.id ?? "showcase"}
      className="px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <LandingSectionHeading
          title={section.title}
          description={section.description}
          className="mb-12"
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ShowcaseCard
              key={`${item.title}-${item.image}`}
              item={item}
              r2Domain={r2Domain}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
