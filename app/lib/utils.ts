import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";
import { i18nConfig } from "~/lib/config";
import { buildR2Url } from "~/lib/r2/r2.shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate canonical URL for SEO purposes.
 * Handles locale-specific URLs, excluding default locale from path.
 */
export function getCanonicalUrl(
  locale: string,
  path: string,
  appUrl?: string,
): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const defaultLocale = i18nConfig.defaultLanguage;
  const baseUrl =
    appUrl ??
    (typeof window !== "undefined" ? window.ENV?.APP_URL : undefined) ??
    "";
  const localizedPath =
    locale === defaultLocale
      ? cleanPath
      : cleanPath === "/"
        ? `/${locale}`
        : `/${locale}${cleanPath}`;

  if (!baseUrl) {
    return localizedPath;
  }

  return new URL(localizedPath, baseUrl).toString();
}

/**
 * Generate hreflang alternate link tags for all supported languages.
 * Includes x-default pointing to the default locale.
 */
export function getHreflangTags(
  path: string,
  appUrl?: string,
): Array<{
  tagName: "link";
  rel: "alternate";
  hrefLang: string;
  href: string;
}> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const tags = i18nConfig.supportLanguages.map((lang) => ({
    tagName: "link" as const,
    rel: "alternate" as const,
    hrefLang: lang,
    href: getCanonicalUrl(lang, cleanPath, appUrl),
  }));
  tags.push({
    tagName: "link" as const,
    rel: "alternate" as const,
    hrefLang: "x-default",
    href: getCanonicalUrl(i18nConfig.defaultLanguage, cleanPath, appUrl),
  });
  return tags;
}

export function getLocalizedPath(locale: string, path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedLocale = i18nConfig.supportLanguages.includes(locale)
    ? locale
    : i18nConfig.defaultLanguage;

  return normalizedLocale === i18nConfig.defaultLanguage
    ? cleanPath
    : cleanPath === "/"
      ? `/${normalizedLocale}`
      : `/${normalizedLocale}${cleanPath}`;
}

export function callAll<Args extends Array<unknown>>(
  ...fns: Array<((...args: Args) => unknown) | undefined>
) {
  return (...args: Args) => {
    for (const fn of fns) {
      fn?.(...args);
    }
  };
}

export function formatDate(
  date: Date | string,
  formatString = "yyyy-MM-dd",
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatString);
}

export function getAvatarUrl(
  userImage: string | null | undefined,
  userName: string | null | undefined,
  userEmail: string | null | undefined,
  r2Domain?: string,
) {
  const seed = userName || userEmail || "Youarebrilliant";
  const placeholderUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`;
  let avatarUrl = null;
  if (userImage?.startsWith("http://") || userImage?.startsWith("https://")) {
    avatarUrl = userImage;
  } else if (userImage?.startsWith("user-avatar/")) {
    avatarUrl = buildR2Url(userImage, r2Domain);
  }
  return {
    avatarUrl,
    placeholderUrl,
  };
}

export function getGuestId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  let guestId = localStorage.getItem("guestId");
  if (guestId) {
    return guestId;
  }

  guestId = nanoid();
  localStorage.setItem("guestId", guestId);

  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not universally available yet.
  document.cookie = `guestId=${guestId}; path=/; max-age=${30 * 24 * 60 * 60};`;

  return guestId;
}
