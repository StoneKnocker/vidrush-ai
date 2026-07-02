import type { LucideIcon } from "lucide-react";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { Link } from "~/components/i18n-link";
import { i18nConfig } from "~/lib/config";
import type { PolicyLoaderData } from "~/lib/content/policy.server";
import { useSupportEmail } from "~/lib/public-env";

interface PolicyPageProps {
  icon: LucideIcon;
  type: "privacy" | "terms" | "cookie";
  params: { locale?: string };
  loaderData: PolicyLoaderData;
}

interface LoaderArgs {
  params: { locale?: string };
}

export function PolicyPage({
  icon: Icon,
  type,
  params,
  loaderData,
}: PolicyPageProps) {
  const { appName, content } = loaderData;
  const { t } = useTranslation();
  const defaultLanguage = i18nConfig.defaultLanguage;
  const locale = params.locale || defaultLanguage;
  const supportEmail = useSupportEmail();
  const policyKey =
    type === "privacy"
      ? "privacy"
      : type === "terms"
        ? "termsPage"
        : "cookiePage";
  const policyLabel =
    type === "privacy"
      ? "Privacy policy"
      : type === "terms"
        ? "Terms and conditions"
        : "Cookie policy";

  useEffect(() => {
    // Smooth scroll animation on page load
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!content) {
    return (
      <div className="landing-theme min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-3xl px-6 py-20">
          <div className="fade-in flex animate-in flex-col gap-8 text-center duration-500">
            <div className="mx-auto flex size-16 items-center justify-center rounded-md border border-[#3d3a39] bg-[#101010]">
              <Icon className="size-8 text-[#00d992]" />
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="font-semibold text-3xl text-[#f2f2f2] tracking-tight">
                {t(`${policyKey}.contentNotFound`, "Content Not Found")}
              </h1>
              <p className="text-[#b8b3b0]">
                {t(
                  `${policyKey}.contentUnavailable`,
                  `${policyLabel} content is unavailable`,
                )}
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-medium text-[#b8b3b0] text-sm transition-colors hover:text-[#00d992]"
            >
              <ArrowLeftIcon className="size-4" />
              {t("navigation.home", "Home")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dateString = new Date(content.lastModified).toLocaleDateString(locale);
  const renderedContent = content.content.replaceAll(
    "{{supportEmail}}",
    supportEmail,
  );

  return (
    <div className="landing-theme min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-[#3d3a39] border-b bg-[#050507]">
        <div className="container mx-auto max-w-3xl px-6 py-6">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 font-medium text-[#b8b3b0] text-sm transition-colors hover:text-[#00d992]"
          >
            <ArrowLeftIcon className="size-4" />
            {t("navigation.home", "Home")}
          </Link>
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-md border border-[#3d3a39] bg-[#101010]">
              <Icon className="size-6 text-[#00d992]" />
            </div>
            <div>
              <p className="font-semibold text-2xl text-[#f2f2f2] tracking-tight">
                {content.title}
              </p>
              <p className="mt-1 text-[#b8b3b0] text-sm">
                {t(`${policyKey}.lastModified`, "Last modified: ")}
                {dateString}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-6 py-12">
        <article className="prose prose-slate prose-lg fade-in slide-in-from-bottom-4 max-w-none animate-in duration-700">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="mt-12 mb-6 border-[#3d3a39] border-b pb-4 font-bold text-3xl text-[#f2f2f2] first:mt-0">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-10 mb-4 font-semibold text-2xl text-[#f2f2f2]">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 mb-3 font-medium text-[#f2f2f2] text-xl">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-5 text-[#b8b3b0] text-base leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="mb-5 flex flex-col gap-2 text-[#b8b3b0]">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-5 flex flex-col gap-2 text-[#b8b3b0]">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="pl-2 leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-[#f2f2f2]">
                  {children}
                </strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-[#00d992] underline decoration-[#00d992]/40 underline-offset-4 transition-colors hover:text-[#2fd6a1] hover:decoration-[#00d992]"
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel={
                    href?.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-6 border-[#00d992] border-l-4 pl-4 text-[#b8b3b0] italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {renderedContent}
          </ReactMarkdown>
        </article>

        {/* Footer */}
        <footer className="mt-16 border-[#3d3a39] border-t pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[#8b949e] text-sm">
              © {new Date().getFullYear()} {appName}.{" "}
              {t("footer.allRightsReserved", "All rights reserved.")}
            </p>
            <Link
              to="/"
              className="font-medium text-[#b8b3b0] text-sm transition-colors hover:text-[#00d992]"
            >
              {t("navigation.home", "Home")}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function policyMeta({
  appName,
  params,
  type,
}: {
  appName: string;
  params: LoaderArgs["params"];
  type: "privacy" | "terms" | "cookie";
}) {
  const defaultLanguage = i18nConfig.defaultLanguage;
  const locale = params.locale || defaultLanguage;
  const title =
    type === "privacy"
      ? "Privacy Policy"
      : type === "terms"
        ? "Terms and Conditions"
        : "Cookie Policy";

  return [
    {
      title: `${title} - ${appName}`,
    },
    {
      name: "description",
      content: `${title} for AI Photography service`,
    },
    {
      name: "language",
      content: locale,
    },
  ];
}
