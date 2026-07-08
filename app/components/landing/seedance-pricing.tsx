import { Check, Gift, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

const SUBSCRIPTION_PLANS = [
  {
    name: "Basic",
    description: "Ideal for hobbyists and beginners",
    perCredit: "$0.019 / credit",
    monthlyPrice: "$14.90",
    annualPrice: "$178.80/year",
    originalAnnualPrice: "$358.80",
    monthlyCredits: "800 credits/month",
    annualCredits: "9,600 credits/year",
    features: [
      "Seedance AI Video",
      "Multiple AI video models",
      "AI Image Generation",
      "Standard generation speed",
      "No watermark",
      "Private generation",
      "Customer support",
      "Commercial Use License",
    ],
    popular: false,
  },
  {
    name: "Pro",
    description: "Ideal for power users",
    perCredit: "$0.012 / credit",
    monthlyPrice: "$49.90",
    annualPrice: "$598.80/year",
    originalAnnualPrice: "$1,198.80",
    monthlyCredits: "1,600 credits/month",
    annualCredits: "19,200 credits/year",
    features: [
      "Seedance AI Video",
      "Multiple AI video models",
      "AI Image Generation",
      "Standard generation speed",
      "No watermark",
      "Private generation",
      "Priority support",
      "Commercial Use License",
    ],
    popular: true,
  },
  {
    name: "Max",
    description: "Perfect for high-usage users",
    perCredit: "$0.010 / credit",
    monthlyPrice: "$99.90",
    annualPrice: "$1,198.80/year",
    originalAnnualPrice: "$2,398.80",
    monthlyCredits: "3,200 credits/month",
    annualCredits: "38,400 credits/year",
    features: [
      "Seedance AI Video",
      "Multiple AI video models",
      "AI Image Generation",
      "Fast generation speed",
      "No watermark",
      "Private generation",
      "Priority support",
      "Commercial Use License",
    ],
    popular: false,
  },
];

const ONE_TIME_PACKS = [
  {
    name: "Starter Pack",
    description: "Great for occasional use",
    price: "$39.90",
    perCredit: "$0.040 / credit",
    credits: "1,000 credits",
  },
  {
    name: "Professional Pack",
    description: "Ideal for power users",
    price: "$199.90",
    perCredit: "$0.025 / credit",
    credits: "8,000 credits",
  },
  {
    name: "Advanced Pack",
    description: "Best for high-volume usage",
    price: "$599.90",
    perCredit: "$0.020 / credit",
    credits: "30,000 credits",
  },
  {
    name: "Ultra Pack",
    description: "Best for high-volume usage",
    price: "$1,899.90",
    perCredit: "$0.019 / credit",
    credits: "100,000 credits",
  },
  {
    name: "Max Pack",
    description: "Best for high-volume usage",
    price: "$3,599.90",
    perCredit: "$0.018 / credit",
    credits: "200,000 credits",
  },
];

export function SeedancePricing() {
  const [billingType, setBillingType] = useState<"individual" | "team">(
    "individual",
  );
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "annually",
  );

  return (
    <section className="bg-background pt-10 pb-20">
      <div className="mx-auto mb-10 max-w-2xl px-4">
        <div className="relative rounded-full border border-primary/30 p-[1px]">
          <div className="rounded-full bg-card px-6 py-3">
            <div className="relative flex items-center justify-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium text-foreground md:text-base">
                Limited Time Offer!{" "}
                <span className="font-extrabold text-primary">Save 50%</span>{" "}
                with Annual Billing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 md:px-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-center text-3xl font-semibold text-foreground md:text-5xl">
            Pricing
          </h2>
          <p className="mx-auto max-w-4xl text-xl text-muted-foreground">
            Choose the plan that works best for you. All plans include access to
            our core features.
          </p>
        </div>

        <div className="mb-4 flex justify-center">
          <div className="inline-flex h-14 items-center rounded-full border border-border bg-card p-1.5">
            <button
              type="button"
              onClick={() => setBillingType("individual")}
              className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all md:px-6 md:text-base ${
                billingType === "individual"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setBillingType("team")}
              className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all md:px-6 md:text-base ${
                billingType === "team"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Team
            </button>
          </div>
        </div>

        <div className="mb-12 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card p-1.5">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
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
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                billingCycle === "annually"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annually
              <span className="relative inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                <Gift className="h-3 w-3" />
                Save 50%
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 justify-center gap-8 md:grid-cols-2 xl:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border-t-4 bg-card p-8 shadow-sm transition-all hover:border-primary ${
                plan.popular ? "border-primary" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-[-1px] right-0 rounded-bl-lg rounded-tr-lg bg-primary px-3 py-1 text-xs text-primary-foreground">
                  Most Popular
                </div>
              )}
              <div className="mb-2 text-2xl font-semibold text-foreground">
                {plan.name}
              </div>
              <p className="mb-3 text-muted-foreground">{plan.description}</p>
              <div className="mb-2 text-sm text-muted-foreground">
                {plan.perCredit}
              </div>
              <div className="mb-4 text-4xl text-foreground">
                {billingCycle === "monthly"
                  ? plan.monthlyPrice
                  : plan.annualPrice}
                {billingCycle === "monthly" && (
                  <span className="text-sm text-muted-foreground">/month</span>
                )}
              </div>

              <div className="mb-6 text-center">
                {billingCycle === "annually" ? (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {plan.originalAnnualPrice}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {plan.annualPrice}
                    </span>
                    <span className="relative inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                      <Gift className="h-3 w-3" />
                      Save 50%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {plan.monthlyCredits}
                    </span>
                  </div>
                )}
                {billingCycle === "annually" && (
                  <div className="mt-3 flex items-center justify-center">
                    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {plan.annualCredits}
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

              <Button className="w-full rounded-md bg-card font-medium text-primary hover:bg-card/80 hover:text-primary border border-border">
                Subscribe
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <h3 className="mb-8 text-center text-2xl font-semibold text-foreground">
            One-Time Credit Packs
          </h3>
          <div className="mx-auto grid max-w-6xl grid-cols-1 justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {ONE_TIME_PACKS.map((pack) => (
              <div
                key={pack.name}
                className="rounded-xl border-t-4 border-border bg-card p-6 shadow-sm transition-all hover:border-primary"
              >
                <div className="mb-2 text-xl font-semibold text-foreground">
                  {pack.name}
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  {pack.description}
                </p>
                <div className="mb-1 text-sm text-muted-foreground">
                  {pack.perCredit}
                </div>
                <div className="mb-4 text-3xl text-foreground">
                  {pack.price}
                </div>
                <div className="mb-6 text-center">
                  <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {pack.credits}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-md border-border bg-card text-foreground hover:bg-card/80"
                >
                  One-Time Payment
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
