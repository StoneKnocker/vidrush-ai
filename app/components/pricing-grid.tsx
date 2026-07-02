import { ArrowRight, Check, Clock, Coins, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LoadingButton } from "~/components/ui/loading";
import { useAuth } from "~/hooks/use-auth";
import { useLoginModal } from "~/hooks/use-login-modal";
import { useSupportEmail } from "~/lib/public-env";
import { getTrpcErrorMessage } from "~/lib/trpc/error";
import { trpc } from "~/lib/trpc/trpc-provider";
import { cn, getLocalizedPath } from "~/lib/utils";
import type {
  CreditPack,
  PricingPageContent,
  SubscriptionPlan,
} from "~/types/pricing";

interface PricingGridProps {
  contentData: PricingPageContent;
  mode?: "subscription" | "credits";
  compact?: boolean;
  showFreePlan?: boolean;
}

export default function PricingGrid({
  contentData,
  mode: initialMode = "subscription",
  compact = false,
  showFreePlan = true,
}: PricingGridProps) {
  const { t, i18n } = useTranslation();
  const supportEmail = useSupportEmail();
  const [mode, setMode] = useState<"subscription" | "credits">(initialMode);
  const [isAnnual, setIsAnnual] = useState(true);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const subscriptionPlans = showFreePlan
    ? contentData.subscriptionPlans
    : contentData.subscriptionPlans.filter((plan) => plan.id !== "free");
  const creditPacks = contentData.creditPacks;

  // Auth and login modal hooks
  const { isAuthenticated } = useAuth();
  const { openLoginModal, closeLoginModal } = useLoginModal();

  // tRPC mutation for creating checkout
  const checkoutMutation = trpc.payment.createCheckout.useMutation();

  const handleCheckout = async (planId: string) => {
    // Handle special cases for free and enterprise plans
    if (planId.includes("free")) {
      // Free plan - redirect to home page
      window.location.href = getLocalizedPath(i18n.language, "/");
      return;
    }

    if (planId.includes("enterprise")) {
      // Enterprise plan - open email client
      window.location.href = `mailto:${supportEmail}`;
      return;
    }

    // Check if user is authenticated for paid plans
    if (!isAuthenticated) {
      // Store the planId and open login modal
      setPendingPlanId(planId);
      openLoginModal();
      return;
    }

    // User is authenticated, proceed with checkout
    await proceedWithCheckout(planId);
  };

  const proceedWithCheckout = useCallback(
    async (planId: string) => {
      try {
        const result = await checkoutMutation.mutateAsync({
          planId,
        });

        window.location.href = result.checkoutUrl;
      } catch (error) {
        console.error("Error creating checkout:", error);
        toast.error(getTrpcErrorMessage(error, t("pricing.genericError")));
      }
    },
    [checkoutMutation, t],
  );

  // Effect to handle checkout after successful login
  useEffect(() => {
    if (isAuthenticated && pendingPlanId) {
      closeLoginModal();
      proceedWithCheckout(pendingPlanId);
      setPendingPlanId(null);
    }
  }, [isAuthenticated, pendingPlanId, closeLoginModal, proceedWithCheckout]);

  const subscriptionGridClasses = compact
    ? "grid grid-cols-1 gap-4 md:grid-cols-2"
    : cn(
        "mx-auto grid grid-cols-1 justify-center gap-5 md:grid-cols-2",
        subscriptionPlans.length >= 4
          ? "max-w-7xl lg:grid-cols-4"
          : "max-w-6xl lg:grid-cols-3",
      );
  const creditPackGridClasses = cn(
    "mx-auto grid grid-cols-1 gap-5 md:grid-cols-2",
    creditPacks.length === 2
      ? "max-w-5xl items-stretch md:gap-6"
      : creditPacks.length >= 4
        ? "max-w-7xl lg:grid-cols-4"
        : "max-w-6xl lg:grid-cols-3",
  );

  return (
    <div className="text-[#f2f2f2]">
      {/* Mode Toggle - only show if not in compact mode or if explicitly requested */}
      {!compact && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setMode("subscription")}
            className={`flex min-h-11 items-center gap-2 rounded-md border px-6 py-3 font-semibold text-sm transition-all duration-300 ${
              mode === "subscription"
                ? "border-[#00d992]/70 bg-[#00d992]/12 text-[#f2fff9] shadow-[0_0_24px_rgba(0,217,146,0.18)]"
                : "border-[#3d3a39] bg-[#101010] text-[#b8b3b0] hover:border-[#00d992]/60 hover:text-[#f2f2f2]"
            }`}
          >
            <Zap
              size={16}
              className={
                mode === "subscription" ? "fill-[#00d992] text-[#00d992]" : ""
              }
            />
            {contentData.page.modeToggle.subscriptions}
          </button>
          <button
            type="button"
            onClick={() => setMode("credits")}
            className={`flex min-h-11 items-center gap-2 rounded-md border px-6 py-3 font-semibold text-sm transition-all duration-300 ${
              mode === "credits"
                ? "border-[#00d992]/70 bg-[#00d992]/12 text-[#f2fff9] shadow-[0_0_24px_rgba(0,217,146,0.18)]"
                : "border-[#3d3a39] bg-[#101010] text-[#b8b3b0] hover:border-[#00d992]/60 hover:text-[#f2f2f2]"
            }`}
          >
            <Coins
              size={16}
              className={mode === "credits" ? "text-[#00d992]" : ""}
            />
            {contentData.page.modeToggle.payAsYouGo}
          </button>
        </div>
      )}

      {/* Subscription Toggle */}
      {mode === "subscription" && !compact && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <span
            className={`font-semibold text-sm transition-colors duration-200 ${
              !isAnnual ? "text-[#f2f2f2]" : "text-[#817b77]"
            }`}
          >
            {contentData.page.billingToggle.monthly}
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            aria-label={
              isAnnual
                ? "Switch to monthly billing"
                : "Switch to yearly billing"
            }
            className={`relative h-8 w-16 rounded-full border p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00d992]/50 focus:ring-offset-2 focus:ring-offset-[#050507] ${
              isAnnual
                ? "border-[#00d992]/80 bg-[#00d992]/25 shadow-[0_0_18px_rgba(0,217,146,0.25)]"
                : "border-[#3d3a39] bg-[#080808]"
            }`}
            aria-pressed={isAnnual}
          >
            <div
              className={`size-6 transform rounded-full bg-[#f2f2f2] shadow-[0_0_12px_rgba(255,255,255,0.25)] transition-transform duration-300 ${
                isAnnual ? "translate-x-8" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`font-semibold text-sm transition-colors duration-200 ${
              isAnnual ? "text-[#f2f2f2]" : "text-[#817b77]"
            }`}
          >
            {contentData.page.billingToggle.yearly}
          </span>
          <span className="relative rounded-md border border-[#00d992]/60 bg-[#101010] px-3 py-1.5 font-bold text-[#00d992] text-xs shadow-[0_0_18px_rgba(0,217,146,0.16)]">
            {contentData.page.billingToggle.saveText}
          </span>
        </div>
      )}

      {/* SUBSCRIPTION GRID */}
      {mode === "subscription" && (
        <div className={subscriptionGridClasses}>
          {subscriptionPlans.map((plan: SubscriptionPlan) => {
            const isCustom =
              typeof plan.cycles.monthly.price === "string" ||
              typeof plan.cycles.yearly.price === "string";
            const currentCycle = isAnnual
              ? plan.cycles.yearly
              : plan.cycles.monthly;
            const currentPrice = currentCycle.price;
            const originalPrice = plan.cycles.monthly.price;
            const showDiscount =
              !isCustom && isAnnual && originalPrice !== currentPrice;

            return (
              <div
                key={plan.id}
                className={cn(
                  "group relative flex h-full flex-col overflow-visible rounded-lg border p-6 transition-all duration-300",
                  "bg-[#101010] text-[#f2f2f2] shadow-[0_0_15px_rgba(92,88,85,0.14)]",
                  "hover:-translate-y-1 hover:border-[#00d992]/70 hover:shadow-[0_0_26px_rgba(0,217,146,0.14)]",
                  plan.enterprise
                    ? "border-[#5c5855] bg-[#080808]"
                    : "border-[#3d3a39]",
                  plan.popular &&
                    "z-10 border-[#00d992] bg-[radial-gradient(circle_at_top,_rgba(0,217,146,0.14),_transparent_48%),#101010] shadow-[0_0_34px_rgba(0,217,146,0.2)]",
                )}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 z-20 flex whitespace-nowrap rounded-md border border-[#00d992]/70 bg-[#00d992] px-4 py-1.5 font-bold text-[#06110d] text-xs shadow-[0_0_20px_rgba(0,217,146,0.25)]">
                    {contentData.badges.mostPopular}
                  </div>
                )}

                {/* Enterprise glow effect */}
                {plan.enterprise && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d992]/70 to-transparent" />
                )}

                <div className="mb-5">
                  <h3 className="mb-2 font-semibold text-[#f2f2f2] text-xl">
                    {plan.name}
                  </h3>
                  <p className="text-[#b8b3b0] text-sm leading-6">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {isCustom ? (
                    <span className="font-bold text-3xl text-[#f2f2f2]">
                      {currentPrice}
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      {showDiscount && (
                        <span className="text-[#817b77] text-lg line-through">
                          ${originalPrice}
                        </span>
                      )}
                      <span className="font-bold text-4xl text-[#f2f2f2]">
                        ${currentPrice}
                      </span>
                      <span className="font-medium text-[#b8b3b0] text-sm">
                        {contentData.labels.perMonth}
                      </span>
                    </div>
                  )}
                  {!isCustom && isAnnual && (
                    <p className="mt-2 flex items-center gap-1 text-[#817b77] text-xs">
                      <Clock size={12} />
                      {contentData.labels.billedYearly}
                    </p>
                  )}
                </div>

                <div className="mb-6 flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature: string) => (
                      <li
                        key={`${plan.id}-${feature}`}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border border-[#00d992]/35 bg-[#00d992]/10 text-[#00d992]">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-[#b8b3b0]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <LoadingButton
                  className={`group/btn h-12 w-full font-semibold text-base transition-all duration-300 ${
                    plan.popular
                      ? "hover:-translate-y-0.5 border border-[#00d992]/70 bg-[#00d992] text-[#06110d] shadow-[0_0_24px_rgba(0,217,146,0.2)] hover:bg-[#27e9aa] hover:text-[#06110d]"
                      : plan.enterprise
                        ? "border border-[#5c5855] bg-[#050507] text-[#f2f2f2] hover:border-[#00d992]/60 hover:bg-[#101010] hover:text-[#00d992]"
                        : "border border-[#3d3a39] bg-[#050507] text-[#f2f2f2] hover:border-[#00d992]/60 hover:bg-[#101010] hover:text-[#00d992]"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleCheckout(currentCycle.id)}
                  loading={checkoutMutation.isPending}
                  loadingText={t("pricing.processing")}
                >
                  {!checkoutMutation.isPending && (
                    <>
                      {plan.cta}
                      <ArrowRight
                        size={16}
                        className="ml-1 transition-transform duration-300 group-hover/btn:translate-x-1"
                      />
                    </>
                  )}
                </LoadingButton>
              </div>
            );
          })}
        </div>
      )}

      {/* CREDIT PACKS GRID */}
      {mode === "credits" && (
        <div
          className={cn(
            "mx-auto",
            creditPacks.length === 2 ? "max-w-5xl" : "max-w-7xl",
          )}
        >
          <div className={creditPackGridClasses}>
            {creditPacks.map((pack: CreditPack) => (
              <div
                key={pack.id}
                className={cn(
                  "group relative flex h-full flex-col overflow-visible rounded-lg border bg-[#101010] p-8 transition-all duration-300",
                  "hover:-translate-y-1 shadow-[0_0_15px_rgba(92,88,85,0.14)] hover:border-[#00d992]/70 hover:shadow-[0_0_26px_rgba(0,217,146,0.14)]",
                  pack.popular
                    ? "border-[#00d992] bg-[radial-gradient(circle_at_top,_rgba(0,217,146,0.14),_transparent_48%),#101010] shadow-[0_0_34px_rgba(0,217,146,0.2)]"
                    : "border-[#3d3a39]",
                  creditPacks.length === 2 && "md:min-h-[34rem]",
                )}
              >
                {pack.popular && (
                  <div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 z-20 flex whitespace-nowrap rounded-md border border-[#00d992]/70 bg-[#00d992] px-4 py-1.5 font-bold text-[#06110d] text-xs shadow-[0_0_20px_rgba(0,217,146,0.25)]">
                    {contentData.badges.bestValue}
                  </div>
                )}

                <div className={cn("mb-6 text-center", pack.popular && "pt-4")}>
                  <h3 className="mb-3 font-semibold text-[#b8b3b0] text-base uppercase tracking-wider">
                    {pack.name}
                  </h3>
                  <div className="mb-2 font-bold text-5xl text-[#f2f2f2]">
                    {pack.credits}
                  </div>
                  <div className="font-bold text-[#00d992] text-sm uppercase tracking-wide">
                    {contentData.labels.credits}
                  </div>
                </div>

                <div className="mb-8 rounded-lg border border-[#3d3a39] bg-[#080808] p-5 text-center">
                  <div className="mb-1 font-bold text-4xl text-[#f2f2f2]">
                    ${pack.price}
                  </div>
                  <div className="font-medium text-[#817b77] text-sm">
                    {pack.perCredit}
                  </div>
                </div>

                <ul className="mb-8 flex-grow space-y-4">
                  {pack.features.map((feature: string) => (
                    <li
                      key={`${pack.id}-${feature}`}
                      className="flex items-center gap-3 text-[#b8b3b0] text-sm"
                    >
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border border-[#00d992]/35 bg-[#00d992]/10">
                        <Check
                          size={12}
                          strokeWidth={3}
                          className="text-[#00d992]"
                        />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <LoadingButton
                  variant={pack.popular ? "default" : "outline"}
                  className={`group/btn h-12 w-full font-semibold text-base transition-all duration-300 ${
                    pack.popular
                      ? "hover:-translate-y-0.5 border border-[#00d992]/70 bg-[#00d992] text-[#06110d] shadow-[0_0_24px_rgba(0,217,146,0.2)] hover:bg-[#27e9aa] hover:text-[#06110d]"
                      : "border border-[#3d3a39] bg-[#050507] text-[#f2f2f2] hover:border-[#00d992]/60 hover:bg-[#101010] hover:text-[#00d992]"
                  }`}
                  onClick={() => handleCheckout(pack.id)}
                  loading={checkoutMutation.isPending}
                  loadingText={t("pricing.processing")}
                >
                  {!checkoutMutation.isPending && (
                    <>
                      {pack.cta}
                      <ArrowRight
                        size={16}
                        className="ml-1 transition-transform duration-300 group-hover/btn:translate-x-1"
                      />
                    </>
                  )}
                </LoadingButton>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
