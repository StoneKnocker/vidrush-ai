import { MessageCircleMore, Send } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useAuth } from "~/hooks/use-auth";
import { getPublicEnv } from "~/lib/env.server";
import { trpc } from "~/lib/trpc/trpc-provider";
import { getCanonicalUrl, getHreflangTags } from "~/lib/utils";
import { getLocale } from "~/middlewares/i18next";
import type { Route } from "./+types/feedback";

const feedbackCategories = ["bug", "idea", "question", "other"] as const;

type FeedbackCategory = (typeof feedbackCategories)[number];

export const meta: Route.MetaFunction = ({ data, params }) => {
  const locale = data?.locale ?? params.locale ?? "en";

  return [
    { title: "Feedback" },
    {
      name: "description",
      content: "Share product feedback, questions, and suggestions.",
    },
    {
      tagName: "link",
      rel: "canonical",
      href: getCanonicalUrl(locale, "/feedback", data?.appUrl),
    },
    ...getHreflangTags("/feedback", data?.appUrl),
  ];
};

export async function loader({ context }: Route.LoaderArgs) {
  return {
    appUrl: getPublicEnv().APP_URL,
    locale: getLocale(context),
  };
}

export default function FeedbackRoute() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [message, setMessage] = useState("");
  const [hasEditedEmail, setHasEditedEmail] = useState(false);

  const createFeedback = trpc.feedback.create.useMutation({
    onSuccess: () => {
      toast.success(t("feedback.success"));
      setCategory("idea");
      setMessage("");
      setEmail(user?.email ?? "");
      setHasEditedEmail(false);
    },
    onError: () => {
      toast.error(t("feedback.error"));
    },
  });

  useEffect(() => {
    if (user?.email && !hasEditedEmail) {
      setEmail(user.email);
    }
  }, [hasEditedEmail, user?.email]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createFeedback.mutate({
      email,
      category,
      message,
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050507] pt-28 pb-20 text-[#f2f2f2]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(61,58,57,0.14)_1px,transparent_1px),linear-gradient(180deg,rgba(61,58,57,0.12)_1px,transparent_1px)] bg-[size:80px_80px] opacity-35" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(0,217,146,0.16),transparent_58%)]" />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-lg border border-[#3d3a39] bg-[#101010] text-[#00d992] shadow-[0_0_15px_rgba(92,88,85,0.16)]">
            <MessageCircleMore className="size-6" />
          </div>
          <p className="mt-6 font-semibold text-[#00d992] text-sm uppercase tracking-[0.24em]">
            {t("feedback.eyebrow")}
          </p>
          <h1 className="mt-4 text-balance font-display font-normal text-4xl text-[#f2f2f2] tracking-[-0.02em] sm:text-5xl">
            {t("feedback.title")}
          </h1>
          <p className="mt-5 text-balance text-[#b8b3b0] text-lg leading-8">
            {t("feedback.description")}
          </p>
        </section>

        <section className="mx-auto w-full max-w-2xl rounded-lg border border-[#3d3a39] bg-[#101010] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_24px_rgba(0,217,146,0.08)] sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="feedback-email" className="text-[#f2f2f2]">
                {t("feedback.emailLabel")}
              </Label>
              <Input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setHasEditedEmail(true);
                }}
                placeholder={t("feedback.emailPlaceholder")}
                autoComplete="email"
                maxLength={255}
                required
                className="border-[#3d3a39] bg-[#050507] text-[#f2f2f2] placeholder:text-[#8b949e] focus-visible:border-[#00d992] focus-visible:ring-[#00d992]/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="feedback-category" className="text-[#f2f2f2]">
                {t("feedback.categoryLabel")}
              </Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value as FeedbackCategory);
                }}
              >
                <SelectTrigger
                  id="feedback-category"
                  aria-label={t("feedback.categoryLabel")}
                  className="w-full border-[#3d3a39] bg-[#050507] text-[#f2f2f2] focus-visible:border-[#00d992] focus-visible:ring-[#00d992]/30"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#3d3a39] bg-[#101010] text-[#f2f2f2]">
                  <SelectGroup>
                    {feedbackCategories.map((item) => (
                      <SelectItem
                        key={item}
                        value={item}
                        className="focus:bg-[#00d992] focus:text-[#06110d]"
                      >
                        {t(`feedback.categories.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="feedback-message" className="text-[#f2f2f2]">
                {t("feedback.messageLabel")}
              </Label>
              <Textarea
                id="feedback-message"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                }}
                placeholder={t("feedback.messagePlaceholder")}
                className="min-h-40 resize-y border-[#3d3a39] bg-[#050507] text-[#f2f2f2] placeholder:text-[#8b949e] focus-visible:border-[#00d992] focus-visible:ring-[#00d992]/30"
                maxLength={2000}
                required
              />
              <p className="text-[#b8b3b0] text-sm">
                {t("feedback.messageHint")}
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={createFeedback.isPending}
              className="w-full border border-[#00d992]/70 bg-[#00d992] font-semibold text-[#06110d] shadow-[0_0_24px_rgba(0,217,146,0.18)] hover:bg-[#27e9aa] hover:text-[#06110d]"
            >
              <Send data-icon="inline-start" />
              {createFeedback.isPending
                ? t("feedback.submitting")
                : t("feedback.submit")}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
