import { Minus, Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { FAQProps } from "@/types/faq";

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
};

const FAQ: React.FC<FAQProps> = ({ items, title, description }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative overflow-hidden border-slate-200/60 border-t bg-gradient-to-b from-white to-indigo-50/30 py-24">
      {/* Background Elements */}
      <div className="-translate-y-1/2 pointer-events-none absolute top-0 right-0 h-96 w-96 translate-x-1/3 animate-float rounded-full bg-gradient-to-bl from-indigo-200/30 to-purple-200/20 opacity-50 blur-3xl" />
      <div
        className="-translate-x-1/3 pointer-events-none absolute bottom-0 left-0 h-96 w-96 translate-y-1/3 animate-float rounded-full bg-gradient-to-tr from-pink-200/30 to-indigo-200/20 opacity-40 blur-3xl"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 animate-fade-in-up text-center">
          <h2 className="mb-6 font-bold text-3xl text-slate-900 md:text-4xl">
            {title}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="space-y-6">
          {(items ?? []).map((faq, index) => (
            <div
              key={faq.question}
              className="animate-fade-in-up overflow-hidden rounded-2xl border border-indigo-100/50 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between p-8 text-left transition-colors hover:bg-indigo-50/50 focus:outline-none"
              >
                <span className="pr-8 font-semibold text-base text-slate-900 leading-relaxed">
                  {faq.question}
                </span>
                <div
                  className={`flex-shrink-0 transition-all duration-300 ${openIndex === index ? "rotate-180 scale-110" : ""}`}
                >
                  {openIndex === index ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-md transition-all">
                      <Minus size={22} />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-all hover:scale-110 hover:bg-indigo-200">
                      <Plus size={22} />
                    </div>
                  )}
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index
                    ? "max-h-[2000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-8 pb-8 text-base text-slate-600 leading-relaxed">
                  <ReactMarkdown components={markdownComponents}>
                    {faq.answer}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
