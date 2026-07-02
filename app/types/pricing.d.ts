export interface SubscriptionPlanCycle {
  id: string;
  price: number | string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  cycles: {
    monthly: SubscriptionPlanCycle;
    yearly: SubscriptionPlanCycle;
  };
  features: string[];
  cta: string;
  popular: boolean;
  enterprise: boolean;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  perCredit: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PricingPageContent {
  meta: {
    title: string;
    description: string;
  };
  page: {
    title: string;
    description: string;
    modeToggle: {
      subscriptions: string;
      payAsYouGo: string;
    };
    billingToggle: {
      monthly: string;
      yearly: string;
      saveText: string;
    };
    trustText: string;
    unsureSection: {
      title: string;
      description: string;
      linkText: string;
    };
  };
  faq: {
    title: string;
    description: string;
    items: FAQItem[];
  };
  subscriptionPlans: SubscriptionPlan[];
  creditPacks: CreditPack[];
  badges: {
    mostPopular: string;
    bestValue: string;
  };
  labels: {
    billedYearly: string;
    credits: string;
    perMonth: string;
  };
}
