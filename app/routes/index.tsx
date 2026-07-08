import { VideoWorkspace } from "~/components/video-workspace";
import { StructuredData } from "~/components/structured-data";
import { SeedanceLandingSections } from "~/components/landing/seedance-landing-sections";
import { getPublicEnv } from "~/lib/env.server";
import { buildSocialMeta } from "~/lib/seo";
import { buildHomeStructuredData } from "~/lib/structured-data";
import { getCanonicalUrl, getHreflangTags } from "~/lib/utils";
import resources from "~/locales";
import { getLocale } from "~/middlewares/i18next";
import type { LandingPageContent } from "~/types/landingpage";
import type { Route } from "./+types/index";

export const meta: Route.MetaFunction = ({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>;
}) => {
  const contentData = loaderData.contentData;
  const locale = loaderData.locale;
  const canonicalUrl = getCanonicalUrl(locale, "/", loaderData.appUrl);

  return [
    { title: contentData.meta.title },
    { name: "description", content: contentData.meta.description },
    {
      tagName: "link",
      rel: "canonical",
      href: canonicalUrl,
    },
    ...getHreflangTags("/", loaderData.appUrl),
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
  const structuredData = buildHomeStructuredData({
    appName,
    appUrl,
    contentData,
    locale,
  });

  return (
    <div className="landing-theme relative flex w-full flex-col overflow-hidden bg-background text-foreground">
      <StructuredData data={structuredData} />
      <VideoWorkspace />
      <SeedanceLandingSections />
    </div>
  );
}
