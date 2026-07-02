import { useNavigate } from "react-router";
import { LandingBranding } from "~/components/landing/landing-branding";
import { LandingCta } from "~/components/landing/landing-cta";
import { LandingFaq } from "~/components/landing/landing-faq";
import { LandingFeatureGrid } from "~/components/landing/landing-feature-grid";
import { LandingHero } from "~/components/landing/landing-hero";
import { LandingSplitSectionBlock } from "~/components/landing/landing-split-section";
import { LandingStats } from "~/components/landing/landing-stats";
import { LandingTestimonials } from "~/components/landing/landing-testimonials";
import { LandingUsage } from "~/components/landing/landing-usage";
import { getPublicEnv } from "~/lib/env.server";
import { getCanonicalUrl, getHreflangTags } from "~/lib/utils";
import resources from "~/locales";
import { getLocale } from "~/middlewares/i18next";
import type { LandingPageContent } from "~/types/landingpage";
import type { Route } from "./+types/cyberrealistic-pony";

export const meta: Route.MetaFunction = ({
  data,
}: {
  data: Awaited<ReturnType<typeof loader>>;
}) => {
  const content = data.contentData.meta;

  return [
    { title: content.title },
    { name: "description", content: content.description },
    {
      tagName: "link",
      rel: "canonical",
      href: getCanonicalUrl(data.locale, "/cyberrealistic-pony", data.appUrl),
    },
    ...getHreflangTags("/cyberrealistic-pony", data.appUrl),
  ];
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const locale = getLocale(context);
  const contentData = resources[locale]?.[
    "cyberrealistic-pony"
  ] as LandingPageContent;

  if (!contentData) {
    throw new Error(`No content data found for locale: ${locale}`);
  }

  const publicEnv = getPublicEnv();

  return {
    appUrl: publicEnv.APP_URL,
    locale,
    contentData,
  };
};

export default function CyberRealisticPonyRoute({
  loaderData,
}: Route.ComponentProps) {
  const { contentData } = loaderData;
  const navigate = useNavigate();
  const navigateToPlayground = () => navigate("/playground");

  return (
    <div className="landing-theme relative flex w-full flex-col overflow-hidden bg-background text-foreground">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(61,58,57,0.14)_1px,transparent_1px),linear-gradient(180deg,rgba(61,58,57,0.12)_1px,transparent_1px)] bg-[size:80px_80px] opacity-35" />
        <LandingHero
          section={contentData.hero}
          onShowWorkspace={navigateToPlayground}
        />
        <LandingBranding section={contentData.branding} />
        <LandingSplitSectionBlock section={contentData.introduce} />
        <LandingSplitSectionBlock section={contentData.benefit} />
        <LandingUsage section={contentData.usage} />
        <LandingFeatureGrid section={contentData.feature} />
        <LandingStats section={contentData.stats} />
        <LandingTestimonials section={contentData.testimonial} />
        <LandingFaq section={contentData.faq} />
        <LandingCta
          section={contentData.cta}
          onShowWorkspace={navigateToPlayground}
        />
      </div>
    </div>
  );
}
