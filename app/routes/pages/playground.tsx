import { useState } from "react";
import { getPublicEnv } from "~/lib/env.server";
import { getCanonicalUrl, getHreflangTags } from "~/lib/utils";
import resources from "~/locales";
import { getLocale } from "~/middlewares/i18next";
import type { Route } from "./+types/playground";

export const meta: Route.MetaFunction = ({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof loader>>;
}) => {
  const content = loaderData.content;

  return [
    { title: content.metaTitle },
    { name: "description", content: content.metaDescription },
    {
      tagName: "link",
      rel: "canonical",
      href: getCanonicalUrl(
        loaderData.locale,
        "/playground",
        loaderData.appUrl,
      ),
    },
    ...getHreflangTags("/playground", loaderData.appUrl),
  ];
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  const locale = getLocale(context);
  const publicEnv = getPublicEnv();
  const translation = resources[locale]?.translation as
    | Record<string, Record<string, unknown>>
    | undefined;
  const playground = (translation?.playground ??
    (resources.en?.translation as Record<string, unknown>)?.playground ??
    {}) as {
    metaTitle: string;
    metaDescription: string;
    title: string;
    description: string;
    tabXL: string;
    tabPony: string;
  };

  return {
    appUrl: publicEnv.APP_URL,
    locale,
    content: playground,
  };
};

const PLAYGROUNDS = [
  {
    key: "xl",
    src: "https://corallight-f-scheduler-4k.hf.space",
    height: 700,
  },
  {
    key: "pony",
    src: "https://rioshiina-imagegen.hf.space",
    height: 700,
  },
] as const;

export default function PlaygroundRoute({ loaderData }: Route.ComponentProps) {
  const { content } = loaderData;
  const [activeTab, setActiveTab] = useState<
    (typeof PLAYGROUNDS)[number]["key"]
  >(PLAYGROUNDS[0].key);

  const tabLabels: Record<string, string> = {
    xl: content.tabXL,
    pony: content.tabPony,
  };

  const currentTab =
    PLAYGROUNDS.find((tab) => tab.key === activeTab) ?? PLAYGROUNDS[0];

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(61,58,57,0.14)_1px,transparent_1px),linear-gradient(180deg,rgba(61,58,57,0.12)_1px,transparent_1px)] bg-[size:80px_80px] opacity-35" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(0,217,146,0.16),transparent_58%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-16 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance font-display font-normal text-4xl text-foreground tracking-[-0.02em] sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-4 text-balance text-muted-foreground text-lg leading-8">
            {content.description}
          </p>
        </section>

        <div className="w-full">
          <div className="overflow-hidden rounded-lg border ">
            <div className="flex bg-card" role="tablist">
              {PLAYGROUNDS.map((tab, i) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.key)}
                    className={
                      "relative flex-1 px-5 py-3 font-medium text-sm transition-all" +
                      (isActive
                        ? "bg-background text-foreground"
                        : "bg-transparent text-muted-foreground hover:bg-card hover:text-muted-foreground") +
                      (i === 0 ? "" : "border-l")
                    }
                  >
                    {isActive && (
                      <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
                    )}
                    {tabLabels[tab.key]}
                  </button>
                );
              })}
            </div>
            <iframe
              key={currentTab.key}
              src={currentTab.src}
              title={tabLabels[currentTab.key]}
              className="w-full border-t"
              height={currentTab.height}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
