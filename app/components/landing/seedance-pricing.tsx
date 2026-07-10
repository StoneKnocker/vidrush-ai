import { Check, Gift, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  type CheckoutProvider,
  PaymentProviderModal,
} from "~/components/payment-provider-modal";
import { LoadingButton } from "~/components/ui/loading";
import { useAuth } from "~/hooks/use-auth";
import { useLoginModal } from "~/hooks/use-login-modal";
import { getTrpcErrorMessage } from "~/lib/trpc/error";
import { trpc } from "~/lib/trpc/trpc-provider";
import { cn } from "~/lib/utils";
import type { CreditPack, SubscriptionPlan } from "~/types/pricing";

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatCredits(amount: number): string {
  return amount.toLocaleString("en-US");
}

function asPlanList(value: unknown): SubscriptionPlan[] {
  return Array.isArray(value) ? (value as SubscriptionPlan[]) : [];
}

function asPackList(value: unknown): CreditPack[] {
  return Array.isArray(value) ? (value as CreditPack[]) : [];
}

export interface SeedancePricingProps {
  /** Landing/page: show promo banner + title. Modal: hide to avoid duplicate headers. */
  showHeader?: boolean;
  className?: string;
  /** Tighter spacing for modal / constrained layouts. */
  compact?: boolean;
}

/**
 * Plan catalog is loaded from the `pricing` locale namespace (subscriptionPlans /
 * creditPacks) so UI and SEO structured data share one source of truth.
 * Checkout plan IDs must still match `app/lib/payment/product.ts`.
 */
