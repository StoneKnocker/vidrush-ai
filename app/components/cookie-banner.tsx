import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "~/components/i18n-link";
import { Button } from "~/components/ui/button";

const COOKIE_BANNER_STORAGE_KEY = "cookie-banner-accepted";

export default function CookieBanner() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    try {
      const storedValue = window.localStorage.getItem(
        COOKIE_BANNER_STORAGE_KEY,
      );
      setIsAccepted(storedValue === "true");
    } catch {
      setIsAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      window.localStorage.setItem(COOKIE_BANNER_STORAGE_KEY, "true");
    } catch {
      // Ignore storage failures and only dismiss for the current session.
    }

    setIsAccepted(true);
  };

  if (!isMounted || isAccepted) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4">
      <div className="pointer-events-auto mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="flex-1 text-slate-600 text-sm leading-6">
          {t("cookieBanner.message")}{" "}
          <Link
            to="/cookie-policy"
            className="font-medium text-indigo-700 underline underline-offset-4 transition-colors hover:text-indigo-800"
          >
            {t("cookieLabel")}
          </Link>
        </p>
        <Button
          type="button"
          size="sm"
          onClick={handleAccept}
          className="w-full sm:w-auto"
        >
          {t("cookieBanner.accept")}
        </Button>
      </div>
    </div>
  );
}
