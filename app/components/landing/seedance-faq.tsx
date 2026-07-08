import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQS = [
  {
    question: "What is Seedance 2.0?",
    answer:
      "Seedance 2.0 is a revolutionary multi-modal AI video generation model that supports image, video, audio, and text inputs. Unlike traditional AI video tools, Seedance 2.0 lets you reference any content - motion, effects, camera movements, characters, scenes, and sounds - using natural language descriptions. It's designed for truly controllable video creation.",
  },
  {
    question: "Do you support API access?",
    answer:
      "Yes. You can call the Seedance model through our API. Before making requests, subscribe to a plan or purchase a one-time credit pack so your account has available credits. The API is available to both individual and team users. See the API documentation for setup details.",
  },
  {
    question: "What inputs does Seedance 2.0 support?",
    answer:
      "Seedance 2.0 supports four input modalities: up to 9 images, up to 3 videos (total duration ≤15s), up to 3 audio files (MP3, total duration ≤15s), and text prompts in natural language. You can combine up to 12 files total across different modalities for maximum creative flexibility.",
  },
  {
    question: "What can I reference with Seedance 2.0?",
    answer:
      "You can reference virtually anything from your uploaded content: motion and choreography, visual effects and transitions, camera movements and angles, character appearances and styles, scene compositions, and even audio/sound. Simply describe in your prompt what you want to reference, like 'Use the camera movement from @video1 with the character style from @image1.'",
  },
  {
    question: "How does video extension work?",
    answer:
      "Seedance 2.0 can smoothly extend existing videos. Upload your video and specify how many seconds you want to add (the generation length should match your extension length, e.g., extend 5s with 5s generation). The model maintains continuity in motion, style, and content for seamless results.",
  },
  {
    question: "Can I edit existing videos with Seedance 2.0?",
    answer:
      "Yes! Seedance 2.0 supports video editing capabilities. You can replace characters, modify specific actions or segments, add new elements, or remove unwanted content - all while preserving the rest of your video. This means you can make targeted adjustments without regenerating everything from scratch.",
  },
  {
    question: "How does the audio feature work?",
    answer:
      "Seedance 2.0 includes built-in audio generation that creates context-aware sound effects and background music. You can also upload your own audio files to sync video content to specific beats or rhythms, perfect for music videos and dance content.",
  },
  {
    question: "What video lengths and resolutions are supported?",
    answer:
      "Seedance 2.0 generates videos from 4 to 15 seconds in length. Multiple aspect ratios are supported including 16:9, 9:16, 4:3, 3:4, 21:9, and 1:1. The model supports various resolutions up to 1080p for production-ready output.",
  },
  {
    question: "How is character consistency maintained?",
    answer:
      "Seedance 2.0 features significantly improved consistency for faces, clothing, text, scenes, and visual styles. The model maintains stable character appearance across frames and shots, solving common AI video problems like character drift, style inconsistency, and detail loss.",
  },
  {
    question: "Can I replicate camera movements from other videos?",
    answer:
      "Absolutely! One of Seedance 2.0's standout features is precise camera and motion replication. Upload a reference video with the camera movements or choreography you like, and the model will accurately replicate them with your own content. No detailed prompts required - just show what you want.",
  },
  {
    question: "Are there watermarks on generated videos?",
    answer:
      "Paid plans include watermark-free generation. Free-tier outputs may include a small watermark. Upgrade to any paid plan to download your videos without watermarks.",
  },
  {
    question: "How do you ensure privacy and security?",
    answer:
      "We take privacy seriously. Your uploaded assets and generated content are processed securely and are not used to train our models without your consent. Private generation options are available on paid plans.",
  },
  {
    question: "Does Seedance 2.0 support NSFW content?",
    answer:
      "No. Seedance 2.0 does not allow the generation of adult, violent, or otherwise prohibited content. We have safety filters in place and actively monitor usage to ensure compliance with our content policies.",
  },
  {
    question: "How do I get started with Seedance 2.0?",
    answer:
      "Simply sign up for an account, choose a plan or credit pack, and start creating. You can upload your assets, describe your vision in natural language, and generate your first video in minutes.",
  },
];

function FAQItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof FAQS)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="group -mx-4 flex w-full items-center justify-between rounded-lg px-4 py-6 text-left transition-colors duration-200 hover:bg-muted/30"
      >
        <div className="flex flex-1 items-center gap-4">
          <ChevronDown
            className={`h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
          <h3 className="text-base font-medium text-foreground sm:text-lg md:text-xl">
            {item.question}
          </h3>
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "500px" : "0px", opacity: isOpen ? 1 : 0 }}
      >
        <div className="pb-6 pl-9 pr-4 leading-relaxed text-muted-foreground">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export function SeedanceFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-background px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-0">
          {FAQS.map((item, index) => (
            <FAQItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
