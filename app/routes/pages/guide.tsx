import { SeedanceGuide } from "~/components/guide/seedance-guide";
import { getPublicEnv } from "~/lib/env.server";
import { buildSocialMeta } from "~/lib/seo";
import { getCanonicalUrl, getHreflangTags } from "~/lib/utils";
import { getLocale } from "~/middlewares/i18next";
import type { Route } from "./+types/guide";

export const meta: Route.MetaFunction = ({ loaderData }) => {
  const locale = loaderData?.locale ?? "en";
  const appUrl = loaderData?.appUrl;
  const title = "Seedance 2.0 Prompt Guide - Master AI Video Generation";
  const description =
    "Master the art of prompting to create stunning AI-generated videos. Prompt techniques, multimodal references, and real-world examples for Seedance 2.0.";
  const canonicalUrl = getCanonicalUrl(locale, "/guide", appUrl);

  return [
    { title },
    { name: "description", content: description },
    {
      tagName: "link",
      rel: "canonical",
      href: canonicalUrl,
    },
    ...getHreflangTags("/guide", appUrl),
    ...buildSocialMeta({
      title,
      description,
      url: canonicalUrl,
      imageUrl: "https://cdn.cyberrealistic.org/cyberrealistic/og-home.webp",
      type: "website",
    }),
  ];
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  return {
    appUrl: getPublicEnv().APP_URL,
    locale: getLocale(context),
  };
};

export default function GuideRoute() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background pt-20 text-foreground">
      <SeedanceGuide />
    </main>
  );
}
