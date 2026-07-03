import { ArrowRight } from "lucide-react";
import FAQ from "~/components/faq";
import PricingGrid from "~/components/pricing-grid";
import { StructuredData } from "~/components/structured-data";
import { getPublicEnv } from "~/lib/env.server";
import { useSupportEmail } from "~/lib/public-env";
import { buildPricingStructuredData } from "~/lib/structured-data";
import resources from "~/locales";
import { getLocale } from "~/middlewares/i18next";
import type { PricingPageContent } from "~/types/pricing";

import type { Route } from "./+types/pricing";

export const meta: Route.MetaFunction = ({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>;
}) => {
  const contentData = loaderData.contentData;
  return [
    { title: contentData.meta.title },
    { name: "description", content: contentData.meta.description },
  ];
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const locale = getLocale(context);

  const contentData = resources[locale]?.pricing as PricingPageContent;

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

export default function PricingRoute({ loaderData }: Route.ComponentProps) {
  const { appName, appUrl, contentData, locale } = loaderData;
  const supportEmail = useSupportEmail();
  const structuredData = buildPricingStructuredData({
    appName,
    appUrl,
    contentData,
    locale,
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StructuredData data={structuredData} />
      {/* Background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20" />
      <div className="absolute top-0 right-0 h-[800px] w-[800px] rounded-full bg-gradient-radial from-indigo-200/20 via-transparent to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-gradient-radial from-purple-200/20 via-transparent to-transparent blur-3xl" />

      <div className="relative pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header with stagger animation */}
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h1
              className="mb-6 font-bold text-4xl text-slate-900 tracking-tight opacity-0 md:text-5xl lg:text-6xl"
              style={{ animation: "fade-in-up 0.6s ease-out 0.2s forwards" }}
            >
              {contentData.page.title}
            </h1>
            <p
              className="mb-10 text-lg text-slate-600 opacity-0 md:text-xl"
              style={{ animation: "fade-in-up 0.6s ease-out 0.3s forwards" }}
            >
              {contentData.page.description}
            </p>
          </div>

          {/* --- PRICING GRID --- */}
          <PricingGrid contentData={contentData} mode="subscription" />

          {/* Enhanced Trust Section */}
          <div
            className="mt-24 text-center opacity-0"
            style={{ animation: "fade-in-up 0.6s ease-out 0.7s forwards" }}
          >
            <p className="mb-8 font-medium text-slate-500">
              {contentData.page.trustText}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ
        title={contentData.faq.title}
        description={contentData.faq.description}
        items={contentData.faq.items}
      />
      <div
        className="mt-16 rounded-2xl border border-indigo-100/50 p-8 text-center opacity-0"
        style={{ animation: "fade-in-up 0.6s ease-out 0.6s forwards" }}
      >
        <h3 className="mb-3 font-bold text-slate-900 text-xl">
          {contentData.page.unsureSection.title}
        </h3>
        <p className="mx-auto mb-5 max-w-2xl text-slate-600">
          {contentData.page.unsureSection.description}
        </p>
        <a
          href={`mailto:${supportEmail}`}
          className="inline-flex items-center gap-2 font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
        >
          {contentData.page.unsureSection.linkText}
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
