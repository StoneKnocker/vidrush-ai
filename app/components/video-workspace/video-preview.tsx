import { ExternalLink, FileText, Info } from "lucide-react";
import type * as React from "react";
import { cn } from "~/lib/utils";

export interface VideoPreviewProps {
  showGuide?: boolean;
}

export function VideoPreview({ showGuide = false }: VideoPreviewProps) {
  return (
    <div className={cn("flex w-full flex-1 flex-col gap-4", "lg:w-auto")}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-black",
          "aspect-[9/16]",
        )}
      >
        <video
          className="h-full w-full object-cover"
          controls
          poster="/seedance2-assets/example-poster.webp"
          preload="metadata"
        >
          <source src="/seedance2-assets/example-video.mp4" type="video/mp4" />
        </video>
      </div>

      {showGuide && (
        <div
          className={cn(
            "flex flex-col gap-3 rounded-2xl border p-5",
            "bg-[rgb(23,23,23)]",
            "border-[rgba(40,40,40,0.5)]",
          )}
        >
          <h3 className="font-semibold text-[rgb(250,250,250)] text-lg">
            Multi Reference Guide
          </h3>

          <p className="text-[rgb(161,161,161)] text-sm leading-6">
            Seedance 2.0 supports text, image, video, and audio as input
            references. Combine multiple types of materials to guide AI video
            generation with greater precision and creative control.
          </p>

          <a
            href="#"
            className="inline-flex items-center gap-1 text-[rgb(250,250,250)] text-sm hover:underline"
          >
            For a detailed Seedance 2.0 tutorial, check out our{" "}
            <span className="font-medium">Full Guide</span>
            <ExternalLink className="h-4 w-4" />
          </a>

          <div className="flex flex-col gap-4 pt-1">
            <GuideSection
              icon={<FileText className="h-4 w-4 text-[rgb(250,250,250)]" />}
              title="Prompt Guide"
            >
              <ul className="list-disc space-y-1 pl-4 text-[rgb(161,161,161)] text-sm">
                <li>
                  Type @ to quickly insert your uploaded files into the prompt.
                </li>
                <li>
                  Select a file to insert it as a reference (e.g. @Image1,
                  @Video1, @Audio1), so the AI knows exactly which material to
                  use.
                </li>
              </ul>
            </GuideSection>

            <GuideSection
              icon={<FileText className="h-4 w-4 text-[rgb(250,250,250)]" />}
              title="Material Limits"
            >
              <ul className="list-disc space-y-1 pl-4 text-[rgb(161,161,161)] text-sm">
                <li>Up to 9 reference images</li>
                <li>Up to 3 reference videos, total duration ≤ 15 seconds</li>
                <li>Up to 3 reference audios, total duration ≤ 15 seconds</li>
                <li>Maximum 12 materials in total across all types</li>
              </ul>
            </GuideSection>

            <GuideSection
              icon={<FileText className="h-4 w-4 text-[rgb(250,250,250)]" />}
              title="Supported Input Combinations"
            >
              <ul className="list-disc space-y-1 pl-4 text-[rgb(161,161,161)] text-sm">
                <li>Text + Image</li>
                <li>Text + Video</li>
                <li>Text + Image + Video</li>
                <li>Text + Image + Audio</li>
                <li>Text + Video + Audio</li>
                <li>Text + Image + Video + Audio</li>
              </ul>
            </GuideSection>

            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(250,250,250)]" />
              <p className="text-[rgb(161,161,161)] text-sm">
                <span className="font-medium text-[rgb(250,250,250)]">
                  Note:
                </span>{" "}
                Audio cannot be used alone with text — at least one image or
                video is required.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface GuideSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function GuideSection({ icon, title, children }: GuideSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-semibold text-[rgb(250,250,250)] text-sm">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}
