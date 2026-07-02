import { useNavigate } from "react-router";
import { LandingBranding } from "~/components/landing/landing-branding";
import { LandingCta } from "~/components/landing/landing-cta";
import { LandingFaq } from "~/components/landing/landing-faq";
import { LandingFeatureGrid } from "~/components/landing/landing-feature-grid";
import { LandingHero } from "~/components/landing/landing-hero";
import { LandingShowcase } from "~/components/landing/landing-showcase";
import { LandingSplitSectionBlock } from "~/components/landing/landing-split-section";
import { LandingStats } from "~/components/landing/landing-stats";
import { LandingTestimonials } from "~/components/landing/landing-testimonials";
import { LandingUsage } from "~/components/landing/landing-usage";
import { StructuredData } from "~/components/structured-data";
import { getPublicEnv } from "~/lib/env.server";
import { buildSocialMeta } from "~/lib/seo";
import { buildHomeStructuredData } from "~/lib/structured-data";
import { getCanonicalUrl, getHreflangTags } from "~/lib/utils";
import resources from "~/locales";
import { getLocale } from "~/middlewares/i18next";
import type { LandingPageContent } from "~/types/landingpage";
import type { Route } from "./+types/index";

export const meta: Route.MetaFunction = ({
  data,
}: {
  data: Awaited<ReturnType<typeof loader>>;
}) => {
  const contentData = data.contentData;
  const locale = data.locale;
  const canonicalUrl = getCanonicalUrl(locale, "/", data.appUrl);

  return [
    { title: contentData.meta.title },
    { name: "description", content: contentData.meta.description },
    {
      tagName: "link",
      rel: "canonical",
      href: canonicalUrl,
    },
    ...getHreflangTags("/", data.appUrl),
    ...buildSocialMeta({
      title: contentData.meta.title,
      description: contentData.meta.description,
      url: canonicalUrl,
      imageUrl: "https://cdn.cyberrealistic.org/cyberrealistic/og-home.webp",
      type: "website",
    }),
  ];
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const locale = getLocale(context);
  const contentData = resources[locale]?.index as LandingPageContent;

  if (!contentData) {
    throw new Error(`No content data found for locale: ${locale}`);
  }

  const publicEnv = getPublicEnv();

  return {
    appName: publicEnv.APP_NAME,
    appUrl: publicEnv.APP_URL,
    contentData,
    locale,
  };
};

export default function HomeRoute({ loaderData }: Route.ComponentProps) {
  const { appName, appUrl, contentData, locale } = loaderData;
  const navigate = useNavigate();
  const structuredData = buildHomeStructuredData({
    appName,
    appUrl,
    contentData,
    locale,
  });

  const navigateToPlayground = () => navigate("/playground");

  return (
    <div className="landing-theme relative flex w-full flex-col overflow-hidden bg-background text-foreground">
      <StructuredData data={structuredData} />

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
        <LandingShowcase section={contentData.showcase} />
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
