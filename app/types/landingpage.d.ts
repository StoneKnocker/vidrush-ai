import type { LandingIconName } from "~/components/landing/landing-icons";

export type { LandingIconName };

export interface LandingImage {
  src: string;
  alt: string;
}

export interface LandingButton {
  label: string;
  href?: string;
  to?: string;
  target?: "_self" | "_blank";
  action?: "showWorkspace";
  variant?: "primary" | "secondary" | "ghost" | "link";
  icon?: LandingIconName;
}

export interface LandingSectionBase {
  enabled?: boolean;
  id?: string;
  title?: string;
  description?: string;
}

export interface LandingHero extends LandingSectionBase {
  title: string;
  description: string;
  image?: LandingImage;
  buttons: LandingButton[];
}

export interface LandingBrandItem {
  title: string;
  icon?: LandingIconName;
  image?: LandingImage;
}

export interface LandingBrandingSection extends LandingSectionBase {
  items: LandingBrandItem[];
}

export interface LandingFeatureItem {
  title: string;
  description: string;
  icon?: LandingIconName;
  bullets?: string[];
}

export interface LandingSplitSection extends LandingSectionBase {
  image?: LandingImage;
  imagePosition?: "left" | "right";
  items: LandingFeatureItem[];
}

export interface LandingFeatureGridSection extends LandingSectionBase {
  items: LandingFeatureItem[];
}

export interface LandingUsageItem {
  title: string;
  description: string;
  icon?: LandingIconName;
  image?: LandingImage;
}

export interface LandingUsageSection extends LandingSectionBase {
  items: LandingUsageItem[];
}

export interface LandingShowcaseItem {
  title: string;
  description: string;
  image: string;
}

export interface LandingShowcaseSection extends LandingSectionBase {
  items: LandingShowcaseItem[];
}

export interface LandingStatItem {
  label: string;
  value: string;
  description: string;
  icon?: LandingIconName;
}

export interface LandingStatsSection extends LandingSectionBase {
  items: LandingStatItem[];
}

export interface LandingTestimonialItem {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  rating?: string;
}

export interface LandingTestimonialSection extends LandingSectionBase {
  items: LandingTestimonialItem[];
}

export interface LandingFaqItem {
  question: string;
  answer: string;
}

export interface LandingFaqSection extends LandingSectionBase {
  items: LandingFaqItem[];
}

export interface LandingCtaSection extends LandingSectionBase {
  button: LandingButton;
}

export interface LandingPlaygroundItem {
  title: string;
  src: string;
}

export interface LandingPlaygroundSection extends LandingSectionBase {
  items: LandingPlaygroundItem[];
}

export interface LandingPageContent {
  meta: {
    title: string;
    description: string;
  };
  hero?: LandingHero;
  branding?: LandingBrandingSection;
  introduce?: LandingSplitSection;
  benefit?: LandingSplitSection;
  usage?: LandingUsageSection;
  feature?: LandingFeatureGridSection;
  showcase?: LandingShowcaseSection;
  stats?: LandingStatsSection;
  testimonial?: LandingTestimonialSection;
  faq?: LandingFaqSection;
  cta?: LandingCtaSection;
  playground?: LandingPlaygroundSection;
}