export function SeedancePricing({
  showHeader = true,
  className,
  compact = false,
}: SeedancePricingProps) {
  const { t } = useTranslation();
  const { t: tp } = useTranslation("pricing");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "annually",
  );
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [planAwaitingProvider, setPlanAwaitingProvider] = useState<
    string | null
  >(null);

  const subscriptionPlans = useMemo(
    () => asPlanList(tp("subscriptionPlans", { returnObjects: true })),
    [tp],
  );
  const creditPacks = useMemo(
    () => asPackList(tp("creditPacks", { returnObjects: true })),
    [tp],
  );

  const { isAuthenticated } = useAuth();
  const { openLoginModal, closeLoginModal } = useLoginModal();
  const checkoutMutation = trpc.payment.createCheckout.useMutation();
  const providersQuery = trpc.payment.listProviders.useQuery(undefined, {
    staleTime: 60_000,
  });

  const enabledProviders = (providersQuery.data?.providers ?? [
    "creem",
  ]) as CheckoutProvider[];

  const proceedWithCheckout = useCallback(
    async (planId: string, provider: CheckoutProvider = "creem") => {
      setActivePlanId(planId);
      try {
        const result = await checkoutMutation.mutateAsync({
          planId,
          provider,
        });
        window.location.href = result.checkoutUrl;
      } catch (error) {
        console.error("Error creating checkout:", error);
        toast.error(getTrpcErrorMessage(error, t("pricing.genericError")));
        setActivePlanId(null);
      }
    },
    [checkoutMutation, t],
  );

  const startCheckoutFlow = useCallback(
    async (planId: string) => {
      if (enabledProviders.length <= 1) {
        await proceedWithCheckout(planId, enabledProviders[0] ?? "creem");
        return;
      }
      setPlanAwaitingProvider(planId);
      setProviderModalOpen(true);
    },
    [enabledProviders, proceedWithCheckout],
  );

  const handleCheckout = async (planId: string) => {
    if (!isAuthenticated) {
      setPendingPlanId(planId);
      openLoginModal();
      return;
    }
    await startCheckoutFlow(planId);
  };

  useEffect(() => {
    if (isAuthenticated && pendingPlanId) {
      closeLoginModal();
      void startCheckoutFlow(pendingPlanId);
      setPendingPlanId(null);
    }
  }, [isAuthenticated, pendingPlanId, closeLoginModal, startCheckoutFlow]);

  const isCheckingOut = checkoutMutation.isPending;

  return (
    <section
      className={cn(
        "bg-background",
        compact ? "py-2" : "pt-10 pb-20",
        className,
      )}
    >
      <PaymentProviderModal
        open={providerModalOpen}
        providers={enabledProviders}
        isLoading={isCheckingOut}
        onOpenChange={(open) => {
          setProviderModalOpen(open);
          if (!open) {
            setPlanAwaitingProvider(null);
            setActivePlanId(null);
          }
        }}
        onSelect={(provider) => {
          if (!planAwaitingProvider) return;
          setProviderModalOpen(false);
          void proceedWithCheckout(planAwaitingProvider, provider);
          setPlanAwaitingProvider(null);
        }}
      />
      {showHeader && (
        <>
          <div className="mx-auto mb-10 max-w-2xl px-4">
            <div className="relative rounded-full border border-primary/30 p-[1px]">
              <div className="rounded-full bg-card px-6 py-3">
                <div className="relative flex items-center justify-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <p className="font-medium text-foreground text-sm md:text-base">
                    Limited Time Offer!{" "}
                    <span className="font-extrabold text-primary">
                      Save 50%
                    </span>{" "}
                    with Annual Billing
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mb-16 max-w-4xl px-4 text-center">
            <h2 className="mb-4 font-semibold text-3xl text-foreground md:text-5xl">
              Pricing
            </h2>
            <p className="text-muted-foreground text-xl">
              Choose the plan that works best for you. All plans include access
              to our core features.
            </p>
          </div>
        </>
      )}

      <div className={cn("mx-auto", compact ? "px-0" : "px-4 md:px-24")}>
        <div className={cn("flex justify-center", compact ? "mb-8" : "mb-12")}>
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card p-1.5">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-4 py-2 font-medium text-sm transition-all ${
                billingCycle === "monthly"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annually")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium text-sm transition-all ${
                billingCycle === "annually"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annually
              <span className="relative inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 font-bold text-[10px] text-primary">
                <Gift className="h-3 w-3" />
                Save 50%
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 justify-center gap-8 md:grid-cols-2 xl:grid-cols-4">
          {subscriptionPlans.map((plan) => {
            const monthlyPrice = plan.cycles.monthly.price;
            const yearlyPrice = plan.cycles.yearly.price;
            const planId =
              billingCycle === "monthly"
                ? plan.cycles.monthly.id
                : plan.cycles.yearly.id;
            const loadingThis = isCheckingOut && activePlanId === planId;
            const originalAnnualPrice = monthlyPrice * 12;
            const annualCredits = plan.monthlyCredits * 12;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-t-4 bg-card p-8 shadow-sm transition-all hover:border-primary ${
                  plan.popular ? "border-primary" : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-[-1px] right-0 rounded-tr-lg rounded-bl-lg bg-primary px-3 py-1 text-primary-foreground text-xs">
                    Most Popular
                  </div>
                )}
                <div className="mb-2 font-semibold text-2xl text-foreground">
                  {plan.name}
                </div>
                <p className="mb-3 text-muted-foreground">{plan.description}</p>
                <div className="mb-2 text-muted-foreground text-sm">
                  {plan.perCredit}
                </div>
                <div className="mb-4 text-4xl text-foreground">
                  {billingCycle === "monthly"
                    ? formatUsd(monthlyPrice)
                    : `${formatUsd(yearlyPrice)}/year`}
                  {billingCycle === "monthly" && (
                    <span className="text-muted-foreground text-sm">
                      /month
                    </span>
                  )}
                </div>

                <div className="mb-6 text-center">
                  {billingCycle === "annually" ? (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-muted-foreground text-sm line-through">
                        {formatUsd(originalAnnualPrice)}
                      </span>
                      <span className="font-medium text-primary text-sm">
                        {formatUsd(yearlyPrice)}/year
                      </span>
                      <span className="relative inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-bold text-[10px] text-primary">
                        <Gift className="h-3 w-3" />
                        Save 50%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
                        {formatCredits(plan.monthlyCredits)} credits/month
                      </span>
                    </div>
                  )}
                  {billingCycle === "annually" && (
                    <div className="mt-3 flex items-center justify-center">
                      <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
                        {formatCredits(annualCredits)} credits/year
                      </span>
                    </div>
                  )}
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start text-foreground"
                    >
                      <Check className="mt-1 mr-3 h-5 w-5 flex-shrink-0 text-primary" />
                      <span
                        className={
                          feature === "Commercial Use License"
                            ? "font-bold text-primary"
                            : ""
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <LoadingButton
                  className="w-full rounded-md border border-border bg-card font-medium text-primary hover:bg-card/80 hover:text-primary"
                  onClick={() => handleCheckout(planId)}
                  loading={loadingThis}
                  loadingText={t("pricing.processing")}
                  disabled={isCheckingOut && !loadingThis}
                >
                  {!loadingThis && plan.cta}
                </LoadingButton>
              </div>
            );
          })}
        </div>

        <div className={cn(compact ? "mt-12" : "mt-20")}>
          <h3 className="mb-8 text-center font-semibold text-2xl text-foreground">
            One-Time Credit Packs
          </h3>
          <div className="mx-auto grid max-w-7xl grid-cols-1 justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {creditPacks.map((pack) => {
              const loadingThis = isCheckingOut && activePlanId === pack.id;

              return (
                <div
                  key={pack.id}
                  className="rounded-xl border-border border-t-4 bg-card p-6 shadow-sm transition-all hover:border-primary"
                >
                  <div className="mb-2 font-semibold text-foreground text-xl">
                    {pack.name}
                  </div>
                  <p className="mb-2 text-muted-foreground text-sm">
                    {pack.description}
                  </p>
                  <div className="mb-1 text-muted-foreground text-sm">
                    {pack.perCredit}
                  </div>
                  <div className="mb-4 text-3xl text-foreground">
                    {formatUsd(pack.price)}
                  </div>
                  <div className="mb-6 text-center">
                    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
                      {formatCredits(pack.credits)} credits
                    </span>
                  </div>
                  <LoadingButton
                    variant="outline"
                    className="w-full rounded-md border-border bg-card text-foreground hover:bg-card/80"
                    onClick={() => handleCheckout(pack.id)}
                    loading={loadingThis}
                    loadingText={t("pricing.processing")}
                    disabled={isCheckingOut && !loadingThis}
                  >
                    {!loadingThis && pack.cta}
                  </LoadingButton>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
