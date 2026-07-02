import type React from "react";

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export interface FAQProps {
  items?: FAQItem[];
  title?: string;
  description?: string;
}
