import { useTranslation } from "react-i18next";

export default function AffiliateBanner() {
  const { t } = useTranslation();

  return (
    <a
      href="https://pollo.ai?ref=mgq1nzk"
      target="_blank"
      rel="noopener noreferrer"
      className="relative mt-16 block overflow-hidden py-3 text-white transition-all hover:brightness-105"
      style={{
        background: "linear-gradient(to right, #9333ea, #ec4899, #f97316)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-3 sm:mb-0">
          <div className="hidden sm:block">
            <img
              src="https://pollo.ai/favicon.ico"
              alt="Pollo Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <div>
            <p className="font-bold text-lg">
              {t("affiliateBanner.title")}: {t("affiliateBanner.description")}
            </p>
          </div>
        </div>
        <div className="mt-2 rounded-full bg-white px-6 py-2 font-bold text-purple-600 shadow-md sm:mt-0">
          {t("affiliateBanner.buttonText")}
        </div>
      </div>
      <div className="-right-12 -top-12 absolute h-40 w-40 rounded-full bg-white opacity-10" />
      <div className="-left-12 -bottom-12 absolute h-40 w-40 rounded-full bg-white opacity-10" />
    </a>
  );
}
